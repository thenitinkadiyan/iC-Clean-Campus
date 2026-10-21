import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReports } from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  Camera,
} from 'lucide-react';
import Modal from '../components/Modal';

export default function MyComplaints() {
  const { navigate } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getReports();
      setReports(data);
    }
    load();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true;
    const s = (r.status || '').toLowerCase();
    if (filter === 'pending') return s === 'pending' || s === 'submitted';
    if (filter === 'in_progress') return s === 'in progress' || s === 'assigned' || s === 'cleaning' || s === 'verification pending';
    if (filter === 'resolved') return s === 'resolved';
    return true;
  });

  const getStatusBadge = (status = 'Pending') => {
    const s = status.toLowerCase().replace(/\s+/g, '-');
    return <span className={`badge badge-${s}`}>{status}</span>;
  };

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <button
        onClick={() => navigate('student-dashboard')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', color: '#064e3b', marginBottom: '4px' }}>
          My Complaints
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Track and review the cleanliness reports you have submitted across campus.
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'all', label: `All Reports (${reports.length})` },
          { key: 'pending', label: 'Pending' },
          { key: 'in_progress', label: 'In Progress / Assigned' },
          { key: 'resolved', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === tab.key ? '1px solid #10b981' : '1px solid transparent',
              background: filter === tab.key ? '#ecfdf5' : 'transparent',
              color: filter === tab.key ? '#065f46' : '#64748b',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {filteredReports.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            color: '#64748b',
          }}
        >
          <Clock size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '6px' }}>
            No complaints found
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
            There are no reports under the selected category.
          </p>
          <button
            onClick={() => navigate('report-garbage')}
            className="btn btn-primary btn-sm"
          >
            Submit New Report
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredReports.map((report, idx) => (
            <div
              key={report.id || idx}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                    Report #{report.id || idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '6px 0 2px' }}>
                    {report.problem || report.description || 'Cleanliness Issue'}
                  </h3>
                </div>
                <div>{getStatusBadge(report.status)}</div>
              </div>

              {report.description && report.description !== report.problem && (
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {report.description}
                </p>
              )}

              {/* Meta details */}
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                  fontSize: '0.875rem',
                  color: '#64748b',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '10px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#059669" />
                  <strong>Location:</strong> {report.location}
                </span>

                {report.area && (
                  <span>
                    <strong>Area:</strong> {report.area}
                  </span>
                )}

                {report.assignedStaff && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} color="#0284c7" />
                    <strong>Assigned Staff:</strong> {report.assignedStaff}
                  </span>
                )}

                {report.date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} />
                    {report.date}
                  </span>
                )}
              </div>

              {/* Pending reason banner if active */}
              {report.pending_reason && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    color: '#92400e',
                    fontSize: '0.85rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>
                    <strong>Pending Reason:</strong> {report.pending_reason}
                  </span>
                </div>
              )}

              {/* Photo preview thumbnail & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                {report.photo ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(report.photo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Camera size={15} color="#059669" />
                    <span>View Submitted Photo</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No photo attached</span>
                )}

                <button
                  onClick={() => navigate('complaints-status')}
                  className="btn btn-outline btn-sm"
                >
                  <Clock size={15} />
                  <span>Track Full Pipeline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        title="Report Evidence Photo"
        maxWidth="600px"
      >
        {selectedPhoto && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedPhoto}
              alt="Evidence"
              style={{
                width: '100%',
                maxHeight: '480px',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
