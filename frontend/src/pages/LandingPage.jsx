import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Leaf,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Camera,
  Recycle,
  CheckCircle2,
  Users,
  Compass,
  Flame,
} from 'lucide-react';

export default function LandingPage() {
  const { navigate } = useAuth();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '60px 20px 40px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '9999px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.875rem',
            fontWeight: 700,
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
          }}
        >
          <Sparkles size={16} color="#10b981" />
          <span>Next-Generation Clean Campus Ecosystem</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Smart. Clean. Sustainable.
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Empowering students, cleaning staff, and administrators to build a pristine,
          eco-friendly campus with real-time reporting, gamified rewards, and smart routing.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => navigate('login')}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '180px' }}
          >
            <span>Enter Portal</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('signup')}
            className="btn btn-secondary btn-lg"
            style={{ minWidth: '180px' }}
          >
            <span>Student Sign Up</span>
          </button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="app-container" style={{ marginTop: '20px' }}>
        <div className="grid-4">
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <Camera size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Instant Reporting</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Snap photos of garbage or overflow, auto-tag location, and notify campus staff instantly.
            </p>
          </div>

          <div className="card glass-panel" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Student Gamification</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Earn points for valid reports, sustain your day streak, unlock badges, and climb the leaderboard.
            </p>
          </div>

          <div className="card glass-panel" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <Recycle size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Recycle Collection</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Request doorstep collection for paper, plastic, metal, and e-waste to foster a circular campus.
            </p>
          </div>

          <div className="card glass-panel" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#fdf4ff',
                color: '#c026d3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>AI Verification</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Before & after photo verification pipelines ensure cleanliness quality and transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section className="app-container" style={{ marginTop: '50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', color: '#064e3b' }}>Unified Ecosystem for Every Role</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '6px' }}>
            Tailored interfaces designed for students, cleaning operators, area admins, and management.
          </p>
        </div>

        <div className="grid-2">
          <div
            className="card card-clickable"
            onClick={() => navigate('login')}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              border: '1.5px solid #a7f3d0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#064e3b' }}>Student Champion</h3>
                <span className="badge badge-resolved">Points & Badges</span>
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px' }}>
              Submit garbage reports, request recycling pickups, view live complaint tracking stages, and compete on the campus leaderboard.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>Open Student Experience</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div
            className="card card-clickable"
            onClick={() => navigate('login')}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
              border: '1.5px solid #99f6e4',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#0d9488',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#134e4a' }}>Cleaning Staff Panel</h3>
                <span className="badge badge-in_progress">Task Dispatch</span>
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px' }}>
              View today’s designated cleaning tasks with GPS map links, upload after-work photos, and mark tasks complete.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>Open Staff Panel</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div
            className="card card-clickable"
            onClick={() => navigate('login')}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fefce8 100%)',
              border: '1.5px solid #fef08a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#ca8a04',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#713f12' }}>Area Administrator</h3>
                <span className="badge badge-pending">Area Intelligence</span>
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px' }}>
              Monitor block reports, review staff duty status, assign urgent cleaning tasks, and accept student recycling submissions.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ca8a04', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>Open Area Admin</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div
            className="card card-clickable"
            onClick={() => navigate('login')}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
              border: '1.5px solid #e9d5ff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#9333ea',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#581c87' }}>Central Main Admin</h3>
                <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>Full Access</span>
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px' }}>
              Global database overview, create area admins & cleaning staff, reset credentials, and review campus-wide cleanliness audit logs.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9333ea', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>Open Super Admin</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
