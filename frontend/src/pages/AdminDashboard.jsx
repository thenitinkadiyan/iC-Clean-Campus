import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  getAdminStats,
  getReports,
  getRecycleRequests,
  acceptRecycleRequest,
  getStaffMembers,
  updateReportStatus,
} from '../services/api';
import {
  Shield,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Recycle,
  MapPin,
  Calendar,
  Check,
  UserCheck,
  Award,
} from 'lucide-react';
import Modal from '../components/Modal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState({
    total_reports: 0,
    in_progress: 0,
    resolved: 0,
    pending: 0,
  });
  const [reports, setReports] = useState([]);
  const [recycleRequests, setRecycleRequests] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [pointsInputs, setPointsInputs] = useState({});
  const [assignModalReport, setAssignModalReport] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const refreshData = async () => {
    try {
      const [s, rep, rec, staff] = await Promise.all([
        getAdminStats(),
        getReports(),
        getRecycleRequests(),
        getStaffMembers(),
      ]);
      setStats(s);
      setReports(rep || []);
      setRecycleRequests(rec || []);
      setStaffMembers(staff || []);
      if (staff && staff.length > 0 && !selectedStaffId) {
        setSelectedStaffId(String(staff[0].user_id || staff[0].id));
      }
    } catch (e) {
      console.error('Error refreshing admin data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Dynamically calculate pending reasons from actual reports
  const pendingReports = reports.filter(
    (r) => (r.status || '').toLowerCase() !== 'resolved'
  );
  const unassignedCount = pendingReports.filter(
    (r) => !r.assigned_staff_id && !r.assignedStaff && !r.assigned_staff_name
  ).length;
  const inProgressCount = pendingReports.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'in progress' || s === 'assigned' || s === 'cleaning';
  }).length;
  const verificationCount = pendingReports.filter((r) => {
    const s = (r.status || '').toLowerCase();
    return s === 'verification pending' || s === 'submitted' || s === 'pending';
  }).length;

  const dynamicPendingReasons = [
    { reason: 'Pending Staff Assignment', count: unassignedCount },
    { reason: 'On-site Cleaning In Progress', count: inProgressCount },
    { reason: 'Awaiting Operator / Verification', count: verificationCount },
  ].filter((item) => item.count > 0);

  const handleResolveReport = async (reportId) => {
    try {
      await updateReportStatus(reportId, { status: 'Resolved' });
      addToast(`Report #${reportId} marked as Resolved! +10 bonus points synced to student 🏆`, 'success');
      await refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to mark report resolved', 'error');
    }
  };

  const handleAssignStaff = async () => {
    if (!assignModalReport) return;
    const staffObj = staffMembers.find(
      (s) => String(s.user_id || s.id) === String(selectedStaffId)
    );
    const staffName = staffObj?.name || 'Cleaning Staff';

    try {
      await updateReportStatus(assignModalReport.id, {
        status: 'In Progress',
        assigned_staff_id: Number(selectedStaffId) || null,
        assigned_staff_name: staffName,
      });
      addToast(`Report #${assignModalReport.id} assigned to ${staffName}`, 'success');
      setAssignModalReport(null);
      await refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to assign staff member', 'error');
    }
  };

  const handleApproveRecycle = async (reqId) => {
    const pts = Number(pointsInputs[reqId] || 15);
    if (!pts || pts <= 0) {
      addToast('Please enter a valid points amount', 'error');
      return;
    }
    try {
      await acceptRecycleRequest(reqId, pts);
      addToast(`Recycle request approved! ${pts} points awarded & synced to student 🏆`, 'success');
      await refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to approve recycle request', 'error');
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Profile Header */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          borderTop: '4px solid #10b981',
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
              background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(202, 138, 4, 0.25)',
            }}
          >
            <Layers size={30} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', color: '#713f12', margin: 0 }}>
                {user?.name || 'Area Administrator'}
              </h1>
              <span className="badge badge-resolved">Area Admin</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              <strong>Admin ID:</strong> {user?.login_id || 'admin_a'} •{' '}
              <strong>Assigned Zone:</strong> {user?.area || 'Block 2 & Sector Core'}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Campus Security Level</span>
          <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1.05rem' }}>
            🟢 Normal Operations
          </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>
        Area Overview & Activity
      </h2>
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '22px' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#065f46' }}>
            {stats.total_reports || reports.length}
          </div>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Total Reports</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '22px' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0ea5e9' }}>
            {stats.in_progress}
          </div>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>In Progress</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '22px' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10b981' }}>
            {stats.resolved}
          </div>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Resolved</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '22px' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f59e0b' }}>
            {stats.pending}
          </div>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Awaiting Action</p>
        </div>
      </div>

      {/* Staff Roster & Diagnostic Grid */}
      <div className="grid-2" style={{ marginBottom: '36px' }}>
        {/* Today's Staff Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#064e3b', margin: 0 }}>Cleaning Operators</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {staffMembers.length} Registered
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {staffMembers.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.88rem', padding: '16px 0', textAlign: 'center' }}>
                No cleaning staff registered in your zone yet.
                <br />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  (Main Admin can add staff in Main Admin Console)
                </span>
              </div>
            ) : (
              staffMembers.map((staff, idx) => (
                <div
                  key={staff.user_id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>
                      {staff.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      ID: {staff.login_id} • Area: {staff.area || 'Assigned Zone'}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#ecfdf5',
                      color: '#065f46',
                    }}
                  >
                    ● Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Why Reports Are Pending Diagnostic */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', color: '#064e3b', marginBottom: '16px' }}>
            Live Complaint Diagnostics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dynamicPendingReasons.length === 0 ? (
              <div style={{ color: '#059669', fontSize: '0.9rem', padding: '16px 0', textAlign: 'center', fontWeight: 600 }}>
                ✨ All reported areas are currently clean or resolved!
              </div>
            ) : (
              dynamicPendingReasons.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: 500 }}>
                    {item.reason}
                  </span>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#fef08a',
                      color: '#713f12',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Student Reports Queue */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>
          Student Reports Queue
        </h2>

        {reports.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
            No reports filed yet for this area.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reports.map((report, idx) => {
              const isResolved = (report.status || '').toLowerCase() === 'resolved';

              return (
                <div
                  key={report.id || idx}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                    border: isResolved ? '1px solid #e2e8f0' : '1.5px solid #fed7aa',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                        #{report.id || idx + 1}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                        {report.problem || report.description || 'Cleanliness Issue'}
                      </h3>
                      <span className={`badge badge-${(report.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                        {report.status || 'Pending'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#64748b', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#059669" />
                        {report.location}
                      </span>
                      {(report.assigned_staff_name || report.assignedStaff || report.assigned_staff_id) && (
                        <span>
                          <strong>Assigned:</strong> {report.assigned_staff_name || report.assignedStaff || `Staff #${report.assigned_staff_id}`}
                        </span>
                      )}
                      <span>
                        <strong>Student:</strong> {report.student_gr || report.studentGR || (report.student_id ? `ID #${report.student_id}` : 'Student')}
                      </span>
                      {report.created_at && <span><strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!isResolved && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setAssignModalReport(report)}
                        >
                          <UserCheck size={14} />
                          <span>Assign Staff</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          <Check size={14} />
                          <span>Resolve</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recycle Requests Queue */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '16px' }}>
          ♻️ Student Recycle Requests
        </h2>

        {recycleRequests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
            No recycle collection requests submitted yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recycleRequests.map((req, idx) => (
              <div
                key={req.id || idx}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-accepted">
                      {req.type}
                    </span>
                    <span className={`badge badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </div>

                  <p style={{ color: '#1e293b', fontSize: '0.95rem', margin: '4px 0' }}>
                    <strong>Details:</strong> {req.description}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    📍 {req.location} • Student: {req.studentGR || 'Student'} • {req.date}
                  </p>
                </div>

                <div>
                  {req.status === 'Pending' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        placeholder="Pts"
                        min="1"
                        style={{
                          width: '70px',
                          padding: '8px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                        }}
                        value={pointsInputs[req.id] || 15}
                        onChange={(e) =>
                          setPointsInputs({ ...pointsInputs, [req.id]: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApproveRecycle(req.id)}
                      >
                        <Award size={14} />
                        <span>Accept & Award Points</span>
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                      🏆 {req.points || 0} pts Awarded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Assignment Modal */}
      <Modal
        isOpen={Boolean(assignModalReport)}
        onClose={() => setAssignModalReport(null)}
        title="Assign Cleaning Operator"
        subtitle={`Assign task for Report #${assignModalReport?.id}`}
      >
        <div className="form-group">
          <label className="form-label">Select Staff Member</label>
          <select
            className="select-field"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffMembers.length === 0 ? (
              <option value="">No staff members registered in your zone</option>
            ) : (
              staffMembers.map((s) => (
                <option key={s.user_id || s.id} value={s.user_id || s.id}>
                  {s.name} ({s.login_id}) — {s.area || 'General Area'}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setAssignModalReport(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAssignStaff}
          >
            Confirm Assignment
          </button>
        </div>
      </Modal>
    </div>
  );
}
