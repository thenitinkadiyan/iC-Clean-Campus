import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { initDatabase, db } from './db.js';
import {
  createAccessToken,
  hashPassword,
  verifyPassword,
  authenticate,
  requireRole,
  requireMainAdmin,
} from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;
const MAIN_ADMIN_ID = process.env.MAIN_ADMIN_ID || '2707';
const MAIN_ADMIN_PASSWORD = process.env.MAIN_ADMIN_PASSWORD || 'Nitin@2007';

// Middleware
app.use(morgan('dev'));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

/* ================= PUBLIC ENDPOINTS ================= */

// Health check / Root
app.get('/', (req, res) => {
  res.json({
    message: 'iC Clean Campus Backend is Running (Node.js Express)',
    status: 'online',
    version: '1.0.0',
  });
});

// Student Registration
app.post('/register', async (req, res) => {
  try {
    const { name, gr_number, password } = req.body;

    if (!name?.trim() || !gr_number?.trim() || !password) {
      return res.status(400).json({ detail: 'Name, GR Number and Password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ detail: 'Password must contain at least 6 characters.' });
    }

    const trimmedGR = gr_number.trim();
    const existing = await db.findUserByGrNumber(trimmedGR);
    if (existing) {
      return res.status(409).json({ detail: 'GR Number already registered.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.createUser({
      name: name.trim(),
      login_id: trimmedGR,
      gr_number: trimmedGR,
      password: hashedPassword,
      role: 'student',
      area: null,
    });

    res.json({
      message: 'Student registered successfully',
      student_id: user.id,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ detail: 'Internal server error during registration.' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { login_id, password } = req.body;

    if (!login_id?.trim() || !password) {
      return res.status(400).json({ detail: 'ID and Password are required.' });
    }

    const trimmedLogin = login_id.trim();

    // Check Main Admin Credentials
    if (trimmedLogin === MAIN_ADMIN_ID && password === MAIN_ADMIN_PASSWORD) {
      const token = createAccessToken({
        user_id: 0,
        login_id: MAIN_ADMIN_ID,
        role: 'main_admin',
        name: 'Main Admin',
        area: null,
      });

      return res.json({
        message: 'Login successful',
        access_token: token,
        token_type: 'bearer',
        user_id: 0,
        name: 'Main Admin',
        login_id: MAIN_ADMIN_ID,
        role: 'main_admin',
        gr_number: null,
        area: null,
        points: 0,
        streak: 1,
      });
    }

    // Check Database User
    const user = await db.findUserByLoginId(trimmedLogin) || await db.findUserByGrNumber(trimmedLogin);
    if (!user) {
      return res.status(401).json({ detail: 'Invalid ID or Password.' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ detail: 'Invalid ID or Password.' });
    }

    // Update streak on successful student login
    let currentStreak = user.streak || 1;
    if (user.role === 'student') {
      currentStreak = await db.updateUserStreak(user.id);
    }

    const token = createAccessToken({
      user_id: user.id,
      login_id: user.login_id,
      role: user.role,
      name: user.name,
      area: user.area,
    });

    res.json({
      message: 'Login successful',
      access_token: token,
      token_type: 'bearer',
      user_id: user.id,
      name: user.name,
      login_id: user.login_id,
      gr_number: user.gr_number,
      role: user.role,
      area: user.area,
      points: user.points || 0,
      streak: currentStreak,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ detail: 'Internal server error during login.' });
  }
});

/* ================= AUTHENTICATED ENDPOINTS ================= */

// Current User Profile (Live points and streak sync)
app.get('/me', authenticate, async (req, res) => {
  if (req.user.role === 'main_admin') {
    return res.json({
      user_id: 0,
      name: 'Main Admin',
      login_id: MAIN_ADMIN_ID,
      gr_number: null,
      role: 'main_admin',
      area: null,
      points: 0,
      streak: 1,
    });
  }

  const freshUser = await db.findUserById(req.user.id);
  res.json({
    user_id: freshUser.id,
    name: freshUser.name,
    login_id: freshUser.login_id,
    gr_number: freshUser.gr_number || null,
    role: freshUser.role,
    area: freshUser.area || null,
    points: freshUser.points || 0,
    streak: freshUser.streak || 1,
  });
});

// Student Leaderboard (Real DB points sorted descending)
app.get('/students/leaderboard', authenticate, async (req, res) => {
  try {
    const list = await db.getLeaderboard();
    res.json(list);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ detail: 'Error fetching leaderboard.' });
  }
});

// Award Points endpoint
app.post('/students/:identifier/points', authenticate, async (req, res) => {
  try {
    const { identifier } = req.params;
    const { points } = req.body;
    const newTotal = await db.addPointsToUser(identifier, points);
    res.json({ message: 'Points awarded', points: newTotal });
  } catch (err) {
    res.status(500).json({ detail: 'Failed to award points' });
  }
});

/* ================= REPORTS ENDPOINTS ================= */

// Submit Cleanliness Report
app.post('/reports', authenticate, async (req, res) => {
  try {
    const { student_id, problem, location, description, photo, area } = req.body;
    const currentId = req.user.id;
    const role = req.user.role;

    if (role === 'student' && currentId !== Number(student_id)) {
      return res.status(403).json({ detail: 'You can only submit reports for yourself.' });
    }

    if (!problem?.trim() || !location?.trim()) {
      return res.status(400).json({ detail: 'Problem and Location are required.' });
    }

    const report = await db.createReport({
      student_id: Number(student_id) || currentId,
      student_gr: req.user.gr_number || req.body.studentGR || '',
      problem: problem.trim(),
      location: location.trim(),
      description: (description || '').trim(),
      photo: photo || '',
      area: (area || '').trim(),
    });

    // Auto-award 10 points to student for submitting valid report!
    if (role === 'student') {
      await db.addPointsToUser(currentId, 10);
    }

    res.json({
      message: 'Report submitted successfully',
      report_id: report.id,
      status: report.status,
    });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ detail: 'Error submitting report.' });
  }
});

// Get Cleanliness Reports (Role-filtered)
app.get('/reports', authenticate, async (req, res) => {
  try {
    const role = req.user.role;
    let filter = {};

    if (role === 'student') {
      filter.student_id = req.user.id;
    } else if (role === 'admin') {
      if (req.user.area) {
        filter.area = req.user.area;
      }
    } else if (role === 'staff') {
      filter.assigned_staff_id = req.user.id;
    }

    const reports = await db.getReports(filter);
    res.json(reports);
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ detail: 'Error fetching reports.' });
  }
});

