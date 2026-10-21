import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  getMainAdminOverview,
  addUser,
  resetUserPassword as apiResetPassword,
} from '../services/api';
import {
  Shield,
  Users,
  UserPlus,
  KeyRound,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Building,
} from 'lucide-react';
import Modal from '../components/Modal';

export default function MainAdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [overview, setOverview] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'students' | 'admins' | 'staff' | 'reports' | 'addAdmin' | 'addStaff'
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    login_id: '',
    password: '',
    area: '',
  });

  const loadData = async () => {
    try {
      const data = await getMainAdminOverview();
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (role) => {
    if (!formData.name.trim() || !formData.login_id.trim() || !formData.password || !formData.area.trim()) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must contain at least 6 characters', 'error');
      return;
    }

    try {
      await addUser({
        name: formData.name.trim(),
        login_id: formData.login_id.trim(),
        password: formData.password,
        role,
        area: formData.area.trim(),
      });

      addToast(`${role === 'admin' ? 'Area Admin' : 'Cleaning Staff'} created successfully!`, 'success');
      setActiveModal(null);
      setFormData({ name: '', login_id: '', password: '', area: '' });
      loadData();
    } catch (e) {
      addToast(e.message || 'Failed to create user', 'error');
    }
  };

  const handleResetPassword = async (targetUser) => {
    const newPass = window.prompt(`Enter new password for ${targetUser.name} (min 6 characters):`);
    if (!newPass) return;
    if (newPass.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await apiResetPassword(targetUser.id, newPass);
      addToast(`Password for ${targetUser.name} reset successfully!`, 'success');
    } catch (e) {
      addToast(e.message || 'Password reset failed', 'error');
    }
  };

  const getFilteredUsers = (list = []) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.login_id || '').toLowerCase().includes(q) ||
        (u.gr_number || '').toLowerCase().includes(q) ||
        (u.area || '').toLowerCase().includes(q)
    );
  };

  const counts = overview?.counts || {
    students: 0,
    admins: 0,
    staff: 0,
    reports: 0,
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          borderTop: '4px solid #7c3aed',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Shield size={32} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', color: '#4c1d95', margin: 0 }}>
                Main Admin Dashboard
              </h1>
              <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                Full System Control
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              iC Clean Campus — Enterprise Database Management & Staff Dispatch
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Connected Environment</span>
          <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>
            ● Production Live DB
          </div>
        </div>
      </div>

      {/* Clickable System Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '36px' }}>
        <div
          className="card card-clickable"
          onClick={() => {
            setSearchQuery('');
            setActiveModal('students');
          }}
          style={{ borderLeft: '4px solid #10b981' }}
        >
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Total Students</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#064e3b', margin: '4px 0' }}>
            {counts.students}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
            View Students Directory →
          </span>
        </div>

        <div
          className="card card-clickable"
          onClick={() => {
            setSearchQuery('');
            setActiveModal('admins');
          }}
          style={{ borderLeft: '4px solid #f59e0b' }}
        >
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Total Area Admins</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#78350f', margin: '4px 0' }}>
            {counts.admins}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>
            View Admins Directory →
          </span>
        </div>

        <div
          className="card card-clickable"
          onClick={() => {
            setSearchQuery('');
            setActiveModal('staff');
          }}
          style={{ borderLeft: '4px solid #0ea5e9' }}
        >
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Total Staff</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0c4a6e', margin: '4px 0' }}>
            {counts.staff}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
            View Staff Directory →
          </span>
        </div>

        <div
          className="card card-clickable"
          onClick={() => {
            setSearchQuery('');
            setActiveModal('reports');
          }}
          style={{ borderLeft: '4px solid #8b5cf6' }}
        >
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Total Reports</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4c1d95', margin: '4px 0' }}>
            {counts.reports}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 700 }}>
            Inspect All Reports →
          </span>
        </div>
      </div>

      {/* User Management Actions */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>
          User Provisioning & Roles
        </h2>

        <div className="grid-2">
          <div className="card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>Create Area Admin</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Assign supervisory credentials to a designated campus zone
                </p>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Area Admins monitor complaints, assign tasks to staff, and approve student recycling rewards within their sector.
            </p>

            <button
              onClick={() => {
                setFormData({ name: '', login_id: '', password: '', area: '' });
                setActiveModal('addAdmin');
              }}
              className="btn btn-primary btn-full"
            >
              <UserPlus size={16} />
              <span>+ Add Area Admin</span>
            </button>
          </div>

          <div className="card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>Create Cleaning Staff</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Provision mobile credentials for cleaning team personnel
                </p>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Cleaning Staff receive live dispatch alerts, view Google Maps coordinates, and complete verification checks.
            </p>

            <button
              onClick={() => {
                setFormData({ name: '', login_id: '', password: '', area: '' });
                setActiveModal('addStaff');
              }}
              className="btn btn-primary btn-full"
            >
              <UserPlus size={16} />
              <span>+ Add Cleaning Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Overview Information Card */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#064e3b', marginBottom: '14px' }}>
          System Role Matrix
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#475569' }}>
          <p>
            <strong style={{ color: '#064e3b' }}>🛡️ Main Admin:</strong> Full root privileges across student profiles, staff accounts, area supervisors, reports and password resets.
          </p>
          <p>
            <strong style={{ color: '#064e3b' }}>🏢 Area Admin:</strong> Manages reports, staff schedules, and points for their assigned campus zone (e.g. Block 1, Canteen, Ground).
          </p>
          <p>
            <strong style={{ color: '#064e3b' }}>🧹 Cleaning Staff:</strong> Accesses assigned task queues, navigates via GPS pins, uploads after-cleaning photos, and resolves tickets.
          </p>
          <p>
            <strong style={{ color: '#064e3b' }}>🎓 Student:</strong> Registers with GR number, logs cleanliness issues, requests recycling pickups, tracks status, and climbs leaderboard.
          </p>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={activeModal === 'addAdmin'}
        onClose={() => setActiveModal(null)}
        title="Add Area Administrator"
        subtitle="Provision credentials for area supervisor"
      >
        <div className="form-group">
          <label className="form-label">Admin Full Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Prof. Rajesh Khanna"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Admin Login ID</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. admin_block_c"
            value={formData.login_id}
            onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password (Min 6 chars)</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter secure password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Assigned Campus Area</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Block 3 or Central Ground"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleCreateUser('admin')}
          >
            Create Admin
          </button>
        </div>
      </Modal>

      {/* Add Staff Modal */}
      <Modal
        isOpen={activeModal === 'addStaff'}
        onClose={() => setActiveModal(null)}
        title="Add Cleaning Staff Member"
        subtitle="Provision credentials for cleaning staff operator"
      >
        <div className="form-group">
          <label className="form-label">Staff Full Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Balwinder Singh"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Staff Login ID</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. staff_05"
            value={formData.login_id}
            onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password (Min 6 chars)</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter secure password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Assigned Campus Area</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Block 2 Floors 1-3"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleCreateUser('staff')}
          >
            Create Staff
          </button>
        </div>
      </Modal>

      {/* User Directory Modal (Students / Admins / Staff) */}
      <Modal
        isOpen={['students', 'admins', 'staff'].includes(activeModal)}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'students'
            ? 'All Registered Students'
            : activeModal === 'admins'
            ? 'All Area Administrators'
            : 'All Cleaning Staff Personnel'
        }
        subtitle="Live data from iC Clean Campus database"
        maxWidth="680px"
      >
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, ID, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>

        {(() => {
          const rawList =
            activeModal === 'students'
              ? overview?.students || []
              : activeModal === 'admins'
              ? overview?.admins || []
              : overview?.staff || [];
          const list = getFilteredUsers(rawList);

          if (list.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                No records found matching your search.
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '55vh', overflowY: 'auto' }}>
              {list.map((u, i) => (
                <div
                  key={u.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        color: '#059669',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{u.name}</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        ID: <strong>{u.login_id}</strong>
                        {u.gr_number && <> • GR: <strong>{u.gr_number}</strong></>}
                        {u.area && <> • Area: <strong>{u.area}</strong></>}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetPassword(u)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <KeyRound size={13} />
                    <span>Reset Password</span>
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>

      {/* Reports Directory Modal */}
      <Modal
        isOpen={activeModal === 'reports'}
        onClose={() => setActiveModal(null)}
        title="Global Campus Reports Directory"
        subtitle="All student reports tracked in system"
        maxWidth="720px"
      >
        {(() => {
          const list = overview?.reports || [];
          if (list.length === 0) {
            return <div style={{ textAlign: 'center', padding: '36px' }}>No reports recorded.</div>;
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '55vh', overflowY: 'auto' }}>
              {list.map((r, i) => (
                <div
                  key={r.id || i}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Report #{r.id || i + 1}: {r.problem || r.description}
                    </span>
                    <span className={`badge badge-${(r.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                      {r.status || 'Pending'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    📍 {r.location} • Area: {r.area || 'Core'} • Assigned: {r.assigned_staff_id || r.assignedStaff || 'Unassigned'}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
