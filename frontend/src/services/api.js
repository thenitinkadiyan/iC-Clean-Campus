/**
 * API Service for iC Clean Campus
 * Connects to live Node.js Express backend with seamless offline/client fallback
 * so the app never crashes with "Failed to fetch" on Vercel or when the backend is offline.
 */

const DEFAULT_API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8001'
    : 'https://ic-clean-campus.onrender.com');

export function getApiBaseUrl() {
  if (typeof window === 'undefined') return DEFAULT_API_BASE;
  return localStorage.getItem('custom_api_url') || DEFAULT_API_BASE;
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (token) return token;
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  return user?.access_token || null;
}

/* ================= OFFLINE / LOCAL CLIENT STORE ================= */

const INITIAL_LOCAL_REPORTS = [
  {
    id: 1,
    student_id: 'GR101',
    problem: 'Overflowing dustbin near Block B cafeteria',
    location: 'Cafeteria Outside - Block B',
    description: 'Waste bin is completely full and plastic wrappers are spilling onto the pathway.',
    photo: '',
    area: 'Block B',
    status: 'In Progress',
    assigned_staff_id: 'ST101',
    pending_reason: '',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 2,
    student_id: 'GR102',
    problem: 'Dry leaves and organic waste accumulated near library lawn',
    location: 'Central Library Pathway',
    description: 'Requires sweeping and composting transfer.',
    photo: '',
    area: 'Central Lawn',
    status: 'Pending',
    assigned_staff_id: null,
    pending_reason: 'Awaiting crew assignment',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 3,
    student_id: '2707',
    problem: 'Empty water bottles scattered around sports complex',
    location: 'Sports Ground Pavilion',
    description: 'Leftover PET bottles after inter-college sports event.',
    photo: '',
    area: 'Sports Complex',
    status: 'Completed',
    assigned_staff_id: 'ST101',
    pending_reason: '',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const INITIAL_LOCAL_RECYCLE = [
  {
    id: 1,
    user_id: 'GR101',
    types: 'Plastic Bottles, Paper',
    type: 'Plastic Bottles, Paper',
    location: 'Hostel 3 Common Room',
    description: '15 cleaned PET bottles and cardboard packaging boxes.',
    status: 'Pending',
    points_awarded: 0,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 2,
    user_id: 'GR102',
    types: 'E-Waste',
    type: 'E-Waste',
    location: 'Computer Science Lab 4',
    description: 'Old faulty keyboard and obsolete cables for recycling.',
    status: 'Accepted',
    points_awarded: 25,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
];

const INITIAL_LOCAL_USERS = [
  {
    id: '0',
    login_id: '2707',
    password: 'Nitin@2007',
    name: 'Main Administrator',
    role: 'main_admin',
    area: 'All Campus',
    points: 120,
    streak: 8,
  },
  {
    id: '1',
    login_id: 'ST101',
    password: 'password123',
    name: 'Ramesh Kumar',
    role: 'staff',
    area: 'Block B',
    points: 80,
    streak: 5,
  },
  {
    id: '2',
    login_id: 'GR101',
    password: 'password123',
    name: 'Aarav Sharma',
    role: 'student',
    gr_number: 'GR101',
    points: 45,
    streak: 4,
  },
];

function getLocalStore(key, defaultValue) {
  try {
    const raw = localStorage.getItem(`local_${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStore(key, value) {
  try {
    localStorage.setItem(`local_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Local store save failed:', e);
  }
}

/* ================= CORE REQUEST HANDLER ================= */

async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Attempt real network call with a 3.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.detail || data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // If it was an explicit HTTP error from backend (like wrong password 401), rethrow it
    if (err.status && err.status !== 502 && err.status !== 503) {
      throw err;
    }
    // Otherwise it was a network error (backend down / offline / Vercel without cloud API)
    console.info(`[Offline Fallback Active] Backend unavailable at ${baseUrl}, handling locally: ${endpoint}`);
    return handleOfflineFallback(endpoint, options);
  }
}

/* ================= OFFLINE FALLBACK ROUTER ================= */

function handleOfflineFallback(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 1. Login
  if (endpoint === '/login' && method === 'POST') {
    const { login_id, password } = body;
    const users = getLocalStore('users', INITIAL_LOCAL_USERS);

    // Direct check for main admin
    if (login_id === '2707' && password === 'Nitin@2007') {
      return {
        message: 'Login successful (Offline/Demo Mode)',
        access_token: 'mock-jwt-token-main-admin-' + Date.now(),
        token_type: 'bearer',
        user_id: '0',
        name: 'Main Administrator',
        login_id: '2707',
        role: 'main_admin',
        area: 'All Campus',
        points: 120,
        streak: 8,
      };
    }

    // Check other registered mock users
    const matched = users.find(
      (u) => (u.login_id === login_id || u.gr_number === login_id) && u.password === password
    );

    if (matched) {
      return {
        message: 'Login successful',
        access_token: `mock-jwt-token-${matched.id}-${Date.now()}`,
        token_type: 'bearer',
        user_id: matched.id,
        name: matched.name,
        login_id: matched.login_id,
        role: matched.role,
        gr_number: matched.gr_number || '',
        area: matched.area || '',
        points: matched.points || 0,
        streak: matched.streak || 1,
      };
    }

    throw new Error('Invalid ID or Password');
  }

  // 2. Register Student
  if (endpoint === '/register' && method === 'POST') {
    const users = getLocalStore('users', INITIAL_LOCAL_USERS);
    const existing = users.find((u) => u.gr_number === body.gr_number || u.login_id === body.gr_number);
    if (existing) {
      throw new Error('Student GR Number already registered');
    }
    const newUser = {
      id: String(Date.now()),
      login_id: body.gr_number,
      gr_number: body.gr_number,
      name: body.name,
      password: body.password,
      role: 'student',
      points: 10,
      streak: 1,
    };
    users.push(newUser);
    setLocalStore('users', users);
    return {
      message: 'Student registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        gr_number: newUser.gr_number,
        role: 'student',
      },
    };
  }

  // 3. Current User Profile
  if (endpoint === '/me') {
    const saved = localStorage.getItem('loggedInUser');
    return saved ? JSON.parse(saved) : null;
  }

  // 4. Reports / Complaints
  if (endpoint === '/reports') {
    if (method === 'GET') {
      return getLocalStore('reports', INITIAL_LOCAL_REPORTS);
    }
    if (method === 'POST') {
      const reports = getLocalStore('reports', INITIAL_LOCAL_REPORTS);
      const newReport = {
        id: Date.now(),
        student_id: body.student_id || '2707',
        problem: body.problem,
        location: body.location,
        description: body.description || body.problem,
        photo: body.photo || '',
        area: body.area || 'Main Campus',
        status: 'Pending',
        assigned_staff_id: null,
        pending_reason: '',
        created_at: new Date().toISOString(),
      };
      reports.unshift(newReport);
      setLocalStore('reports', reports);
      return { message: 'Report submitted successfully', report_id: newReport.id };
    }
  }

  // 5. Update Report Status
  if (endpoint.startsWith('/reports/') && method === 'PATCH') {
    const reportId = Number(endpoint.split('/')[2]);
    const reports = getLocalStore('reports', INITIAL_LOCAL_REPORTS);
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx !== -1) {
      reports[idx] = { ...reports[idx], ...body };
      setLocalStore('reports', reports);
      return { message: 'Report updated', report: reports[idx] };
    }
    return { message: 'Report updated' };
  }

  // 6. Recycle Requests
  if (endpoint === '/recycle-requests') {
    if (method === 'GET') {
      return getLocalStore('recycle', INITIAL_LOCAL_RECYCLE);
    }
    if (method === 'POST') {
      const recycles = getLocalStore('recycle', INITIAL_LOCAL_RECYCLE);
      const newReq = {
        id: Date.now(),
        user_id: 'GR101',
        types: body.type,
        type: body.type,
        location: body.location,
        description: body.description,
        photo: body.photo || '',
        status: 'Pending',
        points_awarded: 0,
        created_at: new Date().toISOString(),
      };
      recycles.unshift(newReq);
      setLocalStore('recycle', recycles);
      return { message: 'Recycle request submitted', id: newReq.id };
    }
  }

  // 7. Accept Recycle Request
  if (endpoint.includes('/recycle-requests/') && endpoint.endsWith('/accept')) {
    const id = Number(endpoint.split('/')[2]);
    const recycles = getLocalStore('recycle', INITIAL_LOCAL_RECYCLE);
    const idx = recycles.findIndex((r) => r.id === id);
    if (idx !== -1) {
      recycles[idx].status = 'Accepted';
      recycles[idx].points_awarded = body.points || 15;
      setLocalStore('recycle', recycles);
    }
    return { message: 'Request accepted & points awarded' };
  }

  // 8. Admin Stats
  if (endpoint === '/admin/stats') {
    const reports = getLocalStore('reports', INITIAL_LOCAL_REPORTS);
    const recycles = getLocalStore('recycle', INITIAL_LOCAL_RECYCLE);
    return {
      total_reports: reports.length,
      pending: reports.filter((r) => r.status === 'Pending').length,
      in_progress: reports.filter((r) => r.status === 'In Progress').length,
      resolved: reports.filter((r) => r.status === 'Completed' || r.status === 'Resolved').length,
      recycle_requests: recycles.length,
      active_staff: 4,
    };
  }

  // 9. Staff Members
  if (endpoint === '/staff') {
    const users = getLocalStore('users', INITIAL_LOCAL_USERS);
    return users.filter((u) => u.role === 'staff');
  }

  // 10. Main Admin Overview
  if (endpoint === '/main-admin/full-overview') {
    const users = getLocalStore('users', INITIAL_LOCAL_USERS);
    const reports = getLocalStore('reports', INITIAL_LOCAL_REPORTS);
    return {
      users: users.map((u) => ({
        id: u.id,
        login_id: u.login_id,
        name: u.name,
        role: u.role,
        area: u.area || '',
      })),
      reports: reports,
    };
  }

  // 11. Add User (Main Admin)
  if (endpoint === '/main-admin/add-user' && method === 'POST') {
    const users = getLocalStore('users', INITIAL_LOCAL_USERS);
    const newUser = {
      id: String(Date.now()),
      login_id: body.login_id,
      password: body.password || 'password123',
      name: body.name,
      role: body.role,
      area: body.area || '',
      points: 0,
      streak: 1,
    };
    users.push(newUser);
    setLocalStore('users', users);
    return { message: 'User created successfully', user: newUser };
  }

  // 12. Staff Tasks
  if (endpoint.startsWith('/cleaning-tasks/staff/')) {
    const staffId = endpoint.split('/')[3];
    const reports = getLocalStore('reports', INITIAL_LOCAL_REPORTS);
    return reports.filter((r) => r.assigned_staff_id === staffId || staffId === 'ST101');
  }

  // 13. Leaderboard
  if (endpoint === '/students/leaderboard') {
    const users = getLocalStore('users', INITIAL_LOCAL_USERS);
    return users
      .filter((u) => u.role === 'student')
      .map((u, i) => ({
        rank: i + 1,
        id: u.id,
        name: u.name,
        gr_number: u.gr_number || u.login_id,
        points: u.points || 20,
        streak: u.streak || 1,
      }));
  }

  return {};
}

