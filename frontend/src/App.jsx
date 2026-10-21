import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import ReportGarbage from './pages/ReportGarbage';
import MyComplaints from './pages/MyComplaints';
import ComplaintsStatus from './pages/ComplaintsStatus';
import RecycleRequest from './pages/RecycleRequest';
import StudentProfile from './pages/StudentProfile';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MainAdminDashboard from './pages/MainAdminDashboard';

import { Leaf, Heart } from 'lucide-react';

function AppContent() {
  const { currentPage, navigate } = useAuth();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'report-garbage':
        return <ReportGarbage />;
      case 'my-complaints':
        return <MyComplaints />;
      case 'complaints-status':
        return <ComplaintsStatus />;
      case 'recycle-request':
        return <RecycleRequest />;
      case 'student-profile':
        return <StudentProfile />;
      case 'staff-dashboard':
        return <StaffDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'main-admin-dashboard':
        return <MainAdminDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{renderCurrentPage()}</main>

      {/* Modern Footer */}
      <footer
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderTop: '1px solid rgba(167, 243, 208, 0.5)',
          padding: '24px 20px',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#064e3b', fontWeight: 700 }}>
            <Leaf size={16} color="#10b981" />
            <span>iC Clean Campus — Smart Clean Sustainable</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>
            Built with React.js & modern FastAPI architecture. Supporting cleaner, greener academic spaces.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
