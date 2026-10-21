import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { submitRecycleRequest } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Recycle,
  UploadCloud,
  ArrowLeft,
  Check,
  X,
  MapPin,
  Sparkles,
  FileSpreadsheet,
  Cpu,
  Boxes,
  HelpCircle,
} from 'lucide-react';

const WASTE_TYPES = [
  { id: 'Paper', label: 'Paper & Cardboard', icon: '📄', color: '#f59e0b' },
  { id: 'Plastic', label: 'Plastic Bottles & Wraps', icon: '🧴', color: '#0ea5e9' },
  { id: 'E-Waste', label: 'Electronic Waste & Gadgets', icon: '💻', color: '#8b5cf6' },
  { id: 'Metal', label: 'Cans, Aluminum & Metal', icon: '🔩', color: '#64748b' },
  { id: 'Other', label: 'Other Recyclable Material', icon: '♻️', color: '#10b981' },
];

export default function RecycleRequest() {
  const { user, navigate } = useAuth();
  const { addToast } = useToast();

  const [selectedTypes, setSelectedTypes] = useState(['Paper']);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTypes.length === 0) {
      addToast('Please select at least one waste category', 'error');
      return;
    }

    if (!location.trim()) {
      addToast('Please enter the pickup location', 'error');
      return;
    }

    if (!description.trim()) {
      addToast('Please enter a brief description', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentGR = user?.gr_number || user?.grNumber || '';

      await submitRecycleRequest({
        types: selectedTypes,
        photo: photoPreview,
        location: location.trim(),
        description: description.trim(),
        studentGR,
      });

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch (err) {}

      addToast('Recycle request submitted! Admin will schedule collection & award points.', 'success');
      navigate('student-dashboard');
    } catch (error) {
      addToast(error.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '720px', paddingBottom: '60px' }}>
      <button
        onClick={() => navigate('student-dashboard')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <div
        className="glass-panel"
        style={{
          padding: '36px 32px',
          borderTop: '4px solid #10b981',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Recycle size={28} />
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#064e3b', marginBottom: '4px' }}>
            Recycle Request ♻️
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Request collection of recyclable materials from your campus location and earn eco-points!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Waste Type Multi-select */}
          <div className="form-group">
            <label className="form-label">Select Waste Categories</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {WASTE_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <div
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '14px 10px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: isSelected ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{type.icon}</span>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#065f46' : '#334155',
                      }}
                    >
                      {type.id}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: '#10b981',
                          color: '#fff',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">Upload Photo of Waste (Optional)</label>
            {photoPreview ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '220px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '2px solid #a7f3d0',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Recycle preview"
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  borderRadius: '14px',
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <UploadCloud size={30} color="#059669" style={{ marginBottom: '6px' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                  Upload photo of materials
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Pickup Location */}
          <div className="form-group">
            <label className="form-label">Pickup Location</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Block 1, 2nd Floor, Room 204 or Study Area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <MapPin
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description & Quantity</label>
            <textarea
              className="textarea-field"
              placeholder="e.g. 5kg old newspapers and 10 plastic bottles bundled for recycling"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: '10px' }}
          >
            {isSubmitting ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Submit Recycle Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