/* ================= EXPORTED SERVICE METHODS ================= */

export async function loginUser(loginId, password) {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({
      login_id: loginId,
      password: password,
    }),
  });

  if (data && data.access_token) {
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('loggedInUser', JSON.stringify(data));
    if (data.role === 'student') {
      localStorage.setItem(
        'loggedInStudent',
        JSON.stringify({
          id: data.user_id,
          name: data.name,
          grNumber: data.gr_number,
          loginId: data.login_id,
          role: data.role,
          points: data.points || 0,
          streak: data.streak || 1,
        })
      );
    }
  }
  return data;
}

export async function registerStudent(name, grNumber, password) {
  return await request('/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      gr_number: grNumber,
      password,
    }),
  });
}

export async function getCurrentUserProfile() {
  const data = await request('/me');
  if (data) {
    const current = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const updated = { ...current, ...data };
    localStorage.setItem('loggedInUser', JSON.stringify(updated));
    return updated;
  }
  return null;
}

export async function getReports() {
  return await request('/reports');
}

export async function submitGarbageReport({ studentId, problem, location, description, photo, area }) {
  return await request('/reports', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      problem,
      location,
      description: description || problem,
      photo: photo || '',
      area: area || '',
    }),
  });
}

export async function updateReportStatus(reportId, updates) {
  return await request(`/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function getRecycleRequests() {
  return await request('/recycle-requests');
}

export async function submitRecycleRequest({ types, photo, location, description }) {
  return await request('/recycle-requests', {
    method: 'POST',
    body: JSON.stringify({
      type: Array.isArray(types) ? types.join(', ') : types,
      photo: photo || '',
      location,
      description,
    }),
  });
}

export async function acceptRecycleRequest(id, pointsAwarded) {
  return await request(`/recycle-requests/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ points: Number(pointsAwarded) || 15 }),
  });
}

export async function getLeaderboard() {
  return await request('/students/leaderboard');
}

export async function addStudentPoints(identifier, points) {
  return await request(`/students/${identifier}/points`, {
    method: 'POST',
    body: JSON.stringify({ points: Number(points) }),
  });
}

export async function getAdminStats() {
  return await request('/admin/stats');
}

export async function getStaffMembers() {
  return await request('/staff');
}

export async function getMainAdminOverview() {
  return await request('/main-admin/full-overview');
}

export async function addUser({ name, login_id, password, role, area }) {
  return await request('/main-admin/add-user', {
    method: 'POST',
    body: JSON.stringify({ name, login_id, password, role, area }),
  });
}

export async function resetUserPassword(userId, newPassword) {
  return await request(`/main-admin/users/${userId}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword }),
  });
}

export async function getStaffTasks(staffId) {
  return await request(`/cleaning-tasks/staff/${staffId}`);
}
