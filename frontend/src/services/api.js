/**
 * API Service for iC Clean Campus
 * Communicates with live Node.js Express backend and syncs real database state
 */

// Defaults to local backend port 8001, or fallback to cloud URL if specified
const DEFAULT_API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8001'
    : 'https://ic-clean-campus.onrender.com');

export function getApiBaseUrl() {
  return localStorage.getItem('custom_api_url') || DEFAULT_API_BASE;
}

export function getAuthToken() {
  const token = localStorage.getItem('accessToken');
  if (token) return token;
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  return user?.access_token || null;
}

async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.detail || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ================= AUTHENTICATION ================= */

export async function loginUser(loginId, password) {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({
      login_id: loginId,
      password: password,
    }),
  });

  if (data.access_token) {
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

/* ================= REPORTS ================= */

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

/* ================= RECYCLE REQUESTS ================= */

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

/* ================= GAMIFICATION & LEADERBOARD ================= */

export async function getLeaderboard() {
  return await request('/students/leaderboard');
}

export async function addStudentPoints(identifier, points) {
  return await request(`/students/${identifier}/points`, {
    method: 'POST',
    body: JSON.stringify({ points: Number(points) }),
  });
}

/* ================= ADMIN & STAFF ================= */

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