// Update Report (Assign staff, update status, complete cleaning)
app.patch('/reports/:id', authenticate, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const updates = req.body; // { status, assigned_staff_id, photo, etc. }

    const report = await db.updateReport(reportId, updates);
    if (!report) {
      return res.status(404).json({ detail: 'Report not found' });
    }

    // If marked Resolved, award bonus points to the student if not already awarded
    if (updates.status === 'Resolved' && report.student_id) {
      await db.addPointsToUser(report.student_id, 10);
    }

    res.json({ message: 'Report updated', report });
  } catch (err) {
    res.status(500).json({ detail: 'Error updating report' });
  }
});

// Area Admin Stats
app.get('/admin/stats', authenticate, requireRole('main_admin', 'admin'), async (req, res) => {
  try {
    const area = req.user.role === 'admin' ? req.user.area : null;
    const stats = await db.getAdminStats(area);
    res.json(stats);
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ detail: 'Error calculating stats.' });
  }
});

// Get Staff Members
app.get('/staff', authenticate, requireRole('main_admin', 'admin'), async (req, res) => {
  try {
    const role = req.user.role;
    let staffMembers = await db.getAllUsersByRole('staff');

    if (role === 'admin' && req.user.area) {
      staffMembers = staffMembers.filter((s) => s.area === req.user.area);
    }

    res.json(
      staffMembers.map((s) => ({
        user_id: s.id,
        name: s.name,
        login_id: s.login_id,
        area: s.area,
      }))
    );
  } catch (err) {
    console.error('Staff list error:', err);
    res.status(500).json({ detail: 'Error loading staff.' });
  }
});

