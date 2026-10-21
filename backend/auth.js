import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ic_clean_campus_jwt_key_2026';
const JWT_EXPIRE = '24h';

export function createAccessToken({ user_id, login_id, role, name, area }) {
  const payload = {
    sub: String(user_id),
    login_id,
    role,
    name,
    area: area || null,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  try {
    // If it's a bcrypt hash
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
      return await bcrypt.compare(password, storedHash);
    }
    // Fallback: plaintext or other
    return password === storedHash;
  } catch (err) {
    return false;
  }
}

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;
    const role = decoded.role;

    if (!userId || !role) {
      return res.status(401).json({ detail: 'Invalid authentication token.' });
    }

    if (role === 'main_admin') {
      req.user = {
        id: 0,
        login_id: decoded.login_id,
        name: decoded.name || 'Main Admin',
        role: 'main_admin',
        area: null,
      };
      return next();
    }

    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(401).json({ detail: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ detail: 'Invalid authentication token.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ detail: 'Access denied.' });
    }
    next();
  };
}

export function requireMainAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'main_admin') {
    return res.status(403).json({ detail: 'Main Admin access required.' });
  }
  next();
}
