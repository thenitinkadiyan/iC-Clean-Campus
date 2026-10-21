import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getReports, getRecycleRequests } from '../services/api';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Award,
  Medal,
  CheckCircle2,
  Lock,
  User,
  Sparkles,
  Shield,
} from 'lucide-react';

export default function StudentProfile() {
  const { user, points, streak, navigate } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [reports, setReports] = useState([]);
  const [recycles, setRecycles] = useState([]);
  const [userRank, setUserRank] = useState('#--');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [lb, rep, rec] = await Promise.all([
          getLeaderboard(),
          getReports(),
          getRecycleRequests(),
        ]);
        setLeaderboard(lb);
        setReports(rep);
        setRecycles(rec);

        const currentGR = user?.gr_number || user?.grNumber || '';
        const foundIndex = lb.findIndex((s) => s.gr_number === currentGR);
        if (foundIndex !== -1) {
          setUserRank(`#${foundIndex + 1}`);
        } else {
          setUserRank('#1');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Achievement logic
  const currentGR = user?.gr_number || user?.grNumber || '';
  const currentUserId = user?.user_id || user?.id;
  const myReports = reports.filter(
    (r) =>
      (currentGR && (r.student_gr === currentGR || r.studentGR === currentGR)) ||
      (currentUserId && Number(r.student_id) === Number(currentUserId))
  );
  const myRecycles = recycles.filter(
    (r) =>
      ((currentGR && (r.student_gr === currentGR || r.studentGR === currentGR)) ||
        (currentUserId && Number(r.student_id) === Number(currentUserId))) &&
      (r.status === 'Accepted' || (r.points && r.points > 0))
  );

  const achievements = [
    {
      id: 'reporter',
      title: 'Clean Campus Reporter',
      desc: 'Submit your first campus garbage report.',
      icon: '🗑️',
      unlocked: myReports.length > 0,
    },
    {
      id: 'recycler',
      title: 'Eco Recycler',
      desc: 'Complete your first approved recycle request.',
      icon: '♻️',
      unlocked: myRecycles.length > 0,
    },
    {
      id: 'streak',
      title: 'Streak Champion',
      desc: 'Maintain a 7-day activity streak.',
      icon: '🔥',
      unlocked: streak >= 7,
    },
    {
      id: 'century',
      title: 'Century Eco Champion',
      desc: 'Accumulate 100+ points contributing to campus clean-up.',
      icon: '🏆',
      unlocked: points >= 100,
    },
  ];

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '860px', paddingBottom: '60px' }}>
      <button
        onClick={() => navigate('student-dashboard')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      {/* Header Profile Card */}
      <div
        className="glass-panel"
        style={{
          padding: '36px 32px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          borderTop: '4px solid #10b981',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            border: '3px solid #ffffff',
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.85rem', color: '#064e3b' }}>
              {user?.name || 'Campus Champion'}
            </h1>
            <span className="badge badge-resolved">Verified Student</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '0.95rem' }}>
            <span><strong>GR Number:</strong> {currentGR || 'GR1001'}</span>
            <span>•</span>
            <span><strong>Campus Zone:</strong> {user?.area || 'General Campus'}</span>
          </div>
        </div>
      </div>

      {/* Key Stats (3 columns) */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <Trophy size={24} />
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#064e3b', marginBottom: '2px' }}>
            {points}
          </h2>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.88rem' }}>Total Points</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <Flame size={24} />
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#c2410c', marginBottom: '2px' }}>
            {streak}
          </h2>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.88rem' }}>Day Streak</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fefce8',
              color: '#ca8a04',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <Medal size={24} />
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#854d0e', marginBottom: '2px' }}>
            {userRank}
          </h2>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.88rem' }}>Leaderboard Rank</p>
        </div>
      </div>

      {/* Rewards & Achievements */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>
          🎖️ Badges & Achievements
        </h2>

        <div className="grid-2">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: ach.unlocked ? '#ffffff' : '#f8fafc',
                border: ach.unlocked ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                opacity: ach.unlocked ? 1 : 0.75,
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: ach.unlocked ? '#ecfdf5' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {ach.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>{ach.title}</h3>
                  {ach.unlocked ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' }}>
                      Unlocked
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                      Locked
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>
          🥇 Campus Leaderboard
        </h2>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              No ranked students yet. Be the first to earn campus eco points by reporting garbage or requesting recycling!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
            {leaderboard.map((student, idx) => {
              const isCurrent = (student.gr_number || '') === currentGR;
              const rank = idx + 1;
              const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

              return (
                <div
                  key={student.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: idx !== leaderboard.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: isCurrent ? '#f0fdf4' : '#ffffff',
                    borderLeft: isCurrent ? '4px solid #10b981' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, width: '32px', textAlign: 'center' }}>
                      {rankIcon}
                    </span>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                          {student.name}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '6px' }}>
                            You
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        GR: {student.gr_number || '---'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                    <Trophy size={16} />
                    <span>{student.points || 0} pts</span>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