/* ================= CLEANING TASKS ================= */

// Create Task
app.post('/cleaning-tasks', authenticate, requireRole('main_admin', 'admin'), async (req, res) => {
  try {
    const { title, description, location, area, priority, staff_id } = req.body;

    const staff = await db.findUserById(staff_id);
    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ detail: 'Staff member not found.' });
    }

    const task = await db.createCleaningTask({
      title: title.trim(),
      description: (description || '').trim(),
      location: location.trim(),
      area: (area || staff.area || '').trim(),
      priority: (priority || 'medium').trim().toLowerCase(),
      staff_id: Number(staff_id),
    });

    res.json({
      message: 'Cleaning task assigned successfully',
      task_id: task.id,
      staff_id: task.staff_id,
      area: task.area,
      status: task.status,
    });
  } catch (err) {
    console.error('Create cleaning task error:', err);
    res.status(500).json({ detail: 'Error creating cleaning task.' });
  }
});

// Get Staff Assigned Tasks
app.get('/cleaning-tasks/staff/:staff_id', authenticate, requireRole('main_admin', 'admin', 'staff'), async (req, res) => {
  try {
    const staffId = Number(req.params.staff_id);
    const tasks = await db.getStaffCleaningTasks(staffId);
    res.json(tasks);
  } catch (err) {
    console.error('Get staff tasks error:', err);
    res.status(500).json({ detail: 'Error loading tasks.' });
  }
});

/* ================= RECYCLE REQUESTS ================= */

// Submit Recycle Request
app.post('/recycle-requests', authenticate, async (req, res) => {
  try {
    const { type, location, description, photo } = req.body;
    const studentId = req.user.id;
    const studentGR = req.user.gr_number || req.user.login_id || '';

    const newReq = await db.createRecycleRequest({
      student_id: studentId,
      student_gr: studentGR,
      type,
      location,
      description,
      photo,
    });

    res.json({ message: 'Recycle request submitted', request: newReq });
  } catch (err) {
    res.status(500).json({ detail: 'Error submitting recycle request' });
  }
});

// Get Recycle Requests
app.get('/recycle-requests', authenticate, async (req, res) => {
  try {
    const role = req.user.role;
    let filter = {};
    if (role === 'student') {
      filter.student_id = req.user.id;
    }
    const list = await db.getRecycleRequests(filter);
    res.json(list);
  } catch (err) {
    res.status(500).json({ detail: 'Error fetching recycle requests' });
  }
});

// Accept Recycle Request & Award Points
app.post('/recycle-requests/:id/accept', authenticate, requireRole('main_admin', 'admin'), async (req, res) => {
  try {
    const reqId = Number(req.params.id);
    const { points } = req.body;
    const accepted = await db.acceptRecycleRequest(reqId, points || 15);
    res.json({ message: 'Recycle request accepted and points awarded', request: accepted });
  } catch (err) {
    res.status(500).json({ detail: 'Error approving recycle request' });
  }
});

/* ================= MAIN ADMIN MANAGEMENT ================= */

