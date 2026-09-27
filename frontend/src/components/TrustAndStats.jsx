import React from 'react';

// Company brand marks closely matching the original logo system shown in the design reference.
const GoogleLogo = () => (
  <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.05em', lineHeight: 1 }}>
    <span style={{ color: '#4285F4' }}>G</span>
    <span style={{ color: '#EA4335' }}>o</span>
    <span style={{ color: '#FBBC05' }}>o</span>
    <span style={{ color: '#4285F4' }}>g</span>
    <span style={{ color: '#34A853' }}>l</span>
    <span style={{ color: '#EA4335' }}>e</span>
  </span>
);

const MicrosoftLogo = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', width: '18px', height: '18px' }}>
      <div style={{ backgroundColor: '#F25022', width: '8px', height: '8px' }} />
      <div style={{ backgroundColor: '#7FBA00', width: '8px', height: '8px' }} />
      <div style={{ backgroundColor: '#00A4EF', width: '8px', height: '8px' }} />
      <div style={{ backgroundColor: '#FFB900', width: '8px', height: '8px' }} />
    </div>
    <span style={{ color: '#737373', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'Segoe UI, Arial, sans-serif', letterSpacing: '-0.02em' }}>
      Microsoft
    </span>
  </div>
);

const AdobeLogo = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Adobe logo">
      <rect width="20" height="20" rx="2" fill="#FF0000" />
      <path d="M4 16L8.5 4H11.6L16 16H13.3L12.2 12.7H8.1L7.1 16H4ZM8.7 10.2H11.5L10.8 7.9L8.7 10.2Z" fill="#FFFFFF" />
    </svg>
    <span style={{ color: '#FF0000', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Arial, sans-serif', letterSpacing: '-0.02em' }}>
      Adobe
    </span>
  </div>
);

const InfosysLogo = () => (
  <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.08em' }}>
    <span style={{ color: '#1f7ae0', fontWeight: 700, fontSize: '1.18rem', fontFamily: 'Arial, sans-serif', letterSpacing: '-0.03em' }}>Infosys</span>
    <span style={{ color: '#1f7ae0', fontWeight: 700, fontSize: '0.7rem', verticalAlign: 'super', fontFamily: 'Arial, sans-serif' }}>®</span>
  </div>
);

export default function TrustAndStats() {
  return (
    <>
      <div className="trust-stats-wrapper">
        {/* Left Side: Brand Logos */}
        <div className="trust-brands-side">
          <div className="trust-label">
            Trusted by<br />thousands of<br />aspiring developers
          </div>
          <div className="brand-logos-grid">
            <div className="brand-logo-cell"><GoogleLogo /></div>
            <div className="brand-logo-cell"><MicrosoftLogo /></div>
            <div className="brand-logo-cell"><AdobeLogo /></div>
            <div className="brand-logo-cell"><InfosysLogo /></div>
          </div>
        </div>

        {/* Vertical Divider Line */}
        <div className="stats-divider"></div>

        {/* Right Side: Stats Numbers */}
        <div className="stats-grid-side">
          <div className="stat-box">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Active Learners</span>
          </div>

          <div className="stat-box">
            <span className="stat-number">500+</span>
            <span className="stat-label">Practice Questions</span>
          </div>

          <div className="stat-box">
            <span className="stat-number">100+</span>
            <span className="stat-label">Handwritten Notes</span>
          </div>

          <div className="stat-box">
            <span className="stat-number">50+</span>
            <span className="stat-label">Mock Tests</span>
          </div>
        </div>
      </div>

      {/* Quote Footer Section */}
      <div className="quote-footer">
        "A small step of practice today can lead to a big opportunity tomorrow."
      </div>
    </>
  );
}
