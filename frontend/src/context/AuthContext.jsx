import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerStudent,
  getCurrentUserProfile,
  addStudentPoints as apiAddPoints,
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loggedInUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('loggedInUser');
    if (saved) {
      const u = JSON.parse(saved);
      return u.points || 0;
    }
    return 0;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('loggedInUser');
    if (saved) {
      const u = JSON.parse(saved);
      return u.streak || 1;
    }
    return 1;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('loggedInUser');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'student') return 'student-dashboard';
      if (parsed.role === 'staff') return 'staff-dashboard';
      if (parsed.role === 'admin') return 'admin-dashboard';
      if (parsed.role === 'main_admin') return 'main-admin-dashboard';
    }
    return 'landing';
  });

  // Refresh profile from live DB on mount or token change
  const refreshProfile = async () => {
    if (localStorage.getItem('accessToken')) {
      try {
        const profile = await getCurrentUserProfile();
        if (profile) {
          setUser(profile);
          setPoints(profile.points || 0);
          setStreak(profile.streak || 1);
        }
      } catch (e) {
        console.warn('Profile sync:', e.message);
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (loginId, password) => {
    const data = await loginUser(loginId, password);
    setUser(data);
    setPoints(data.points || 0);
    setStreak(data.streak || 1);

    if (data.role === 'student') {
      setCurrentPage('student-dashboard');
    } else if (data.role === 'staff') {
      setCurrentPage('staff-dashboard');
    } else if (data.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (data.role === 'main_admin') {
      setCurrentPage('main-admin-dashboard');
    } else {
      setCurrentPage('landing');
    }
    return data;
  };

  const register = async (name, grNumber, password) => {
    return await registerStudent(name, grNumber, password);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedInStudent');
    setUser(null);
    setPoints(0);
    setStreak(1);
    setCurrentPage('login');
  };

  const awardPoints = async (identifier, pts) => {
    try {
      const res = await apiAddPoints(identifier, pts);
      const newTotal = res.points || points + pts;
      setPoints(newTotal);
      setUser((prev) => (prev ? { ...prev, points: newTotal } : prev));
      return newTotal;
    } catch (e) {
      const fallback = points + pts;
      setPoints(fallback);
      return fallback;
    }
  };

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (['student-dashboard', 'student-profile'].includes(page)) {
      refreshProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        points,
        streak,
        currentPage,
        navigate,
        login,
        register,
        logout,
        awardPoints,
        refreshProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