// Add Admin or Staff
app.post('/main-admin/add-user', authenticate, requireMainAdmin, async (req, res) => {
  try {
    const { name, login_id, password, role, area } = req.body;
    const lowerRole = (role || '').trim().toLowerCase();

    if (!['admin', 'staff'].includes(lowerRole)) {
      return res.status(400).json({ detail: 'Role must be admin or staff.' });
    }

    if (!name?.trim() || !login_id?.trim() || !password || !area?.trim()) {
      return res.status(400).json({ detail: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ detail: 'Password must contain at least 6 characters.' });
    }

    const existing = await db.findUserByLoginId(login_id.trim());
    if (existing) {
      return res.status(409).json({ detail: 'Login ID already registered.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.createUser({
      name: name.trim(),
      login_id: login_id.trim(),
      gr_number: null,
      password: hashedPassword,
      role: lowerRole,
      area: area.trim(),
    });

    res.json({
      message: `${lowerRole.charAt(0).toUpperCase() + lowerRole.slice(1)} created successfully`,
      user_id: user.id,
      name: user.name,
      login_id: user.login_id,
      area: user.area,
      role: user.role,
    });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ detail: 'Error provisioning user.' });
  }
});

// Reset Password
app.post('/main-admin/users/:user_id/reset-password', authenticate, requireMainAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.user_id);
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ detail: 'Password must contain at least 6 characters.' });
    }

    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ detail: 'User not found.' });
    }

    const hashedPassword = await hashPassword(new_password);
    await db.updateUserPassword(userId, hashedPassword);

    res.json({
      message: 'Password reset successfully',
      user_id: user.id,
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ detail: 'Error resetting password.' });
  }
});

// Main Admin Overview
app.get('/main-admin/overview', authenticate, requireMainAdmin, async (req, res) => {
  try {
    const [students, admins, staff, allReports] = await Promise.all([
      db.getAllUsersByRole('student'),
      db.getAllUsersByRole('admin'),
      db.getAllUsersByRole('staff'),
      db.getReports(),
    ]);

    res.json({
      counts: {
        students: students.length,
        admins: admins.length,
        staff: staff.length,
        reports: allReports.length,
      },
      students: students.map((u) => ({
        id: u.id,
        name: u.name,
        login_id: u.login_id,
        gr_number: u.gr_number,
        role: u.role,
        area: u.area,
        points: u.points || 0,
      })),
      admins: admins.map((u) => ({
        id: u.id,
        name: u.name,
        login_id: u.login_id,
        role: u.role,
        area: u.area,
      })),
      staff: staff.map((u) => ({
        id: u.id,
        name: u.name,
        login_id: u.login_id,
        role: u.role,
        area: u.area,
      })),
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ detail: 'Error generating overview.' });
  }
});

// Main Admin Full Overview
app.get('/main-admin/full-overview', authenticate, requireMainAdmin, async (req, res) => {
  try {
    const [students, admins, staff, reports] = await Promise.all([
      db.getAllUsersByRole('student'),
      db.getAllUsersByRole('admin'),
      db.getAllUsersByRole('staff'),
      db.getReports(),
    ]);

    res.json({
      counts: {
        students: students.length,
        admins: admins.length,
        staff: staff.length,
        reports: reports.length,
      },
      students: students.map((u) => ({
        id: u.id,
        name: u.name,
        login_id: u.login_id,
        gr_number: u.gr_number,
        role: u.role,
        area: u.area,
        points: u.points || 0,
      })),
      admins: admins.map((u) => ({
        id: u.id,
        name: u.name,
        login_id: u.login_id,
        role: u.role,
        area: u.area,
      })),
      staff: staff.map((u) => ({
        id: u.id,
        name: u.name,
        login_id: u.login_id,
        role: u.role,
        area: u.area,
      })),
      reports: reports.map((r) => ({
        id: r.id,
        student_id: r.student_id,
        problem: r.problem,
        location: r.location,
        description: r.description,
        area: r.area,
        status: r.status,
        assigned_staff_id: r.assigned_staff_id,
        pending_reason: r.pending_reason,
      })),
    });
  } catch (err) {
    console.error('Full overview error:', err);
    res.status(500).json({ detail: 'Error generating full overview.' });
  }
});

/* ================= SERVER START ================= */

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 iC Clean Campus Node.js backend listening on http://localhost:${PORT}`);
  });
}

start();
