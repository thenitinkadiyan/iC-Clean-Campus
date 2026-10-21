import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Connection string normalization
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith('postgresql+psycopg2://')) {
  dbUrl = dbUrl.replace('postgresql+psycopg2://', 'postgresql://');
} else if (dbUrl.startsWith('postgres://')) {
  dbUrl = dbUrl.replace('postgres://', 'postgresql://');
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

let pool = null;
let supabase = null;
let dbMode = 'none'; // 'postgres' | 'supabase' | 'local'

// Empty local persistent file (only stores user-created data, no dummy items)
const localStorePath = path.resolve('./campus_data_store.json');
let localStore = {
  users: [],
  cleaning_tasks: [],
  reports: [],
  recycle_requests: [],
};

if (fs.existsSync(localStorePath)) {
  try {
    localStore = JSON.parse(fs.readFileSync(localStorePath, 'utf8'));
  } catch (err) {
    console.warn('Failed to parse local store:', err.message);
  }
}

function saveLocal() {
  try {
    fs.writeFileSync(localStorePath, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write local store:', err.message);
  }
}

export async function initDatabase() {
  // 1. Try PostgreSQL connection first (from DATABASE_URL)
  if (dbUrl) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 3500,
      });

      await pool.query('SELECT 1');
      console.log('✅ Connected to PostgreSQL database');

      // Create / alter all tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          login_id VARCHAR(255) UNIQUE NOT NULL,
          gr_number VARCHAR(255) UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'student' NOT NULL,
          area VARCHAR(255),
          points INTEGER DEFAULT 0 NOT NULL,
          streak INTEGER DEFAULT 1 NOT NULL,
          last_active_date DATE DEFAULT CURRENT_DATE
        );

        CREATE TABLE IF NOT EXISTS cleaning_tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(255) NOT NULL,
          area VARCHAR(255),
          priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
          staff_id INTEGER,
          status VARCHAR(50) DEFAULT 'assigned' NOT NULL,
          before_photo TEXT,
          after_photo TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          student_id INTEGER NOT NULL,
          problem VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          description TEXT,
          photo TEXT,
          area VARCHAR(255),
          status VARCHAR(50) DEFAULT 'submitted' NOT NULL,
          assigned_staff_id INTEGER,
          pending_reason VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS recycle_requests (
          id SERIAL PRIMARY KEY,
          student_id INTEGER,
          student_gr VARCHAR(255),
          type VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          description TEXT,
          photo TEXT,
          status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
          points INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Ensure streak & points columns exist on users
      try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 1 NOT NULL;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0 NOT NULL;');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE DEFAULT CURRENT_DATE;');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS assigned_staff_name VARCHAR(255);');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS after_photo TEXT;');
        await pool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS student_gr VARCHAR(255);');
      } catch (e) {}

      dbMode = 'postgres';
      console.log('✅ PostgreSQL tables verified & synced');
      return;
    } catch (err) {
      console.warn('⚠️  PostgreSQL connection unavailable:', err.message);
    }
  }

  // 2. Try Supabase Client
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await supabase.from('users').select('id').limit(1);
      if (!error) {
        dbMode = 'supabase';
        console.log('✅ Connected to Supabase cloud database');
        return;
      }
      console.warn('⚠️  Supabase schema check:', error.message);
    } catch (err) {
      console.warn('⚠️  Supabase connection failed:', err.message);
    }
  }

  // 3. Fallback to resilient local JSON store
  dbMode = 'local';
  console.log('ℹ️  Operating in persistent local database mode');
}

/* ================= DATABASE OPERATIONS ================= */

