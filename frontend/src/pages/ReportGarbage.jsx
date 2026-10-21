import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { submitGarbageReport } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Camera,
  MapPin,
  Compass,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

const COMMON_PROBLEMS = [
  'Dustbin Overflow',
  'Litter in Hallway',
  'Washroom Cleaning',
  'Canteen Waste',
  'Lab Trash Spill',
  'Outdoor Dry Leaves',
  'Hazardous / Broken Glass',
];

const CAMPUS_AREAS = [
  'Block 1',
  'Block 2',
  'Block 3',
  'Block 4',
  'Main Administrative Block',
  'Central Library',
  'Student Canteen & Food Court',
  'Sports Complex & Ground',
];

export default function ReportGarbage() {
  const { user, navigate, awardPoints } = useAuth();
  const { addToast } = useToast();

  const [photoPreview, setPhotoPreview] = useState(null);
  const [problem, setProblem] = useState('');
  const [area, setArea] = useState('Block 2');
  const [locationText, setLocationText] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude.toFixed(5), lng: longitude.toFixed(5) });
        if (!locationText) {
          setLocationText(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (${area})`);
        }
        setIsLocating(false);
        addToast('Location detected successfully!', 'success');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback campus coordinate
        setCoordinates({ lat: '30.7180', lng: '76.7118' });
        if (!locationText) {
          setLocationText(`CGC Mohali Campus Ground (${area})`);
        }
        setIsLocating(false);
        addToast('Set to CGC Mohali campus coordinates', 'info');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!problem.trim()) {
      addToast('Please specify the problem or select a category', 'error');
      return;
    }

    if (!locationText.trim()) {
      addToast('Please provide a specific location', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentId = user?.id || user?.user_id || 1;
      const studentGR = user?.gr_number || user?.grNumber || 'GR1001';

      await submitGarbageReport({
        studentId,
        studentGR,
        problem: problem.trim(),
        location: locationText.trim(),
        description: description.trim() || problem.trim(),
        photo: photoPreview || '',
        area,
      });

      // Award points for active campus engagement!
      awardPoints(studentGR, 10);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
        });
      } catch (err) {
        // ignore if canvas not supported
      }

      addToast('Report submitted! +10 Points awarded to your profile 🏆', 'success');
      navigate('my-complaints');
    } catch (error) {
      addToast(error.message || 'Failed to submit report', 'error');
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
            <Camera size={28} />
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#064e3b', marginBottom: '4px' }}>
            Report Garbage
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Help us keep the campus clean and hygienic. Earn 10 points per verified report!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Photo Upload Section */}
          <div className="form-group">
            <label className="form-label">Upload Photo</label>
            {photoPreview ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '260px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '2px solid #a7f3d0',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '30px 20px',
                  borderRadius: '14px',
                  border: '2px dashed #94a3b8',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = '#ecfdf5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <UploadCloud size={36} color="#059669" style={{ marginBottom: '8px' }} />
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                  Click to snap or upload a photo
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  PNG, JPG or JPEG from camera
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

          {/* Quick Problem Categories */}
          <div className="form-group">
            <label className="form-label">Problem Category</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {COMMON_PROBLEMS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProblem(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: problem === cat ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                    background: problem === cat ? '#ecfdf5' : '#ffffff',
                    color: problem === cat ? '#065f46' : '#475569',
                    fontWeight: problem === cat ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="Or type problem e.g. Dustbin Overflow"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
            />
          </div>

          {/* Campus Area & Geolocation */}
          <div className="form-group">
            <label className="form-label">Campus Zone / Area</label>
            <select
              className="select-field"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              {CAMPUS_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Location Details with Auto Detect */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <label className="form-label" style={{ margin: 0 }}>Specific Location</label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f0fdf4',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Compass size={14} color="#10b981" />
                <span>{isLocating ? 'Detecting...' : 'Use My GPS Location'}</span>
              </button>
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="e.g. Block 3, 5th Floor, Near Room 502"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              required
            />

            {coordinates && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  background: '#f0fdf4',
                  borderRadius: '10px',
                  border: '1px solid #d1fae5',
                  fontSize: '0.8rem',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} />
                  GPS: {coordinates.lat}, {coordinates.lng}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'underline', fontWeight: 600 }}
                >
                  View on Map
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="textarea-field"
              placeholder="Provide any additional helpful notes for the cleaning staff..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: '10px' }}
          >
            {isSubmitting ? (
              <span>Submitting Report...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Submit Report & Earn Points</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
