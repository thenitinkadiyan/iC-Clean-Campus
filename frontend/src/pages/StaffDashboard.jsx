import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getStaffTasks, getReports, updateReportStatus } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  UploadCloud,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isOnline, setIsOnline] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState({});
  const [verifyingTaskId, setVerifyingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const staffId = user?.user_id || user?.id || null;
      const [assignedCleaningTasks, allReports] = await Promise.all([
        staffId ? getStaffTasks(staffId).catch(() => []) : [],
        getReports().catch(() => []),
      ]);

      const relevantReports = (allReports || []).filter((r) => {
        const isAssignedToMe =
          (staffId && Number(r.assigned_staff_id) === Number(staffId)) ||
          r.assigned_staff_name === user?.name ||
          r.assignedStaff === user?.name;
        const isInMyArea = !r.assigned_staff_id && user?.area && r.area === user?.area;
        return isAssignedToMe || isInMyArea;
      });

      const cleaningTasksList = Array.isArray(assignedCleaningTasks)
        ? assignedCleaningTasks
        : assignedCleaningTasks && assignedCleaningTasks.task_id
        ? [assignedCleaningTasks]
        : [];

      // Merge cleaning tasks and assigned reports
      const combined = [...cleaningTasksList, ...relevantReports];
      setTasks(combined);
    } catch (err) {
      console.error('Error fetching staff tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleAfterPhotoUpload = (taskId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAfterPhotos((prev) => ({ ...prev, [taskId]: reader.result }));
      addToast('After-cleaning photo uploaded', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteTask = async (taskId) => {
    if (!afterPhotos[taskId]) {
      addToast('Please upload an after-cleaning photo first', 'error');
      return;
    }

    setVerifyingTaskId(taskId);
    addToast('Task submitted! AI image verification in progress...', 'info');

    try {
      await updateReportStatus(taskId, {
        status: 'Resolved',
        after_photo: afterPhotos[taskId],
      });

      setVerifyingTaskId(null);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId || t.task_id === taskId
            ? { ...t, status: 'Resolved', aiVerified: true, after_photo: afterPhotos[taskId] }
            : t
        )
      );

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          colors: ['#10b981', '#059669', '#34d399'],
        });
      } catch (e) {}

      addToast('Work verified! Cleanliness marked Resolved and student awarded points ✅', 'success');
      await fetchTasks();
    } catch (err) {
      setVerifyingTaskId(null);
      addToast(err.message || 'Failed to complete task', 'error');
    }
  };

  const openLocationMap = (loc) => {
    const q = encodeURIComponent(`CGC University Mohali ${loc}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Staff Profile Header Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(13, 148, 136, 0.25)',
            }}
          >
            <Briefcase size={32} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', color: '#134e4a', margin: 0 }}>
                {user?.name || 'Cleaning Staff'}
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: isOnline ? '#ecfdf5' : '#f1f5f9',
                  color: isOnline ? '#065f46' : '#64748b',
                  border: `1px solid ${isOnline ? '#a7f3d0' : '#cbd5e1'}`,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isOnline ? '#10b981' : '#94a3b8',
                  }}
                />
                {isOnline ? 'Active Online' : 'Off Duty'}
              </span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              <strong>Staff ID:</strong> {user?.login_id || 'staff_02'} •{' '}
              <strong>Assigned Area:</strong> {user?.area || 'Block 2 & Perimeter'}
            </p>
          </div>
        </div>

        {/* Online / Offline switch */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#1e293b',
          }}
        >
          {isOnline ? <ToggleRight size={24} color="#10b981" /> : <ToggleLeft size={24} color="#94a3b8" />}
          <span>Duty Status: {isOnline ? 'On Duty' : 'Offline'}</span>
        </button>
      </div>

      {/* Task Section */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#064e3b' }}>Today's Cleaning Queue</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Assigned clean-up requests requiring inspection and on-site clearance.
          </p>
        </div>
        <span className="badge badge-in_progress">
          {tasks.filter((t) => t.status !== 'Resolved').length} Active
        </span>
      </div>

      {tasks.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            color: '#64748b',
          }}
        >
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#064e3b', marginBottom: '6px' }}>
            🎉 No Pending Cleaning Tasks!
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            All assigned campus areas are currently reported clean. Enjoy your break!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tasks.map((task, idx) => {
            const taskId = task.id || task.task_id || idx + 1;
            const isDone = task.status === 'Resolved';
            const isVerifying = verifyingTaskId === taskId;

            return (
              <div
                key={taskId}
                className="card"
                style={{
                  padding: '24px',
                  border: isDone ? '1.5px solid #a7f3d0' : '1px solid #cbd5e1',
                  background: isDone ? '#f0fdf4' : '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#065f46',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Task #{idx + 1}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: '6px 0 2px' }}>
                      {task.title || task.problem || 'Clean Garbage Area'}
                    </h3>
                  </div>

                  <span
                    className={`badge badge-${(task.status || 'in_progress').toLowerCase().replace(/\s+/g, '-')}`}
                    style={{ fontSize: '0.82rem', padding: '5px 12px' }}
                  >
                    {task.status || 'In Progress'}
                  </span>
                </div>

                {task.description && (
                  <p style={{ color: '#475569', fontSize: '0.95rem', margin: '8px 0' }}>
                    {task.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    color: '#475569',
                    margin: '12px 0 16px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="#059669" />
                    <strong>Location:</strong> {task.location || 'Campus Core'}
                  </span>
                  <span>
                    <strong>Area:</strong> {task.area || user?.area || 'Block 2'}
                  </span>
                  <span>
                    <strong>Priority:</strong>{' '}
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>
                      {task.priority || 'High'}
                    </span>
                  </span>
                </div>

                {/* Report Photo (Before) */}
                {task.photo && (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                      📷 Student Report Evidence (Before):
                    </span>
                    <img
                      src={task.photo}
                      alt="Before cleaning"
                      style={{
                        display: 'block',
                        width: '100%',
                        maxHeight: '220px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        marginTop: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </div>
                )}

                {/* Actions Grid */}
                {!isDone ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => openLocationMap(task.location)}
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={15} />
                        <span>Open GPS in Google Maps</span>
                      </button>

                      {/* Upload After Photo button */}
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                        <Camera size={15} />
                        <span>
                          {afterPhotos[taskId]
                            ? '✓ Photo Selected (Replace)'
                            : 'Upload After-Cleaning Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAfterPhotoUpload(taskId, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {afterPhotos[taskId] && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={afterPhotos[taskId]}
                          alt="After cleaning preview"
                          style={{
                            width: '80px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #10b981',
                          }}
                        />
                        <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                          Ready for AI verification
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCompleteTask(taskId)}
                      disabled={isVerifying}
                      className="btn btn-primary"
                      style={{ height: '44px' }}
                    >
                      {isVerifying ? (
                        <>
                          <Sparkles size={18} className="pulse-animation" />
                          <span>AI Verification in Progress...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Kaam Complete (Submit for AI Verification)</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: '#ecfdf5',
                      borderRadius: '8px',
                      color: '#065f46',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Cleanliness verified & task marked Resolved!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