export const db = {
  // Users
  async findUserByLoginId(loginId) {
    if (dbMode === 'postgres') {
      const res = await pool.query('SELECT * FROM users WHERE login_id = $1', [loginId]);
      return res.rows[0] || null;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase.from('users').select('*').eq('login_id', loginId).maybeSingle();
      return data || null;
    }
    return localStore.users.find((u) => u.login_id === loginId) || null;
  },

  async findUserByGrNumber(grNumber) {
    if (dbMode === 'postgres') {
      const res = await pool.query('SELECT * FROM users WHERE gr_number = $1', [grNumber]);
      return res.rows[0] || null;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase.from('users').select('*').eq('gr_number', grNumber).maybeSingle();
      return data || null;
    }
    return localStore.users.find((u) => u.gr_number === grNumber) || null;
  },

  async findUserById(id) {
    if (dbMode === 'postgres') {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      return data || null;
    }
    return localStore.users.find((u) => u.id === Number(id)) || null;
  },

  async createUser({ name, login_id, gr_number, password, role, area }) {
    if (dbMode === 'postgres') {
      const res = await pool.query(
        `INSERT INTO users (name, login_id, gr_number, password, role, area, points, streak)
         VALUES ($1, $2, $3, $4, $5, $6, 0, 1)
         RETURNING *`,
        [name, login_id, gr_number || null, password, role, area || null]
      );
      return res.rows[0];
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase
        .from('users')
        .insert({
          name,
          login_id,
          gr_number: gr_number || null,
          password,
          role,
          area: area || null,
          points: 0,
          streak: 1,
        })
        .select()
        .single();
      return data;
    }
    const newUser = {
      id: localStore.users.length ? Math.max(...localStore.users.map((u) => u.id)) + 1 : 1,
      name,
      login_id,
      gr_number: gr_number || null,
      password,
      role,
      area: area || null,
      points: 0,
      streak: 1,
    };
    localStore.users.push(newUser);
    saveLocal();
    return newUser;
  },

  async addPointsToUser(identifier, pointsToAdd) {
    const pts = Number(pointsToAdd) || 0;
    if (pts <= 0) return 0;

    if (dbMode === 'postgres') {
      const res = await pool.query(
        `UPDATE users
         SET points = points + $1
         WHERE id::text = $2 OR gr_number = $2 OR login_id = $2
         RETURNING points`,
        [pts, String(identifier)]
      );
      return res.rows[0]?.points || 0;
    }

    if (dbMode === 'supabase') {
      const user = await this.findUserByLoginId(identifier) || await this.findUserByGrNumber(identifier) || await this.findUserById(identifier);
      if (user) {
        const newTotal = (user.points || 0) + pts;
        await supabase.from('users').update({ points: newTotal }).eq('id', user.id);
        return newTotal;
      }
      return 0;
    }

    const user = localStore.users.find(
      (u) => String(u.id) === String(identifier) || u.gr_number === identifier || u.login_id === identifier
    );
    if (user) {
      user.points = (user.points || 0) + pts;
      saveLocal();
      return user.points;
    }
    return 0;
  },

  async updateUserStreak(userId) {
    if (dbMode === 'postgres') {
      const res = await pool.query(
        `UPDATE users
         SET streak = CASE
           WHEN last_active_date = CURRENT_DATE THEN streak
           WHEN last_active_date = CURRENT_DATE - 1 THEN streak + 1
           ELSE 1
         END,
         last_active_date = CURRENT_DATE
         WHERE id = $1
         RETURNING streak`,
        [userId]
      );
      return res.rows[0]?.streak || 1;
    }
    const user = await this.findUserById(userId);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      if (user.last_active_date !== today) {
        user.streak = (user.streak || 1) + 1;
        user.last_active_date = today;
        if (dbMode === 'supabase') {
          await supabase.from('users').update({ streak: user.streak, last_active_date: today }).eq('id', userId);
        } else {
          saveLocal();
        }
      }
      return user.streak || 1;
    }
    return 1;
  },

  async updateUserPassword(userId, hashedPassword) {
    if (dbMode === 'postgres') {
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
      return true;
    }
    if (dbMode === 'supabase') {
      await supabase.from('users').update({ password: hashedPassword }).eq('id', userId);
      return true;
    }
    const user = localStore.users.find((u) => u.id === Number(userId));
    if (user) {
      user.password = hashedPassword;
      saveLocal();
      return true;
    }
    return false;
  },

  async getAllUsersByRole(role) {
    if (dbMode === 'postgres') {
      const res = await pool.query('SELECT * FROM users WHERE role = $1 ORDER BY id DESC', [role]);
      return res.rows;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase.from('users').select('*').eq('role', role).order('id', { ascending: false });
      return data || [];
    }
    return localStore.users.filter((u) => u.role === role).sort((a, b) => b.id - a.id);
  },

  async getLeaderboard() {
    if (dbMode === 'postgres') {
      const res = await pool.query(
        'SELECT id, name, gr_number, points, streak FROM users WHERE role = $1 ORDER BY points DESC LIMIT 50',
        ['student']
      );
      return res.rows;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase
        .from('users')
        .select('id, name, gr_number, points, streak')
        .eq('role', 'student')
        .order('points', { ascending: false });
      return data || [];
    }
    return localStore.users
      .filter((u) => u.role === 'student')
      .map(({ id, name, gr_number, points, streak }) => ({ id, name, gr_number, points: points || 0, streak: streak || 1 }))
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  },

  // Cleaning Tasks
  async createCleaningTask({ title, description, location, area, priority, staff_id }) {
    if (dbMode === 'postgres') {
      const res = await pool.query(
        `INSERT INTO cleaning_tasks (title, description, location, area, priority, staff_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'assigned')
         RETURNING *`,
        [title, description || '', location, area || '', priority || 'medium', staff_id]
      );
      return res.rows[0];
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase
        .from('cleaning_tasks')
        .insert({
          title,
          description: description || '',
          location,
          area: area || '',
          priority: priority || 'medium',
          staff_id: Number(staff_id),
          status: 'assigned',
        })
        .select()
        .single();
      return data;
    }
    const newTask = {
      id: localStore.cleaning_tasks.length ? Math.max(...localStore.cleaning_tasks.map((t) => t.id)) + 1 : 1,
      title,
      description: description || '',
      location,
      area: area || '',
      priority: priority || 'medium',
      staff_id: Number(staff_id),
      status: 'assigned',
      created_at: new Date().toISOString(),
    };
    localStore.cleaning_tasks.push(newTask);
    saveLocal();
    return newTask;
  },

  async getStaffCleaningTasks(staffId) {
    if (dbMode === 'postgres') {
      const res = await pool.query(
        'SELECT * FROM cleaning_tasks WHERE staff_id = $1 ORDER BY id DESC',
        [staffId]
      );
      return res.rows;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('staff_id', staffId)
        .order('id', { ascending: false });
      return data || [];
    }
    return localStore.cleaning_tasks.filter((t) => t.staff_id === Number(staffId));
  },

  async updateCleaningTask(taskId, updates) {
    if (dbMode === 'postgres') {
      const fields = [];
      const values = [];
      Object.keys(updates).forEach((k) => {
        values.push(updates[k]);
        fields.push(`${k} = $${values.length}`);
      });
      values.push(taskId);
      const res = await pool.query(
        `UPDATE cleaning_tasks SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return res.rows[0] || null;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase.from('cleaning_tasks').update(updates).eq('id', taskId).select().single();
      return data;
    }
    const task = localStore.cleaning_tasks.find((t) => t.id === Number(taskId));
    if (task) {
      Object.assign(task, updates);
      saveLocal();
      return task;
    }
    return null;
  },

  // Reports
  async createReport({ student_id, student_gr, problem, location, description, photo, area }) {
    if (dbMode === 'postgres') {
      const res = await pool.query(
        `INSERT INTO reports (student_id, student_gr, problem, location, description, photo, area, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted')
         RETURNING *`,
        [student_id, student_gr || '', problem, location, description || '', photo || '', area || '']
      );
      return res.rows[0];
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase
        .from('reports')
        .insert({
          student_id: Number(student_id),
          student_gr: student_gr || '',
          problem,
          location,
          description: description || '',
          photo: photo || '',
          area: area || '',
          status: 'submitted',
        })
        .select()
        .single();
      return data;
    }
    const newReport = {
      id: localStore.reports.length ? Math.max(...localStore.reports.map((r) => r.id)) + 1 : 1,
      student_id: Number(student_id),
      student_gr: student_gr || '',
      problem,
      location,
      description: description || '',
      photo: photo || '',
      area: area || '',
      status: 'submitted',
      assigned_staff_id: null,
      assigned_staff_name: null,
      pending_reason: null,
      created_at: new Date().toISOString(),
    };
    localStore.reports.unshift(newReport);
    saveLocal();
    return newReport;
  },

  async getReports(filter = {}) {
    if (dbMode === 'postgres') {
      let queryStr = 'SELECT * FROM reports';
      const params = [];
      const conditions = [];

      if (filter.student_id) {
        params.push(filter.student_id);
        conditions.push(`student_id = $${params.length}`);
      }
      if (filter.area) {
        params.push(filter.area);
        conditions.push(`area = $${params.length}`);
      }
      if (filter.assigned_staff_id) {
        params.push(filter.assigned_staff_id);
        conditions.push(`assigned_staff_id = $${params.length}`);
      }

      if (conditions.length) {
        queryStr += ' WHERE ' + conditions.join(' AND ');
      }
      queryStr += ' ORDER BY id DESC';

      const res = await pool.query(queryStr, params);
      return res.rows;
    }

    if (dbMode === 'supabase') {
      let query = supabase.from('reports').select('*').order('id', { ascending: false });
      if (filter.student_id) query = query.eq('student_id', filter.student_id);
      if (filter.area) query = query.eq('area', filter.area);
      if (filter.assigned_staff_id) query = query.eq('assigned_staff_id', filter.assigned_staff_id);

      const { data } = await query;
      return data || [];
    }

    let list = [...localStore.reports];
    if (filter.student_id) list = list.filter((r) => r.student_id === Number(filter.student_id));
    if (filter.area) list = list.filter((r) => r.area === filter.area);
    if (filter.assigned_staff_id) list = list.filter((r) => r.assigned_staff_id === Number(filter.assigned_staff_id));
    return list.sort((a, b) => b.id - a.id);
  },

  async updateReport(reportId, rawUpdates = {}) {
    const allowed = [
      'status',
      'assigned_staff_id',
      'assigned_staff_name',
      'pending_reason',
      'photo',
      'after_photo',
      'description',
      'problem',
      'location',
      'area',
    ];

    const updates = {};
    if (rawUpdates.assignedStaff && !rawUpdates.assigned_staff_name) {
      updates.assigned_staff_name = rawUpdates.assignedStaff;
    }
    for (const [k, v] of Object.entries(rawUpdates)) {
      if (allowed.includes(k)) {
        updates[k] = v;
      }
    }

    if (dbMode === 'postgres') {
      const keys = Object.keys(updates);
      if (keys.length === 0) return this.findReportById(reportId);
      const fields = [];
      const values = [];
      keys.forEach((k) => {
        values.push(updates[k]);
        fields.push(`${k} = $${values.length}`);
      });
      values.push(reportId);
      const res = await pool.query(
        `UPDATE reports SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return res.rows[0] || null;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase.from('reports').update(updates).eq('id', reportId).select().single();
      return data;
    }
    const report = localStore.reports.find((r) => r.id === Number(reportId));
    if (report) {
      Object.assign(report, updates);
      saveLocal();
      return report;
    }
    return null;
  },

  async findReportById(reportId) {
    if (dbMode === 'postgres') {
      const res = await pool.query('SELECT * FROM reports WHERE id = $1', [reportId]);
      return res.rows[0] || null;
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle();
      return data || null;
    }
    return localStore.reports.find((r) => r.id === Number(reportId)) || null;
  },

  async getAdminStats(area = null) {
    const allReports = await this.getReports(area ? { area } : {});
    const inProgress = allReports.filter((r) =>
      ['assigned', 'cleaning', 'in_progress', 'In Progress', 'verification pending'].includes(
        (r.status || '').toLowerCase()
      )
    ).length;
    const resolved = allReports.filter((r) =>
      ['resolved', 'Resolved'].includes(r.status)
    ).length;
    const pending = allReports.filter(
      (r) =>
        !['resolved', 'Resolved', 'assigned', 'cleaning', 'in_progress', 'In Progress', 'verification pending'].includes(
          (r.status || '').toLowerCase()
        )
    ).length;

    return {
      total_reports: allReports.length,
      in_progress: inProgress,
      resolved: resolved,
      pending: pending,
    };
  },

  // Recycle Requests
  async createRecycleRequest({ student_id, student_gr, type, location, description, photo }) {
    if (dbMode === 'postgres') {
      const res = await pool.query(
        `INSERT INTO recycle_requests (student_id, student_gr, type, location, description, photo, status, points)
         VALUES ($1, $2, $3, $4, $5, $6, 'Pending', 0)
         RETURNING *`,
        [student_id || null, student_gr || '', type, location, description || '', photo || '']
      );
      return res.rows[0];
    }
    if (dbMode === 'supabase') {
      const { data } = await supabase
        .from('recycle_requests')
        .insert({
          student_id: student_id || null,
          student_gr: student_gr || '',
          type,
          location,
          description: description || '',
          photo: photo || '',
          status: 'Pending',
          points: 0,
        })
        .select()
        .single();
      return data;
    }
    const newReq = {
      id: localStore.recycle_requests.length ? Math.max(...localStore.recycle_requests.map((r) => r.id)) + 1 : 1,
      student_id: student_id || null,
      student_gr: student_gr || '',
      type,
      location,
      description: description || '',
      photo: photo || '',
      status: 'Pending',
      points: 0,
      created_at: new Date().toISOString(),
    };
    localStore.recycle_requests.unshift(newReq);
    saveLocal();
    return newReq;
  },

  async getRecycleRequests(filter = {}) {
    if (dbMode === 'postgres') {
      let queryStr = 'SELECT * FROM recycle_requests';
      const params = [];
      if (filter.student_id) {
        params.push(filter.student_id);
        queryStr += ' WHERE student_id = $1';
      }
      queryStr += ' ORDER BY id DESC';
      const res = await pool.query(queryStr, params);
      return res.rows;
    }
    if (dbMode === 'supabase') {
      let query = supabase.from('recycle_requests').select('*').order('id', { ascending: false });
      if (filter.student_id) query = query.eq('student_id', filter.student_id);
      const { data } = await query;
      return data || [];
    }
    let list = [...localStore.recycle_requests];
    if (filter.student_id) list = list.filter((r) => r.student_id === Number(filter.student_id));
    return list.sort((a, b) => b.id - a.id);
  },

  async acceptRecycleRequest(id, pointsAwarded) {
    const pts = Number(pointsAwarded) || 15;

    if (dbMode === 'postgres') {
      const res = await pool.query(
        `UPDATE recycle_requests
         SET status = 'Accepted', points = $1
         WHERE id = $2
         RETURNING *`,
        [pts, id]
      );
      const req = res.rows[0];
      if (req && (req.student_id || req.student_gr)) {
        await this.addPointsToUser(req.student_id || req.student_gr, pts);
      }
      return req;
    }

    if (dbMode === 'supabase') {
      const { data } = await supabase
        .from('recycle_requests')
        .update({ status: 'Accepted', points: pts })
        .eq('id', id)
        .select()
        .single();
      if (data && (data.student_id || data.student_gr)) {
        await this.addPointsToUser(data.student_id || data.student_gr, pts);
      }
      return data;
    }

    const item = localStore.recycle_requests.find((r) => r.id === Number(id));
    if (item) {
      item.status = 'Accepted';
      item.points = pts;
      if (item.student_id || item.student_gr) {
        await this.addPointsToUser(item.student_id || item.student_gr, pts);
      }
      saveLocal();
      return item;
    }
    return null;
  },
};
