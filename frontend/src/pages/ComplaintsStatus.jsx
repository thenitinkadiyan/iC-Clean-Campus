import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReports } from '../services/api';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  Bot,
  CheckCircle2,
} from 'lucide-react';

const STEPS = [
  { id: 'submitted', label: 'Report Submitted', desc: 'Received & queued' },
  { id: 'assigned', label: 'Staff Assigned', desc: 'Operator dispatched' },
  { id: 'cleaning', label: 'Cleaning In Progress', desc: 'On-site cleanup' },
  { id: 'verification', label: 'AI Verification', desc: 'Photo inspection' },
  { id: 'resolved', label: 'Resolved', desc: 'Area certified clean' },
];

export default function ComplaintsStatus() {
  const { navigate } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getReports();
      setReports(data);
    }
    load();
  }, []);

  const getStepIndex = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'resolved') return 4;
    if (s.includes('verify') || s.includes('verification')) return 3;
    if (s.includes('clean') || s.includes('in progress')) return 2;
    if (s.includes('assigned')) return 1;
    return 0; // submitted or pending
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

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', color: '#064e3b', marginBottom: '4px' }}>
          Track Complaint Pipeline
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Real-time step-by-step progress tracking for your campus cleanliness reports.
        </p>
      </div>

      {reports.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            color: '#64748b',
          }}
        >
          <Clock size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '6px' }}>
            No Complaints Found
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
            Submit a cleanliness report to track its live progress through dispatch and verification.
          </p>
          <button
            onClick={() => navigate('report-garbage')}
            className="btn btn-primary btn-sm"
          >
            Submit a Report
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {reports.map((report, idx) => {
            const currentStepIdx = getStepIndex(report.status);

            return (
              <div
                key={report.id || idx}
                className="card"
                style={{
                  padding: '28px',
                  border: currentStepIdx === 4 ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#059669',
                        background: '#ecfdf5',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Report #{report.id || idx + 1}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: '6px 0 4px' }}>
                      {report.problem || report.description || 'Cleanliness Issue'}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={15} color="#059669" />
                        {report.location}
                      </span>
                      {report.date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={15} />
                          {report.date}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`badge badge-${(report.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}
                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                  >
                    {report.status || 'Pending'}
                  </span>
                </div>

                {/* Progress Stepper Bar */}
                <div
                  style={{
                    margin: '32px 0 20px',
                    padding: '20px 10px',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    overflowX: 'auto',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      minWidth: '580px',
                    }}
                  >
                    {/* Connecting Track */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '18px',
                        left: '40px',
                        right: '40px',
                        height: '4px',
                        background: '#e2e8f0',
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    {STEPS.map((step, sIdx) => {
                      const isCompleted = sIdx < currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;

                      return (
                        <div
                          key={step.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 2,
                            width: '100px',
                          }}
                        >
                          {/* Step circle icon */}
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isCompleted
                                ? '#10b981'
                                : isCurrent
                                ? '#059669'
                                : '#ffffff',
                              color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                              border: isCompleted || isCurrent ? '2px solid #059669' : '2px solid #cbd5e1',
                              boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.25)' : 'none',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              marginBottom: '8px',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {isCompleted ? '✓' : isCurrent ? '●' : sIdx + 1}
                          </div>

                          {/* Step Labels */}
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                              color: isCurrent ? '#064e3b' : isCompleted ? '#0f172a' : '#94a3b8',
                              lineHeight: 1.2,
                              marginBottom: '2px',
                            }}
                          >
                            {step.label}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Guidance Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background:
                      currentStepIdx === 4
                        ? '#ecfdf5'
                        : currentStepIdx === 3
                        ? '#faf5ff'
                        : currentStepIdx >= 1
                        ? '#eff6ff'
                        : '#fffbeb',
                    color:
                      currentStepIdx === 4
                        ? '#065f46'
                        : currentStepIdx === 3
                        ? '#6b21a8'
                        : currentStepIdx >= 1
                        ? '#1e40af'
                        : '#92400e',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                  }}
                >
                  {currentStepIdx === 4 ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>
                        <strong>Resolved:</strong> This area has been cleaned, inspected, and approved. Thank you for making our campus better!
                      </span>
                    </>
                  ) : currentStepIdx === 3 ? (
                    <>
                      <Bot size={18} />
                      <span>
                        <strong>AI & Admin Verification:</strong> Cleaned photos are currently being cross-referenced with your initial report.
                      </span>
                    </>
                  ) : currentStepIdx === 2 ? (
                    <>
                      <Sparkles size={18} />
                      <span>
                        <strong>Cleaning In Action:</strong> The designated cleaning operator is actively working at the reported location.
                      </span>
                    </>
                  ) : currentStepIdx === 1 ? (
                    <>
                      <Clock size={18} />
                      <span>
                        <strong>Staff Assigned:</strong> A cleaning staff member has accepted this ticket and will attend shortly.
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} />
                      <span>
                        <strong>Submitted:</strong> Your report is registered in the queue and awaiting area admin dispatch.
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
