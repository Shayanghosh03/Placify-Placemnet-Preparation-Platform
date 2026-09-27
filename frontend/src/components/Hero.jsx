import React from 'react';
import { ArrowRight, Play, Check } from 'lucide-react';
import HeroIllustration from './HeroIllustration';

export default function Hero({ onOpenDemoModal, onStartLearning }) {
  return (
    <section className="hero-section">
      {/* Left Text & CTA Column */}
      <div className="hero-left">
        <div className="hero-subtag">
          YOUR PLACEMENT JOURNEY STARTS HERE
        </div>

        <h1 className="hero-headline">
          Prepare Smarter.<br />
          Get{' '}
          <span className="hero-highlight-text">
            Placement Ready.
            <svg
              className="hero-underline-svg"
              viewBox="0 0 240 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 3 9 C 60 2, 180 2, 237 9"
                stroke="#635bff"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="hero-description">
          Comprehensive learning platform for Aptitude, Reasoning, Verbal Ability, DSA and LeetCode problems with handwritten notes, quizzes and personalized suggestions.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta-group">
          <button
            className="btn btn-primary btn-hero-start"
            onClick={onStartLearning}
          >
            Start Learning <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-outline-demo btn-hero-demo"
            onClick={onOpenDemoModal}
          >
            <span className="btn-play-icon">
              <Play size={13} fill="#594dfa" />
            </span>
            Watch Demo
          </button>
        </div>

        {/* Hero Features List */}
        <div className="hero-features-list">
          <div className="hero-feature-item">
            <span className="check-icon-bg">
              <Check size={14} strokeWidth={3} />
            </span>
            <span>Topic-wise Learning</span>
          </div>

          <div className="hero-feature-item">
            <span className="check-icon-bg">
              <Check size={14} strokeWidth={3} />
            </span>
            <span>Practice & Quizzes</span>
          </div>

          <div className="hero-feature-item">
            <span className="check-icon-bg">
              <Check size={14} strokeWidth={3} />
            </span>
            <span>Track Your Progress</span>
          </div>
        </div>
      </div>

      {/* Right Hero Illustration */}
      <HeroIllustration />
    </section>
  );
}
