import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReports, getRecycleRequests } from '../services/api';
import {
  Camera,
  FileText,
  Clock,
  Recycle,
  Trophy,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, points, streak, navigate } = useAuth();
  const [reports, setReports] = useState([]);
  const [recycleCount, setRecycleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedReports = await getReports();
        setReports(fetchedReports);
        const recycles = await getRecycleRequests();
        const accepted = Array.isArray(recycles)
          ? recycles.filter((r) => r.status === 'Accepted')
          : [];
        setRecycleCount(accepted.length);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const resolvedCount = reports.filter(
    (r) => (r.status || '').toLowerCase() === 'resolved'
  ).length;

  const recentReports = reports.slice(0, 3);

  const getStatusBadge = (status = 'Pending') => {
    const s = status.toLowerCase().replace(/\s+/g, '-');
    return <span className={`badge badge-${s}`}>{status}</span>;
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Welcome Banner Card */}
      <div
        className="glass-panel"
        style={{
          padding: '36px 32px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
          border: '1.5px solid #a7f3d0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: '12px' }}>
                GR: {user?.gr_number || user?.grNumber || 'Champion'}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '12px' }}>
                Area: {user?.area || 'Campus Wide'}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', color: '#064e3b', marginBottom: '4px' }}>
              Welcome back, {user?.name || 'Campus Champion'}! 👋
            </h1>
            <p style={{ color: '#475569', fontSize: '1.05rem' }}>
              A cleaner, more sustainable campus starts with your actions.
            </p>
          </div>

          {/* Gamification summary pill */}
          <div
            onClick={() => navigate('student-profile')}
            style={{
              display: 'flex',
              gap: '12px',
              background: '#ffffff',
              padding: '12px 18px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #d1fae5',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 800, fontSize: '1.25rem' }}>
                <Trophy size={20} color="#10b981" />
                <span>{points}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Points</span>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontWeight: 800, fontSize: '1.25rem' }}>
                <Flame size={20} color="#f97316" />
                <span>{streak}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>Core Actions</h2>
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Camera size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Report Garbage</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Found a cleanliness issue or overflowing dustbin? Report it with a photo & location.
            </p>
          </div>
          <button
            onClick={() => navigate('report-garbage')}
            className="btn btn-primary btn-full"
          >
            <span>Report Now</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>My Complaints</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              View history, photos, pending reasons, and progress on all your past submissions.
            </p>
          </div>
          <button
            onClick={() => navigate('my-complaints')}
            className="btn btn-secondary btn-full"
          >
            <span>View Complaints</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#faf5ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Complaints Status</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Track the step-by-step progress of your reported issues through cleaning and AI verification.
            </p>
          </div>
          <button
            onClick={() => navigate('complaints-status')}
            className="btn btn-secondary btn-full"
          >
            <span>Track Status</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Campus Impact Metrics */}
      <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>Your Campus Impact</h2>
      <div className="grid-3" style={{ marginBottom: '36px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ color: '#059669', fontSize: '2.5rem', fontWeight: 800, marginBottom: '4px' }}>
            {reports.length}
          </div>
          <div style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
            Reports Submitted
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ color: '#10b981', fontSize: '2.5rem', fontWeight: 800, marginBottom: '4px' }}>
            {resolvedCount}
          </div>
          <div style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
            Issues Resolved
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ color: '#0ea5e9', fontSize: '2.5rem', fontWeight: 800, marginBottom: '4px' }}>
            {recycleCount}
          </div>
          <div style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
            Accepted Recycle Requests
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div
        className="card"
        style={{
          marginBottom: '36px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          border: '1px solid #d1fae5',
        }}
      >
        <h3 style={{ fontSize: '1.15rem', color: '#064e3b', marginBottom: '16px' }}>
          Quick Shortcuts
        </h3>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('report-garbage')}
          >
            <Camera size={18} color="#10b981" />
            <span>📷 Report an Issue</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('my-complaints')}
          >
            <FileText size={18} color="#3b82f6" />
            <span>📄 My Complaints</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('recycle-request')}
          >
            <Recycle size={18} color="#10b981" />
            <span>♻️ Recycle Request</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('student-profile')}
          >
            <Trophy size={18} color="#f59e0b" />
            <span>🏆 Leaderboard & Rewards</span>
          </button>
        </div>
      </div>

      {/* Recent Reports Feed */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#064e3b' }}>Recent Reports</h2>
          {reports.length > 0 && (
            <button
              onClick={() => navigate('my-complaints')}
              className="btn btn-outline btn-sm"
            >
              View All ({reports.length})
            </button>
          )}
        </div>

        {recentReports.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b',
            }}
          >
            <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '6px' }}>No reports submitted yet</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              Notice any litter, overflowing dustbins or untidy washrooms? Report now!
            </p>
            <button
              onClick={() => navigate('report-garbage')}
              className="btn btn-primary btn-sm"
            >
              Report Your First Issue
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentReports.map((report, idx) => (
              <div
                key={report.id || idx}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {report.photo ? (
                    <img
                      src={report.photo}
                      alt="Report preview"
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                      }}
                    >
                      <Camera size={20} />
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px' }}>
                      {report.problem || report.description || 'Cleanliness Issue'}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} />
                        {report.location}
                      </span>
                      {report.date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {report.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>{getStatusBadge(report.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
