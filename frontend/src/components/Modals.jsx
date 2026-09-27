import React, { useMemo, useState } from 'react';
import { X, Check, Play, RefreshCw, Eye, EyeOff } from 'lucide-react';

const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
};

const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/;

const analyzePasswordStrength = (password) => {
  const checks = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'lower', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'upper', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', met: /\d/.test(password) },
    { id: 'special', label: 'One special symbol (!@#$%^&*)', met: SPECIAL_CHAR_PATTERN.test(password) }
  ];

  const metCount = checks.filter((check) => check.met).length;
  let level = 'weak';
  let label = 'Weak password';

  if (metCount >= 5) {
    level = 'strong';
    label = 'Strong password';
  } else if (metCount >= 4) {
    level = 'good';
    label = 'Good password';
  } else if (metCount >= 2) {
    level = 'fair';
    label = 'Fair password';
  }

  return {
    checks,
    level,
    label,
    score: metCount,
    isStrong: checks.every((check) => check.met)
  };
};

const labelStyle = {
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#475569',
  display: 'block',
  marginBottom: '6px'
};

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  minLength,
  placeholder = '••••••••'
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div className="password-field">
        <input
          type={visible ? 'text' : 'password'}
          required
          minLength={minLength}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="password-input"
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={onToggleVisibility}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function PasswordStrengthPanel({ password }) {
  const strength = useMemo(() => analyzePasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="password-strength-panel">
      <div className="password-strength-header">
        <span className={`password-strength-label password-strength-label--${strength.level}`}>
          {strength.label}
        </span>
        <span className="password-strength-score">{strength.score}/5 checks passed</span>
      </div>
      <div className="password-strength-bar" aria-hidden="true">
        <div
          className={`password-strength-fill password-strength-fill--${strength.level}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
      <ul className="password-requirements">
        {strength.checks.map((check) => (
          <li key={check.id} className={check.met ? 'met' : ''}>
            <Check size={14} strokeWidth={check.met ? 3 : 2} />
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Modals({
  authModalType,
  setAuthModalType,
  showDemoModal,
  setShowDemoModal,
  selectedCategory,
  setSelectedCategory,
  selectedFeature,
  setSelectedFeature,
  onLoginSuccess
}) {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = useMemo(
    () => analyzePasswordStrength(authPassword),
    [authPassword]
  );

  React.useEffect(() => {
    const modalOpen = Boolean(authModalType) || showDemoModal || Boolean(selectedCategory) || Boolean(selectedFeature);
    document.body.style.overflow = modalOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [authModalType, showDemoModal, selectedCategory, selectedFeature]);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaAnswer('');
  };

  const resetRegisterFields = () => {
    setAuthConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCaptchaAnswer('');
    setCaptcha(generateCaptcha());
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authModalType === 'register') {
      if (!passwordStrength.isStrong) {
        setAuthError('Choose a stronger password with uppercase, lowercase, numbers, and special symbols like !@#$%^&*');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }
      if (Number(captchaAnswer.trim()) !== captcha.answer) {
        setAuthError('Incorrect CAPTCHA. Please try again.');
        refreshCaptcha();
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/${authModalType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to authenticate');
      }

      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
        setIsSubmitting(false);
        setAuthModalType(null);
        onLoginSuccess(data?.user);
      }, 900);
    } catch (error) {
      setAuthError(error.message);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.assign(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`);
  };

  const switchAuthMode = (mode) => {
    setAuthError('');
    resetRegisterFields();
    setAuthModalType(mode);
  };

  const closeAuthModal = () => {
    setAuthError('');
    resetRegisterFields();
    setAuthModalType(null);
  };

  /* The Google callback sets a cookie and redirects back with this marker. */
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get('authenticated') !== '1') return;
    window.history.replaceState({}, '', window.location.pathname);
    onLoginSuccess();
  }, [onLoginSuccess]);

  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get('oauth_error') !== 'google_auth_failed') return;
    setAuthError('Google login was not completed. Check the OAuth redirect URI and try again.');
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  return (
    <>
      {/* 1. Auth Modal (Login / Register) */}
      {authModalType && (
        <div className="modal-overlay">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={closeAuthModal}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {authModalType === 'login' ? 'Welcome Back!' : 'Create Your Placify Account'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                {authModalType === 'login'
                  ? 'Login to access your notes, progress and mock tests'
                  : 'Start your journey to crack placement interviews today'}
              </p>
            </div>

            {authSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: '#d1fae5',
                    color: '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12
                  }}
                >
                  <Check size={28} strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {authModalType === 'login' ? 'Successfully Logged In!' : 'Account Created!'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                  Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {authModalType === 'register' && (
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <PasswordField
                  label="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  visible={showPassword}
                  onToggleVisibility={() => setShowPassword((current) => !current)}
                  minLength={authModalType === 'register' ? 8 : undefined}
                />

                {authModalType === 'register' && (
                  <>
                    <PasswordStrengthPanel password={authPassword} />

                    <PasswordField
                      label="Confirm Password"
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      visible={showConfirmPassword}
                      onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
                      minLength={8}
                    />
                    {authConfirmPassword && authPassword !== authConfirmPassword && (
                      <p className="password-match-error">Passwords do not match</p>
                    )}

                    <div>
                      <label style={labelStyle}>Verification CAPTCHA</label>
                      <div className="captcha-row">
                        <div className="captcha-challenge" aria-hidden="true">
                          {captcha.a} + {captcha.b} = ?
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Answer"
                          value={captchaAnswer}
                          onChange={(e) => setCaptchaAnswer(e.target.value)}
                          className="captcha-input"
                          aria-label="CAPTCHA answer"
                        />
                        <button
                          type="button"
                          className="captcha-refresh-btn"
                          onClick={refreshCaptcha}
                          aria-label="Refresh CAPTCHA"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                      <p className="captcha-hint">Verify you&apos;re human before creating your account</p>
                    </div>
                  </>
                )}

                {authError && <p role="alert" style={{ color: '#dc2626', fontSize: '0.82rem', margin: 0 }}>{authError}</p>}

                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '12px', marginTop: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Please wait...' : authModalType === 'login' ? 'Login Now' : 'Create Free Account'}
                </button>

                <button type="button" className="btn btn-outline-demo" onClick={handleGoogleLogin}>
                  <svg className="google-logo" viewBox="0 0 18 18" aria-hidden="true">
                    <path fill="#EA4335" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.796 2.715v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.614Z" />
                    <path fill="#4285F4" d="M9 18c2.43 0 4.467-.806 5.956-2.181l-2.908-2.258c-.806.54-1.835.86-3.048.86-2.344 0-4.33-1.584-5.04-3.713H.954v2.332A9 9 0 0 0 9 18Z" />
                    <path fill="#FBBC05" d="M3.96 10.708A5.41 5.41 0 0 1 3.677 9c0-.593.102-1.17.283-1.708V4.96H.954A9 9 0 0 0 0 9c0 1.453.348 2.827.954 4.04l3.006-2.332Z" />
                    <path fill="#34A853" d="M9 3.58c1.322 0 2.508.454 3.442 1.346l2.582-2.582C13.463.892 11.426 0 9 0A9 9 0 0 0 .954 4.96L3.96 7.292C4.67 5.163 6.656 3.58 9 3.58Z" />
                  </svg>
                  Continue with Google
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.84rem', color: '#64748b', marginTop: '10px' }}>
                  {authModalType === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <span
                        onClick={() => switchAuthMode('register')}
                        style={{ color: '#635bff', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Sign Up
                      </span>
                    </>
                  ) : (
                    <>
                      Already registered?{' '}
                      <span
                        onClick={() => switchAuthMode('login')}
                        style={{ color: '#635bff', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Login
                      </span>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Demo Video Preview Modal */}
      {showDemoModal && (
        <div className="modal-overlay">
          <div
            className="modal-card"
            style={{ maxWidth: '640px', padding: '0', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', padding: '20px 24px', background: '#ffffff', color: '#0f172a', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Play size={20} color="#635bff" fill="#635bff" />
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Placify Platform Walkthrough</span>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', color: '#64748b', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#ffffff', color: '#0f172a' }}>
              <div style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', border: '1px solid #c4b5fd', background: '#f5f3ff' }}>
                <iframe
                  title="Placify Platform Walkthrough"
                  src="https://www.youtube.com/embed/aqz-KE-bpKQ"
                  style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Interactive Learning Demo</h4>
                <p style={{ fontSize: '0.82rem', color: '#6366f1', marginTop: 4 }}>
                  Learn how 10,000+ students crack tech & non-tech placement rounds
                </p>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-around', fontSize: '0.84rem', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} color="#10b981" /> 100+ Handwritten Notes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} color="#10b981" /> Topic-wise Practice
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} color="#10b981" /> Company Tests
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. Category Explorer Modal */}
      {selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedCategory(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div className={`card-icon-badge`} style={{ margin: 0 }}>
                {React.createElement(selectedCategory.icon, { size: 24 })}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedCategory.title} Track</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedCategory.description}</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: 12 }}>
                Included Key Topics & Practice Modules:
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedCategory.topics.map((t, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#635bff' }}></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setSelectedCategory(null);
                  setAuthModalType('register');
                }}
              >
                Start Learning Now
              </button>
              <button
                className="btn btn-login"
                style={{ flex: 1 }}
                onClick={() => setSelectedCategory(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Feature Item Preview Modal */}
      {selectedFeature && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedFeature(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="feature-item-icon" style={{ width: 44, height: 44 }}>
                {React.createElement(selectedFeature.icon, { size: 24, color: selectedFeature.iconColor })}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedFeature.title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b' }}>{selectedFeature.subtitle}</p>
              </div>
            </div>

            <div style={{ padding: 20, backgroundColor: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 20, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
              {selectedFeature.id === 'notes' && (
                <div>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                    📚 Curated Handwritten Notes PDF Collection:
                  </p>
                  <p>Includes high-resolution diagrams, formula cheat sheets, shortcuts for Aptitude, and solved DSA code examples for Google, Amazon & TCS interviews.</p>
                </div>
              )}
              {selectedFeature.id === 'mock' && (
                <div>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                    ⏱️ Timed Mock Tests & Quizzes:
                  </p>
                  <p>Simulate actual placement company exams with real time limits, negative marking, and instant detailed solutions with percentile rankings.</p>
                </div>
              )}
              {selectedFeature.id === 'tracking' && (
                <div>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                    📊 AI Analytics & Growth Tracker:
                  </p>
                  <p>Monitor your accuracy rate, speed per question, subject-wise strengths, and maintain your daily study streak automatically.</p>
                </div>
              )}
              {selectedFeature.id === 'suggestions' && (
                <div>
                  <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                    💡 Smart Personal Study Recommendations:
                  </p>
                  <p>Our algorithm identifies your weak topics from quiz data and generates custom daily problem recommendations tailored for your targeted companies.</p>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                setSelectedFeature(null);
                setAuthModalType('register');
              }}
            >
              Access {selectedFeature.title}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
