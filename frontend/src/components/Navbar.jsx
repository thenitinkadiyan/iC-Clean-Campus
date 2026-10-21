import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Leaf,
  Flame,
  Trophy,
  User,
  LogOut,
  Shield,
  Briefcase,
  Layers,
  Menu,
  X,
  FileText,
  Recycle,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from './Toast';

export default function Navbar() {
  const { user, role, points, streak, currentPage, navigate, logout } = useAuth();
  const { addToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRole = (r) => role === r;

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(167, 243, 208, 0.4)',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <div
            onClick={() => {
              if (role === 'student') navigate('student-dashboard');
              else if (role === 'staff') navigate('staff-dashboard');
              else if (role === 'admin') navigate('admin-dashboard');
              else if (role === 'main_admin') navigate('main-admin-dashboard');
              else navigate('landing');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Leaf color="#ffffff" size={22} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: '#064e3b',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                iC Clean Campus
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: '#d1fae5',
                    color: '#047857',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  React
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Smart • Clean • Sustainable
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '8px',
            }}
            className="desktop-nav"
          >
            {user && (
              <>
                {isRole('student') && (
                  <>
                    <button
                      className={`nav-btn ${currentPage === 'student-dashboard' ? 'active' : ''}`}
                      onClick={() => navigate('student-dashboard')}
                    >
                      Dashboard
                    </button>
                    <button
                      className={`nav-btn ${currentPage === 'report-garbage' ? 'active' : ''}`}
                      onClick={() => navigate('report-garbage')}
                    >
                      Report Issue
                    </button>
                    <button
                      className={`nav-btn ${currentPage === 'my-complaints' ? 'active' : ''}`}
                      onClick={() => navigate('my-complaints')}
                    >
                      My Complaints
                    </button>
                    <button
                      className={`nav-btn ${currentPage === 'complaints-status' ? 'active' : ''}`}
                      onClick={() => navigate('complaints-status')}
                    >
                      Track Status
                    </button>
                    <button
                      className={`nav-btn ${currentPage === 'recycle-request' ? 'active' : ''}`}
                      onClick={() => navigate('recycle-request')}
                    >
                      Recycle ♻️
                    </button>
                  </>
                )}

                {isRole('staff') && (
                  <button
                    className={`nav-btn ${currentPage === 'staff-dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('staff-dashboard')}
                  >
                    Cleaning Panel
                  </button>
                )}

                {isRole('admin') && (
                  <button
                    className={`nav-btn ${currentPage === 'admin-dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('admin-dashboard')}
                  >
                    Area Admin Panel
                  </button>
                )}

                {isRole('main_admin') && (
                  <button
                    className={`nav-btn ${currentPage === 'main-admin-dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('main-admin-dashboard')}
                  >
                    Main Admin Central
                  </button>
                )}
              </>
            )}
          </div>

          {/* User Status / Pills / Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                {/* Student Gamification Badges */}
                {isRole('student') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#065f46',
                      }}
                    >
                      <Trophy size={15} color="#10b981" />
                      <span>{points} pts</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#c2410c',
                      }}
                    >
                      <Flame size={15} color="#ea580c" />
                      <span>{streak} Days</span>
                    </div>

                    {/* Student Profile Avatar */}
                    <button
                      onClick={() => navigate('student-profile')}
                      title="View Student Profile"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: currentPage === 'student-profile' ? '#10b981' : '#d1fae5',
                        color: currentPage === 'student-profile' ? '#ffffff' : '#047857',
                        border: '2px solid #a7f3d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}
                    >
                      <User size={18} />
                    </button>
                  </div>
                )}

                {/* Role Pill */}
                {role !== 'student' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isRole('main_admin') ? '#f3e8ff' : '#ecfdf5',
                      border: `1px solid ${isRole('main_admin') ? '#d8b4fe' : '#a7f3d0'}`,
                      color: isRole('main_admin') ? '#7e22ce' : '#065f46',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {isRole('main_admin') ? (
                      <Shield size={14} />
                    ) : isRole('admin') ? (
                      <Layers size={14} />
                    ) : (
                      <Briefcase size={14} />
                    )}
                    <span>
                      {isRole('main_admin')
                        ? 'Super Admin'
                        : isRole('admin')
                        ? `Admin • ${user.area || 'Core'}`
                        : `Staff • ${user.area || 'Field'}`}
                    </span>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={logout}
                  title="Logout"
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <LogOut size={16} />
                  <span className="logout-text">Logout</span>
                </button>
              </>
            ) : (
              /* Guest Actions */
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('login')}
                >
                  Login
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('signup')}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#1b4332',
                padding: '4px',
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 20px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {user ? (
              <>
                {isRole('student') && (
                  <>
                    <button
                      className={`mobile-nav-btn ${currentPage === 'student-dashboard' ? 'active' : ''}`}
                      onClick={() => {
                        navigate('student-dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      📊 Dashboard
                    </button>
                    <button
                      className={`mobile-nav-btn ${currentPage === 'report-garbage' ? 'active' : ''}`}
                      onClick={() => {
                        navigate('report-garbage');
                        setMobileMenuOpen(false);
                      }}
                    >
                      📷 Report Issue
                    </button>
                    <button
                      className={`mobile-nav-btn ${currentPage === 'my-complaints' ? 'active' : ''}`}
                      onClick={() => {
                        navigate('my-complaints');
                        setMobileMenuOpen(false);
                      }}
                    >
                      📄 My Complaints
                    </button>
                    <button
                      className={`mobile-nav-btn ${currentPage === 'complaints-status' ? 'active' : ''}`}
                      onClick={() => {
                        navigate('complaints-status');
                        setMobileMenuOpen(false);
                      }}
                    >
                      ⏱️ Track Status
                    </button>
                    <button
                      className={`mobile-nav-btn ${currentPage === 'recycle-request' ? 'active' : ''}`}
                      onClick={() => {
                        navigate('recycle-request');
                        setMobileMenuOpen(false);
                      }}
                    >
                      ♻️ Recycle Request
                    </button>
                    <button
                      className={`mobile-nav-btn ${currentPage === 'student-profile' ? 'active' : ''}`}
                      onClick={() => {
                        navigate('student-profile');
                        setMobileMenuOpen(false);
                      }}
                    >
                      👤 Student Profile & Leaderboard
                    </button>
                  </>
                )}
                {isRole('staff') && (
                  <button
                    className="mobile-nav-btn"
                    onClick={() => {
                      navigate('staff-dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    🧹 Cleaning Staff Tasks
                  </button>
                )}
                {isRole('admin') && (
                  <button
                    className="mobile-nav-btn"
                    onClick={() => {
                      navigate('admin-dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    🏢 Area Admin Panel
                  </button>
                )}
                {isRole('main_admin') && (
                  <button
                    className="mobile-nav-btn"
                    onClick={() => {
                      navigate('main-admin-dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    🛡️ Main Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-nav-btn"
                  style={{ color: '#dc2626' }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="mobile-nav-btn"
                  onClick={() => {
                    navigate('login');
                    setMobileMenuOpen(false);
                  }}
                >
                  🔑 Login
                </button>
                <button
                  className="mobile-nav-btn"
                  onClick={() => {
                    navigate('signup');
                    setMobileMenuOpen(false);
                  }}
                >
                  📝 Register Account
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      <style>{`
        .nav-btn {
          background: transparent;
          border: none;
          color: #475569;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-btn:hover {
          background: #f0fdf4;
          color: #065f46;
        }
        .nav-btn.active {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .mobile-nav-btn {
          text-align: left;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          color: #1e293b;
        }
        .mobile-nav-btn.active {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #065f46;
        }
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 859px) {
          .mobile-toggle {
            display: block !important;
          }
          .logout-text {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
