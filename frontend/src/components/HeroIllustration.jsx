import React from 'react';
import heroImg from '../assets/hero_illustration.jpg';

export default function HeroIllustration() {
  return (
    <div className="hero-right-visual" style={{ width: '100%', maxWidth: '580px', display: 'flex', justifyContent: 'center' }}>
      <img
        src={heroImg}
        alt="Placify Hero Illustration - Learn, Practice, Solve, Get Placed"
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '20px',
          objectFit: 'contain',
          filter: 'drop-shadow(0 12px 24px rgba(99, 91, 255, 0.12))',
          transition: 'transform 0.3s ease'
        }}
      />
    </div>
  );
}
