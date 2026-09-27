import React, { useRef, useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Phone,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

const compressImage = (file, maxWidth = 380, maxHeight = 380, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk'));
    reader.readAsDataURL(file);
  });
};

export default function ProfileSettings({ user, onUpdateUser, onBack }) {
  const fileInputRef = useRef(null);
  const storageKey = `placify_custom_avatar_${user?.id || 'current'}`;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    headline: user?.headline || 'Student account',
    targetRole: user?.targetRole || 'Software Development Engineer',
    college: user?.college || '',
    graduationYear: user?.graduationYear || '2026',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasLocalStorageAvatar, setHasLocalStorageAvatar] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');

  const isGoogle = user?.provider === 'google' || Boolean(user?.googleId);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey) || window.localStorage.getItem('placify_custom_avatar_current');
      if (stored) {
        setHasLocalStorageAvatar(true);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, [storageKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    try {
      setErrorMessage('');
      const compressedBase64 = await compressImage(file);

      // Save directly into localStorage
      try {
        window.localStorage.setItem(storageKey, compressedBase64);
        window.localStorage.setItem('placify_custom_avatar_current', compressedBase64);
        setHasLocalStorageAvatar(true);
      } catch (storageErr) {
        console.warn('LocalStorage write failed:', storageErr);
      }

      // Update current form data & notify parent immediately
      setFormData((prev) => ({ ...prev, avatarUrl: compressedBase64 }));
      if (onUpdateUser) {
        onUpdateUser({ ...user, avatarUrl: compressedBase64 });
      }

      setUploadNotice('Photo saved to local storage! Click "Save Changes" to sync across your account.');
      setTimeout(() => setUploadNotice(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Could not process the selected image');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLocalAvatar = () => {
    try {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem('placify_custom_avatar_current');
      setHasLocalStorageAvatar(false);
    } catch {
      // Ignore storage errors
    }

    // Restore original Google photo or clear
    const fallbackAvatar = isGoogle ? (user?.googleAvatar || user?.avatarUrl || '') : '';
    setFormData((prev) => ({ ...prev, avatarUrl: fallbackAvatar }));
    if (onUpdateUser) {
      onUpdateUser({ ...user, avatarUrl: fallbackAvatar });
    }
    setUploadNotice('Custom local photo removed. Restored account photo.');
    setTimeout(() => setUploadNotice(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      // Also ensure localStorage stays in sync with current avatarUrl
      if (formData.avatarUrl) {
        try {
          window.localStorage.setItem(storageKey, formData.avatarUrl);
          window.localStorage.setItem('placify_custom_avatar_current', formData.avatarUrl);
          setHasLocalStorageAvatar(true);
        } catch {
          // Ignore storage quota warnings
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.user) {
        const merged = {
          ...data.user,
          avatarUrl: formData.avatarUrl || data.user.avatarUrl
        };
        onUpdateUser(merged);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: user?.name || '',
      headline: user?.headline || 'Student account',
      targetRole: user?.targetRole || 'Software Development Engineer',
      college: user?.college || '',
      graduationYear: user?.graduationYear || '2026',
      phone: user?.phone || '',
      bio: user?.bio || '',
      avatarUrl: user?.avatarUrl || ''
    });
    setSaveSuccess(false);
    setErrorMessage('');
  };

  return (
    <div className="profile-settings-page">
      {/* Hidden file input for local computer uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Top Breadcrumb / Navigation */}
      <div className="profile-settings-nav">
        <button type="button" className="profile-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="profile-page-badge">
          <Sparkles size={14} /> Profile Settings
        </span>
      </div>

      {/* Main Profile Header Banner */}
      <div className="profile-header-card">
        <div className="profile-header-banner" />
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <UserAvatar
              user={{ ...user, avatarUrl: formData.avatarUrl, name: formData.name }}
              size="xl"
              showBadge={true}
            />
            {/* Clickable Camera button over avatar */}
            <button
              type="button"
              className="profile-avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload photo from device (stored in local storage)"
              aria-label="Upload photo from device"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="profile-header-info">
            <div className="profile-name-row">
              <h2>{formData.name || 'Placify Learner'}</h2>
            </div>

            <p className="profile-headline">{formData.headline || 'Student account'}</p>
            <p className="profile-email">
              <Mail size={14} />
              <span>{user?.email || 'No email provided'}</span>
            </p>

            {/* Quick Photo Actions Bar */}
            <div className="profile-photo-quick-actions">
              <button
                type="button"
                className="profile-quick-action-btn upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Upload Photo (Local Storage)</span>
              </button>

              {hasLocalStorageAvatar && (
                <button
                  type="button"
                  className="profile-quick-action-btn delete"
                  onClick={handleRemoveLocalAvatar}
                  title="Remove local photo and restore default account photo"
                >
                  <Trash2 size={14} />
                  <span>Restore Default</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notice after upload */}
        {uploadNotice && (
          <div className="profile-local-notice">
            <CheckCircle2 size={16} color="#059669" />
            <span>{uploadNotice}</span>
          </div>
        )}

      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="profile-alert success">
          <CheckCircle2 size={18} />
          <span>Profile changes saved and persisted successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="profile-alert error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form className="profile-settings-form" onSubmit={handleSubmit}>
        <div className="profile-form-grid">
          {/* Card 1: Basic Information */}
          <div className="profile-form-card">
            <div className="card-header">
              <User size={18} className="card-icon" />
              <div>
                <h3>Personal Information</h3>
                <p>Your public name and profile presentation.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                required
                minLength={2}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="headline">Profile Headline</label>
              <input
                id="headline"
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Student account / Pre-final Year CSE"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">About / Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share a short summary of your background, coding skills, and interview goals..."
              />
            </div>
          </div>

          {/* Card 2: Academic & Career Goals */}
          <div className="profile-form-card">
            <div className="card-header">
              <Briefcase size={18} className="card-icon" />
              <div>
                <h3>Placement & Target Career</h3>
                <p>Helps tailor your practice tracks and interview mock tests.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="targetRole">Target Placement Role</label>
              <select
                id="targetRole"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
              >
                <option value="Software Development Engineer">Software Development Engineer (SDE)</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Analyst / Data Scientist">Data Analyst / Data Scientist</option>
                <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                <option value="Core Engineering / Aptitude Track">Core Engineering / Aptitude Track</option>
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="college">College / University</label>
                <div className="input-with-icon">
                  <GraduationCap size={16} />
                  <input
                    id="college"
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. National Institute of Tech"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="graduationYear">Graduation Year</label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone / WhatsApp (Optional)</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="profile-form-actions">
          <button
            type="button"
            className="btn btn-outline-demo"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary profile-save-btn"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
