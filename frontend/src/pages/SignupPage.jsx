import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { UserCheck, Lock, User, Hash, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const { register, navigate } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [grNumber, setGrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !grNumber.trim() || !password || !confirmPassword) {
      addToast('Please fill all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must contain at least 6 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), grNumber.trim(), password);
      addToast('Registration successful! Please login with your credentials.', 'success');
      navigate('login');
    } catch (error) {
      addToast(error.message || 'Registration failed. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
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
          maxWidth: '460px',
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
          <UserCheck color="#ffffff" size={28} />
        </div>

        <h1 style={{ fontSize: '1.75rem', color: '#064e3b', marginBottom: '4px' }}>
          Student Registration
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '28px' }}>
          Create your iC Clean Campus account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            <label className="form-label">GR Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="6-digit GR Number"
                value={grNumber}
                onChange={(e) => setGrNumber(e.target.value)}
                maxLength={6}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Hash
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Create Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={20}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={20}
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

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isSubmitting}
            style={{ marginTop: '10px', height: '48px', fontSize: '1rem' }}
          >
            {isSubmitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              navigate('login');
            }}
            style={{ fontWeight: 700, color: '#059669' }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
