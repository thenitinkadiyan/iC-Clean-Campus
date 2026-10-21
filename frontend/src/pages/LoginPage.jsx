import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Leaf, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, navigate } = useAuth();
  const { addToast } = useToast();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password) {
      addToast('Please enter both ID and Password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(loginId.trim(), password);
      addToast(`Welcome back, ${data.name || 'User'}!`, 'success');
    } catch (error) {
      addToast(error.message || 'Invalid ID or Password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '30px 16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          borderTop: '4px solid #10b981',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 18px rgba(16, 185, 129, 0.25)',
          }}
        >
          <Leaf color="#ffffff" size={28} />
        </div>

        <h1 style={{ fontSize: '1.8rem', color: '#064e3b', marginBottom: '4px' }}>
          iC Clean Campus
        </h1>
        <h3 style={{ fontSize: '1rem', color: '#4b7d60', fontWeight: 600, marginBottom: '28px' }}>
          Login Portal
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">User / Login ID</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="GR Number or Staff/Admin ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                maxLength={30}
                required
                style={{ paddingLeft: '40px' }}
              />
              <User
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={30}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontSize: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setLoginId('2707');
                setPassword('Nitin@2007');
              }}
              style={{
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '6px 12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              👑 Fill Admin (2707)
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Default: Nitin@2007</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
            style={{ marginTop: '4px', height: '48px', fontSize: '1rem' }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
          New Student?{' '}
          <a
            href="#signup"
            onClick={(e) => {
              e.preventDefault();
              navigate('signup');
            }}
            style={{ fontWeight: 700, color: '#059669' }}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
