import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MainCategories from './components/MainCategories';
import FeatureBar from './components/FeatureBar';
import TrustAndStats from './components/TrustAndStats';
import Modals from './components/Modals';
import ProfileSettings from './components/ProfileSettings';
import UserAvatar from './components/UserAvatar';
import { useDashboard } from './hooks/useDashboard.js';
import { ArrowRight, ArrowUpRight, BarChart3, BookOpen, Bookmark, CheckCircle2, ChevronLeft, ChevronRight, CirclePlay, Code2, Download, FileText, Filter, Flame, Home, LayoutDashboard, LogOut, Mail, MapPin, Menu, NotebookTabs, PlayCircle, RotateCcw, Search, Send, Settings, Target, Trophy, Users, X, Zap } from 'lucide-react';
import './App.css';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const getFirstName = (fullName) => {
  if (!fullName) return 'learner';
  const first = fullName.trim().split(' ')[0];
  return first || 'learner';
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [initialDashboardTab, setInitialDashboardTab] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'Home';
    const savedTab = window.localStorage.getItem('placify-active-tab');
    const validTabs = ['Home', 'About', 'Contact', 'Courses', 'LeetCode', 'Notes', 'Mock Tests'];
    return validTabs.includes(savedTab) ? savedTab : 'Home';
  });
  const [authModalType, setAuthModalType] = useState(null); // 'login' | 'register' | null
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [contactSent, setContactSent] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [homeViewOverride, setHomeViewOverride] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('placify-view') !== 'dashboard';
  });

  const fetchUser = async () => {
    try {
      const isOAuthCallback = new URLSearchParams(window.location.search).get('authenticated') === '1';
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        let customAvatar = null;
        try {
          customAvatar = window.localStorage.getItem(`placify_custom_avatar_${data.user.id}`) || window.localStorage.getItem('placify_custom_avatar_current');
        } catch {
          // ignore
        }
        const effectiveUser = {
          ...data.user,
          googleAvatar: data.user.avatarUrl,
          avatarUrl: customAvatar || data.user.avatarUrl
        };
        setUser(effectiveUser);
        if (isOAuthCallback) {
          setInitialDashboardTab('Dashboard');
          persistView('dashboard');
          handleTabChange('Home');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        return effectiveUser;
      } else {
        setIsLoggedIn(false);
        setUser(null);
        persistView('home');
      }
    } catch {
      setIsLoggedIn(false);
      setUser(null);
      persistView('home');
    }
    return null;
  };

  useEffect(() => {
    const oauthError = new URLSearchParams(window.location.search).get('oauth_error');
    if (oauthError) {
      setAuthModalType('login');
    }

    fetchUser().finally(() => setAuthChecked(true));
  }, []);

  const persistView = (view) => {
    const isHome = view === 'home';
    setHomeViewOverride(isHome);
    window.localStorage.setItem('placify-view', view);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.localStorage.setItem('placify-active-tab', tab);
  };

  if (!authChecked) {
    return <div className="auth-loading">Loading Placify...</div>;
  }

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      // Ignore API failures and keep the client logged out locally.
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      try {
        window.localStorage.removeItem('placify-dashboard-tab');
      } catch {
        // ignore
      }
      persistView('home');
      handleTabChange('Home');
    }
  };

  const handleGoHome = () => {
    persistView('home');
    handleTabChange('Home');
  };

  const handleGoDashboard = () => {
    setInitialDashboardTab('Dashboard');
    persistView('dashboard');
    handleTabChange('Home');
  };

  const handleOpenProfile = () => {
    setInitialDashboardTab('Profile Settings');
    persistView('dashboard');
    handleTabChange('Home');
  };

  const handleLoginSuccess = async (userData) => {
    setIsLoggedIn(true);
    if (userData) {
      let customAvatar = null;
      try {
        customAvatar = window.localStorage.getItem(`placify_custom_avatar_${userData.id}`) || window.localStorage.getItem('placify_custom_avatar_current');
      } catch {
        // ignore
      }
      setUser({
        ...userData,
        googleAvatar: userData.avatarUrl,
        avatarUrl: customAvatar || userData.avatarUrl
      });
    } else {
      await fetchUser();
    }
    setInitialDashboardTab('Dashboard');
    persistView('dashboard');
    handleTabChange('Home');
  };

  if (isLoggedIn && !homeViewOverride) {
    return (
      <Dashboard
        user={user}
        setUser={setUser}
        initialTab={initialDashboardTab}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
      />
    );
  }

  const handleProtectedAction = (tab = 'Dashboard') => {
    if (!isLoggedIn) {
      setAuthModalType('register');
      return;
    }

    setInitialDashboardTab(tab);
    persistView('dashboard');
    handleTabChange('Home');
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuthModal={(type) => setAuthModalType(type)}
        showDashboardShortcut={isLoggedIn && homeViewOverride}
        onGoDashboard={handleGoDashboard}
        user={user}
        onOpenProfile={handleOpenProfile}
      />

      {/* Main Page Layout */}
      <main className="main-content">
        {activeTab === 'Home' && (
          <>
            {/* Hero Section */}
            <Hero
              onOpenDemoModal={() => setShowDemoModal(true)}
              onStartLearning={() => handleProtectedAction('Dashboard')}
            />

            {/* 4 Main Pastel Category Cards (Aptitude, Reasoning, Verbal, DSA) */}
            <MainCategories
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* 4 Compact Feature Items */}
            <FeatureBar
              onSelectFeature={(feat) => handleProtectedAction(feat.id === 'notes' ? 'Notes' : feat.id === 'mock' ? 'Mock Tests' : 'Dashboard')}
            />

            {/* Trust Bar & Stats Counter */}
            <TrustAndStats onSelectStat={handleProtectedAction} />
          </>
        )}

        {/* View tab content for Courses */}
        {activeTab === 'Courses' && (
          <div style={{ padding: '60px 0', minHeight: '60vh' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Placement Courses & Syllabus
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              Comprehensive tracks curated for IT, Software, Aptitude & General Placement interviews.
            </p>
            <MainCategories onSelectCategory={(cat) => setSelectedCategory(cat)} />
          </div>
        )}

        {/* View tab content for LeetCode */}
        {activeTab === 'LeetCode' && (
          <div style={{ padding: '60px 0', minHeight: '60vh' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Top LeetCode Interview Problems
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              Handpicked 150+ DSA problems categorized by topic with optimal C++, Java, Python solutions.
            </p>
            <MainCategories onSelectCategory={(cat) => setSelectedCategory(cat)} />
          </div>
        )}

        {/* View tab content for Notes */}
        {activeTab === 'Notes' && (
          <div style={{ padding: '60px 0', minHeight: '60vh' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Handwritten Placement Notes
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              Download PDF notes for Aptitude formulas, Logical reasoning tricks, and Verbal grammar rules.
            </p>
            <FeatureBar
              onSelectFeature={(feat) => handleProtectedAction(feat.id === 'notes' ? 'Notes' : feat.id === 'mock' ? 'Mock Tests' : 'Dashboard')}
            />
          </div>
        )}

        {/* View tab content for Mock Tests */}
        {activeTab === 'Mock Tests' && (
          <div style={{ padding: '60px 0', minHeight: '60vh' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Placement Mock Test Series
            </h2>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
              Company-specific mock exams for TCS NQT, Infosys, Wipro, Accenture, Cognizant & Tech giants.
            </p>
            <TrustAndStats onSelectStat={handleProtectedAction} />
          </div>
        )}

        {/* View tab content for About */}
        {activeTab === 'About' && (
          <div className="info-page">
            <section className="page-hero">
              <span className="page-eyebrow">ABOUT PLACIFY</span>
              <h1>Turn preparation into your <span>next opportunity.</span></h1>
              <p>Placify gives students a clear, practical path from learning the fundamentals to feeling confident in every placement round.</p>
            </section>

            <section className="about-story">
              <div className="about-story-copy">
                <span className="page-eyebrow">OUR MISSION</span>
                <h2>Everything you need to get placement ready.</h2>
                <p>We built Placify to make placement preparation less overwhelming and more consistent. Instead of jumping between disconnected resources, students can learn topic by topic, practice with purpose, and track their progress in one focused space.</p>
                <p>Whether you are beginning with aptitude or preparing for a technical interview, Placify helps you build the habits and confidence that turn effort into results.</p>
                <button className="btn btn-primary" onClick={() => setAuthModalType('register')}>Join Placify Today</button>
              </div>
              <div className="about-value-grid">
                <div className="value-card"><Target size={24} /><h3>Focused learning</h3><p>Structured topics that keep your preparation on track.</p></div>
                <div className="value-card"><BookOpen size={24} /><h3>Practical resources</h3><p>Notes, quizzes, and examples made for real interviews.</p></div>
                <div className="value-card"><Users size={24} /><h3>Student-first</h3><p>Simple tools designed around your placement journey.</p></div>
                <div className="value-card"><span className="value-stat">10K+</span><h3>Active learners</h3><p>A growing community preparing smarter together.</p></div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Contact' && (
          <div className="info-page">
            <section className="page-hero contact-hero">
              <span className="page-eyebrow">CONTACT US</span>
              <h1>We would love to <span>hear from you.</span></h1>
              <p>Questions, feedback, or ideas for making Placify better? Send us a message and our team will get back to you.</p>
            </section>
            <section className="contact-layout">
              <div className="contact-details">
                <h2>Let&apos;s start a conversation.</h2>
                <p>Reach out for help with your account, learning resources, or anything else related to your placement journey.</p>
                <div className="contact-detail"><Mail size={20} /><div><strong>Email us</strong><a href="mailto:hello@placify.com">hello@placify.com</a></div></div>
                <div className="contact-detail"><MapPin size={20} /><div><strong>Based in</strong><span>India, helping students everywhere</span></div></div>
              </div>
              <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setContactSent(true); }}>
                {contactSent ? (
                  <div className="contact-success"><div className="success-icon"><Send size={22} /></div><h3>Message received!</h3><p>Thanks for reaching out. We&apos;ll be in touch soon.</p><button type="button" className="btn btn-outline-demo" onClick={() => setContactSent(false)}>Send another message</button></div>
                ) : false ? (
                  <section className="progress-page">
                    <div className="progress-page-header">
                      <div>
                        <span className="page-eyebrow">YOUR LEARNING JOURNEY</span>
                        <h2>Your Progress</h2>
                        <p>Track your performance and stay motivated.</p>
                      </div>
                      <select className="progress-period" defaultValue="30">
                        <option value="30">Last 30 Days</option>
                        <option value="7">Last 7 Days</option>
                        <option value="90">Last 3 Months</option>
                      </select>
                    </div>
                    <div className="progress-summary-grid">
                      <div className="progress-summary-card"><span>Overall Progress</span><div className="progress-summary-ring"><strong>68%</strong><small>Overall</small></div></div>
                      <div className="progress-summary-card"><span>Problems Solved</span><strong className="progress-big-number">124</strong><small className="progress-positive">+12 this week</small></div>
                      <div className="progress-summary-card"><span>Quizzes Taken</span><strong className="progress-big-number">8</strong><small className="progress-positive">+2 this week</small></div>
                      <div className="progress-summary-card"><span>Study Streak</span><strong className="progress-big-number">5 Days</strong><small className="progress-purple">Best: 12 days</small></div>
                    </div>
                    <div className="progress-dashboard-grid">
                      <section className="progress-panel subject-progress-panel">
                        <h3>Subject-wise Progress</h3>
                        {[
                          ['Aptitude', '75%', '#2563eb'],
                          ['Reasoning', '60%', '#14b8a6'],
                          ['Verbal Ability', '55%', '#f59e0b'],
                          ['DSA / LeetCode', '40%', '#db2777']
                        ].map(([label, value, color]) => (
                          <div className="subject-progress-row" key={label}>
                            <span>{label}</span><div><i style={{ width: value, backgroundColor: color }} /></div><strong>{value}</strong>
                          </div>
                        ))}
                      </section>
                      <section className="progress-panel activity-chart-panel">
                        <h3>Weekly Activity</h3>
                        <div className="activity-chart">
                          <svg viewBox="0 0 500 150" role="img" aria-label="Weekly activity trend">
                            <defs><linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#635bff" stopOpacity=".22" /><stop offset="100%" stopColor="#635bff" stopOpacity="0" /></linearGradient></defs>
                            <path className="activity-area" d="M20 122 L92 91 L164 62 L236 78 L308 91 L380 52 L452 72 L495 28 L495 135 L20 135 Z" />
                            <polyline points="20,122 92,91 164,62 236,78 308,91 380,52 452,72 495,28" />
                            {[['20', '122'], ['92', '91'], ['164', '62'], ['236', '78'], ['308', '91'], ['380', '52'], ['452', '72'], ['495', '28']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />)}
                          </svg>
                          <div className="activity-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                        </div>
                      </section>
                    </div>
                    <div className="progress-dashboard-grid">
                      <section className="progress-panel topic-completion-panel">
                        <h3>Topic Completion</h3>
                        <div className="topic-rings">
                          {[
                            ['12', 'Aptitude', '80%', '#2563eb'],
                            ['12', 'Reasoning', '57%', '#3b82f6'],
                            ['8', 'Verbal', '63%', '#10b981'],
                            ['5', 'DSA', '63%', '#db2777']
                          ].map(([count, label, percent, color]) => (
                            <div className="topic-ring-item" key={label}><div className="topic-ring" style={{ '--ring-color': color, '--ring-progress': percent }}><strong>{count}</strong><small>Topics</small></div><span>{label}</span><b>{percent}</b></div>
                          ))}
                        </div>
                      </section>
                      <section className="progress-panel recent-activity-panel">
                        <h3>Recent Activity</h3>
                        {[
                          ['Solved Two Sum', 'DSA • 2 hours ago', '#16a34a', CheckCircle2],
                          ['Completed Percentage Quiz', 'Aptitude • 4 hours ago', '#635bff', Trophy],
                          ['Read Grammar Notes', 'Verbal • 1 day ago', '#f59e0b', FileText]
                        ].map(([title, meta, color, Icon]) => (
                          <div className="recent-activity-item" key={title}><div style={{ color, backgroundColor: `${color}18` }}><Icon size={17} /></div><span><strong>{title}</strong><small>{meta}</small></span></div>
                        ))}
                      </section>
                    </div>
                  </section>
                ) : (
                  <>
                    <div className="form-row"><label>Name<input type="text" placeholder="Your name" required /></label><label>Email<input type="email" placeholder="you@example.com" required /></label></div>
                    <label>Subject<input type="text" placeholder="How can we help?" required /></label>
                    <label>Message<textarea placeholder="Tell us a little more..." rows="5" required /></label>
                    <button type="submit" className="btn btn-primary contact-submit">Send Message <Send size={17} /></button>
                  </>
                )}
              </form>
            </section>
          </div>
        )}
      </main>

      {/* Interactive Modal Popups */}
      <Modals
        authModalType={authModalType}
        setAuthModalType={setAuthModalType}
        showDemoModal={showDemoModal}
        setShowDemoModal={setShowDemoModal}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
        onLoginSuccess={handleLoginSuccess}
        onProtectedAction={handleProtectedAction}
      />
    </div>
  );
}


function WorkspaceHeader({ eyebrow, title, description, action, compact = false }) {
  return (
    <div className={`workspace-header${compact ? ' workspace-header-actions' : ''}`}>
      {!compact && <div><span className="page-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>}
      {action}
    </div>
  );
}

const PRACTICE_QUESTIONS = {
  Percentages: [
    ['Percentage Basics', 'Easy', 'https://www.indiabix.com/aptitude/percentage/', 'https://www.indiabix.com/aptitude/percentage/'],
    ['Successive Percentage Change', 'Medium', 'https://www.indiabix.com/aptitude/percentage/', 'https://www.geeksforgeeks.org/quantitative-aptitude/percentages/']
  ],
  'Profit & Loss': [
    ['Profit and Loss Basics', 'Easy', 'https://www.indiabix.com/aptitude/profit-and-loss/', 'https://www.indiabix.com/aptitude/profit-and-loss/'],
    ['Marked Price and Discount', 'Medium', 'https://www.indiabix.com/aptitude/profit-and-loss/', 'https://www.geeksforgeeks.org/quantitative-aptitude/profit-and-loss/']
  ],
  'Time & Work': [
    ['Work and Wages', 'Easy', 'https://www.indiabix.com/aptitude/time-and-work/', 'https://www.indiabix.com/aptitude/time-and-work/'],
    ['Pipes and Cisterns', 'Medium', 'https://www.indiabix.com/aptitude/pipes-and-cisterns/', 'https://www.geeksforgeeks.org/quantitative-aptitude/pipes-and-cisterns/']
  ],
  'Ratio & Proportion': [
    ['Ratio Basics', 'Easy', 'https://www.indiabix.com/aptitude/ratio-and-proportion/', 'https://www.indiabix.com/aptitude/ratio-and-proportion/'],
    ['Direct and Inverse Proportion', 'Medium', 'https://www.indiabix.com/aptitude/ratio-and-proportion/', 'https://www.geeksforgeeks.org/quantitative-aptitude/ratio-and-proportion/']
  ],
  'Speed, Distance & Time': [
    ['Relative Speed', 'Easy', 'https://www.indiabix.com/aptitude/time-and-distance/', 'https://www.indiabix.com/aptitude/time-and-distance/'],
    ['Trains and Boats', 'Medium', 'https://www.indiabix.com/aptitude/problems-on-trains/', 'https://www.geeksforgeeks.org/quantitative-aptitude/problems-on-trains/']
  ],
  'Simple & Compound Interest': [
    ['Simple Interest', 'Easy', 'https://www.indiabix.com/aptitude/simple-interest/', 'https://www.indiabix.com/aptitude/simple-interest/'],
    ['Compound Interest', 'Medium', 'https://www.indiabix.com/aptitude/compound-interest/', 'https://www.indiabix.com/aptitude/compound-interest/']
  ],
  'Blood Relations': [
    ['Family Tree Problems', 'Easy', 'https://www.indiabix.com/logical-reasoning/blood-relation-test/', 'https://www.indiabix.com/logical-reasoning/blood-relation-test/'],
    ['Coded Relations', 'Medium', 'https://www.indiabix.com/logical-reasoning/blood-relation-test/', 'https://www.geeksforgeeks.org/reasoning-aptitude/blood-relations/']
  ],
  Syllogism: [
    ['Statements and Conclusions', 'Easy', 'https://www.indiabix.com/logical-reasoning/syllogism/', 'https://www.indiabix.com/logical-reasoning/syllogism/'],
    ['Venn Diagram Syllogisms', 'Medium', 'https://www.indiabix.com/logical-reasoning/syllogism/', 'https://www.geeksforgeeks.org/aptitude/logical-reasoning-syllogism/']
  ],
  'Direction Sense': [
    ['Direction Test Basics', 'Easy', 'https://www.indiabix.com/logical-reasoning/direction-sense-test/', 'https://www.indiabix.com/logical-reasoning/direction-sense-test/'],
    ['Shortest Distance and Direction', 'Medium', 'https://www.indiabix.com/logical-reasoning/direction-sense-test/', 'https://www.geeksforgeeks.org/reasoning-aptitude/direction-sense-test/']
  ],
  'Coding & Decoding': [
    ['Letter Coding', 'Easy', 'https://www.indiabix.com/logical-reasoning/coding-decoding/', 'https://www.indiabix.com/logical-reasoning/coding-decoding/'],
    ['Mixed Coding Patterns', 'Medium', 'https://www.indiabix.com/logical-reasoning/coding-decoding/', 'https://www.geeksforgeeks.org/reasoning-aptitude/coding-decoding/']
  ],
  'Seating Arrangement': [
    ['Linear Seating Arrangement', 'Medium', 'https://www.indiabix.com/logical-reasoning/seating-arrangement/', 'https://www.indiabix.com/logical-reasoning/seating-arrangement/'],
    ['Circular Seating Arrangement', 'Hard', 'https://www.indiabix.com/logical-reasoning/seating-arrangement/', 'https://www.geeksforgeeks.org/aptitude/seating-arrangement/']
  ],
  'Error Spotting': [
    ['Subject-Verb Agreement', 'Easy', 'https://www.indiabix.com/verbal-ability/spotting-errors/', 'https://www.indiabix.com/verbal-ability/spotting-errors/'],
    ['Tenses and Articles', 'Medium', 'https://www.indiabix.com/verbal-ability/spotting-errors/', 'https://www.geeksforgeeks.org/english-grammar/spotting-errors/']
  ],
  'Reading Comprehension': [
    ['Main Idea and Inference', 'Medium', 'https://www.indiabix.com/verbal-ability/comprehension/', 'https://www.indiabix.com/verbal-ability/comprehension/'],
    ['Passage-Based Questions', 'Hard', 'https://www.indiabix.com/verbal-ability/comprehension/', 'https://www.geeksforgeeks.org/reading-comprehension/']
  ],
  'Sentence Completion': [
    ['Contextual Vocabulary', 'Easy', 'https://www.indiabix.com/verbal-ability/sentence-completion/', 'https://www.indiabix.com/verbal-ability/sentence-completion/'],
    ['Logical Sentence Completion', 'Medium', 'https://www.indiabix.com/verbal-ability/sentence-completion/', 'https://www.geeksforgeeks.org/verbal-ability/sentence-completion/']
  ],
  'Synonyms & Antonyms': [
    ['Common Synonyms', 'Easy', 'https://www.indiabix.com/verbal-ability/synonyms/', 'https://www.indiabix.com/verbal-ability/synonyms/'],
    ['Contextual Antonyms', 'Medium', 'https://www.indiabix.com/verbal-ability/antonyms/', 'https://www.indiabix.com/verbal-ability/antonyms/']
  ]
};

const PRACTICE_TOPIC_FALLBACKS = [
  ['apt-percentages', 'Percentages', 'Aptitude', 'Easy', 20, '#2563eb'],
  ['apt-profit-loss', 'Profit & Loss', 'Aptitude', 'Medium', 18, '#f59e0b'],
  ['apt-time-work', 'Time & Work', 'Aptitude', 'Medium', 15, '#16a34a'],
  ['apt-ratio-proportion', 'Ratio & Proportion', 'Aptitude', 'Easy', 12, '#0891b2'],
  ['apt-speed-distance', 'Speed, Distance & Time', 'Aptitude', 'Medium', 14, '#7c3aed'],
  ['apt-simple-compound-interest', 'Simple & Compound Interest', 'Aptitude', 'Medium', 16, '#dc2626'],
  ['rsn-blood-relations', 'Blood Relations', 'Reasoning', 'Medium', 15, '#0f766e'],
  ['rsn-syllogism', 'Syllogism', 'Reasoning', 'Medium', 14, '#635bff'],
  ['rsn-direction-sense', 'Direction Sense', 'Reasoning', 'Easy', 10, '#ea580c'],
  ['rsn-coding-decoding', 'Coding & Decoding', 'Reasoning', 'Medium', 12, '#0284c7'],
  ['rsn-seating-arrangement', 'Seating Arrangement', 'Reasoning', 'Hard', 10, '#9333ea'],
  ['va-error-spotting', 'Error Spotting', 'Verbal Ability', 'Easy', 12, '#db2777'],
  ['va-reading-comprehension', 'Reading Comprehension', 'Verbal Ability', 'Hard', 10, '#16a34a'],
  ['va-sentence-completion', 'Sentence Completion', 'Verbal Ability', 'Medium', 12, '#2563eb'],
  ['va-synonyms-antonyms', 'Synonyms & Antonyms', 'Verbal Ability', 'Easy', 15, '#f59e0b']
].map(([itemId, title, category, difficulty, totalProblems, color]) => ({
  itemId,
  title,
  category,
  difficulty,
  totalProblems,
  color,
  description: `${title} questions for placement preparation.`
}));

function PracticePage({ summary, actions, initialQuery = '', initialFilter = 'All' }) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [solvingQuestion, setSolvingQuestion] = useState('');
  const [solvedQuestions, setSolvedQuestions] = useState(() => new Set());
  const [solveError, setSolveError] = useState('');

  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialFilter !== undefined) setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setSolvedQuestions(new Set());
    setSolveError('');
  }, [selectedTopic]);

  useEffect(() => {
    setLoadingTopics(true);
    actions.loadContent({ type: 'topic' }).then((data) => {
      const practiceTopics = (data || []).filter((topic) => topic.category !== 'DSA');
      setTopics(practiceTopics.length > 0 ? practiceTopics : PRACTICE_TOPIC_FALLBACKS);
      setLoadingTopics(false);
    });
  }, [actions]);

  const categories = ['All', 'Aptitude', 'Reasoning', 'Verbal Ability'];
  const filteredTopics = topics.filter((t) => t.category !== 'DSA' &&
    (filter === 'All' || t.category === filter) &&
    `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase())
  );

  const streak = summary?.studyStreakDays ?? 0;
  const problemsSolved = summary?.problemsSolved ?? 0;
  const todayMinutes = summary?.todayMinutes ?? 0;
  const overallPercent = summary?.overall ?? 0;
  const selectedQuestions = selectedTopic ? (PRACTICE_QUESTIONS[selectedTopic] || []) : [];
  const selectedTopicData = topics.find((topic) => topic.title === selectedTopic);

  const markQuestionSolved = async (title) => {
    if (!selectedTopicData?.itemId || solvingQuestion || solvedQuestions.has(title)) return;
    setSolvingQuestion(title);
    setSolveError('');
    try {
      await actions.solveTopic(selectedTopicData.itemId);
      setSolvedQuestions((current) => new Set(current).add(title));
    } catch {
      setSolveError('Could not save this problem. Please try again.');
    } finally {
      setSolvingQuestion('');
    }
  };

  return (
    <section className="workspace-page">
      <WorkspaceHeader compact action={<div className="workspace-streak"><Flame size={18} /><span><strong>{streak} day streak</strong><small>Keep it going</small></span></div>} />
      <div className="workspace-stat-grid">
        <div><strong>{problemsSolved}</strong><span>Problems solved</span></div>
        <div><strong>{overallPercent}%</strong><span>Accuracy</span></div>
        <div><strong>{todayMinutes} min</strong><span>Today&apos;s study time</span></div>
      </div>
      <div className="workspace-toolbar">
        <label className="workspace-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics" /></label>
        <div className="workspace-filters"><Filter size={16} />{categories.map((item) => <button className={filter === item ? 'active' : ''} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      </div>
      {loadingTopics ? (
        <div className="dashboard-loading-state"><div className="dashboard-spinner" /><span>Loading topics…</span></div>
      ) : selectedTopic ? (
        <section className="dsa-question-page practice-question-page">
          <button type="button" className="dsa-back-button" onClick={() => setSelectedTopic(null)}>
            <ChevronLeft size={16} /> Back to practice topics
          </button>
          <div className="dsa-problems-panel">
            <div className="dsa-problems-heading">
              <div>
                <span className="page-eyebrow">{topics.find((topic) => topic.title === selectedTopic)?.category || 'PRACTICE'}</span>
                <h3>{selectedTopic} Questions</h3>
                <p>Practice these placement questions, then review the linked solution.</p>
              </div>
              <span className="dsa-problem-count">{selectedQuestions.length} questions</span>
            </div>
            {solveError && <p className="dsa-solve-error" role="alert">{solveError}</p>}
            <div className="dsa-problems-table-wrap">
              <table className="dsa-problems-table">
                <thead><tr><th>Question</th><th>Difficulty</th><th>Problem Link</th><th>Solution</th><th>Status</th></tr></thead>
                <tbody>
                  {selectedQuestions.map(([title, difficulty, problemUrl, solutionUrl]) => (
                    <tr key={title}>
                      <td><strong>{title}</strong></td>
                      <td><span className={`dsa-difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span></td>
                      <td className="dsa-problem-links"><a href={problemUrl} target="_blank" rel="noreferrer">Open problem <ArrowUpRight size={13} /></a></td>
                      <td className="dsa-problem-links"><a href={solutionUrl} target="_blank" rel="noreferrer">View solution <ArrowUpRight size={13} /></a></td>
                      <td><button type="button" className={`dsa-solve-button${solvedQuestions.has(title) ? ' solved' : ''}`} disabled={solvingQuestion === title || solvedQuestions.has(title)} onClick={() => markQuestionSolved(title)}>{solvingQuestion === title ? 'Saving…' : solvedQuestions.has(title) ? 'Solved' : 'Mark solved'} <CheckCircle2 size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <div className="workspace-card-grid">
          {filteredTopics.map((topic) => {
            const topicSummary = (summary?.topics || []).find((t) => t.topicId === topic.itemId);
            const currentSolved = topicSummary !== undefined ? topicSummary.solved : (topic.solved || 0);
            const total = topic.totalProblems || topic.total || 0;
            const pct = total > 0 ? Math.round((currentSolved / total) * 100) : 0;
            return (
              <article className="content-card practice-card" key={topic.itemId}>
                <div className="content-card-top">
                  <span className="content-icon" style={{ color: topic.color, backgroundColor: `${topic.color}18` }}><Target size={19} /></span>
                  <span className="difficulty-badge">{topic.difficulty}</span>
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.category}</p>
                <div className="mini-progress"><i style={{ width: `${pct}%`, backgroundColor: topic.color }} /></div>
                <div className="card-meta">
                  <span>{currentSolved} / {total} solved</span>
                  <button type="button" onClick={() => setSelectedTopic(topic.title)}>Open questions <ChevronRight size={14} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const DSA_PROBLEMS = {
  'Arrays & Hashing': [
    ['Two Sum', 'Easy', 'two-sum', 'two-sum'],
    ['Contains Duplicate', 'Easy', 'contains-duplicate', 'contains-duplicate'],
    ['Valid Anagram', 'Easy', 'valid-anagram', 'valid-anagram'],
    ['Group Anagrams', 'Medium', 'group-anagrams', 'group-anagrams'],
    ['Product of Array Except Self', 'Medium', 'product-of-array-except-self', 'product-of-array-except-self']
  ],
  Strings: [
    ['Valid Anagram', 'Easy', 'valid-anagram', 'valid-anagram'],
    ['Longest Common Prefix', 'Easy', 'longest-common-prefix', 'longest-common-prefix'],
    ['Longest Palindromic Substring', 'Medium', 'longest-palindromic-substring', 'longest-palindromic-substring'],
    ['Encode and Decode Strings', 'Medium', 'encode-and-decode-strings', 'encode-and-decode-strings']
  ],
  Hashing: [
    ['Two Sum', 'Easy', 'two-sum', 'two-sum'],
    ['Contains Duplicate', 'Easy', 'contains-duplicate', 'contains-duplicate'],
    ['Group Anagrams', 'Medium', 'group-anagrams', 'group-anagrams'],
    ['Longest Consecutive Sequence', 'Medium', 'longest-consecutive-sequence', 'longest-consecutive-sequence']
  ],
  'Two Pointers': [
    ['Valid Palindrome', 'Easy', 'valid-palindrome', 'valid-palindrome'],
    ['3Sum', 'Medium', '3sum', '3sum'],
    ['Container With Most Water', 'Medium', 'container-with-most-water', 'container-with-most-water'],
    ['Trapping Rain Water', 'Hard', 'trapping-rain-water', 'trapping-rain-water']
  ],
  'Sliding Window': [
    ['Best Time to Buy and Sell Stock', 'Easy', 'best-time-to-buy-and-sell-stock', 'best-time-to-buy-and-sell-stock'],
    ['Longest Substring Without Repeating Characters', 'Medium', 'longest-substring-without-repeating-characters', 'longest-substring-without-repeating-characters'],
    ['Longest Repeating Character Replacement', 'Medium', 'longest-repeating-character-replacement', 'longest-repeating-character-replacement'],
    ['Minimum Window Substring', 'Hard', 'minimum-window-substring', 'minimum-window-substring']
  ],
  'Stacks & Queues': [
    ['Valid Parentheses', 'Easy', 'valid-parentheses', 'valid-parentheses'],
    ['Min Stack', 'Medium', 'min-stack', 'min-stack'],
    ['Evaluate Reverse Polish Notation', 'Medium', 'evaluate-reverse-polish-notation', 'evaluate-reverse-polish-notation'],
    ['Daily Temperatures', 'Medium', 'daily-temperatures', 'daily-temperatures']
  ],
  Stack: [
    ['Valid Parentheses', 'Easy', 'valid-parentheses', 'valid-parentheses'],
    ['Min Stack', 'Medium', 'min-stack', 'min-stack'],
    ['Daily Temperatures', 'Medium', 'daily-temperatures', 'daily-temperatures']
  ],
  Queue: [
    ['Number of Recent Calls', 'Easy', 'number-of-recent-calls', 'number-of-recent-calls'],
    ['Design Circular Queue', 'Medium', 'design-circular-queue', 'design-circular-queue'],
    ['Sliding Window Maximum', 'Hard', 'sliding-window-maximum', 'sliding-window-maximum']
  ],
  'Linked Lists': [
    ['Reverse Linked List', 'Easy', 'reverse-linked-list', 'reverse-linked-list'],
    ['Merge Two Sorted Lists', 'Easy', 'merge-two-sorted-lists', 'merge-two-sorted-lists'],
    ['Linked List Cycle', 'Easy', 'linked-list-cycle', 'linked-list-cycle'],
    ['LRU Cache', 'Medium', 'lru-cache', 'lru-cache']
  ],
  'Binary Search': [
    ['Binary Search', 'Easy', 'binary-search', 'binary-search'],
    ['Search in Rotated Sorted Array', 'Medium', 'search-in-rotated-sorted-array', 'search-in-rotated-sorted-array'],
    ['Koko Eating Bananas', 'Medium', 'koko-eating-bananas', 'koko-eating-bananas']
  ],
  'Trees & BST': [
    ['Invert Binary Tree', 'Easy', 'invert-binary-tree', 'invert-binary-tree'],
    ['Binary Tree Level Order Traversal', 'Medium', 'binary-tree-level-order-traversal', 'binary-tree-level-order-traversal'],
    ['Validate Binary Search Tree', 'Medium', 'validate-binary-search-tree', 'validate-binary-search-tree'],
    ['Lowest Common Ancestor of a BST', 'Medium', 'lowest-common-ancestor-of-a-binary-search-tree', 'lowest-common-ancestor-of-a-binary-search-tree']
  ],
  Graphs: [
    ['Number of Islands', 'Medium', 'number-of-islands', 'number-of-islands'],
    ['Clone Graph', 'Medium', 'clone-graph', 'clone-graph'],
    ['Course Schedule', 'Medium', 'course-schedule', 'course-schedule'],
    ['Rotting Oranges', 'Medium', 'rotting-oranges', 'rotting-oranges']
  ],
  'Dynamic Programming': [
    ['Climbing Stairs', 'Easy', 'climbing-stairs', 'climbing-stairs'],
    ['House Robber', 'Medium', 'house-robber', 'house-robber'],
    ['Coin Change', 'Medium', 'coin-change', 'coin-change'],
    ['Longest Increasing Subsequence', 'Medium', 'longest-increasing-subsequence', 'longest-increasing-subsequence'],
    ['Word Break', 'Medium', 'word-break', 'word-break']
  ]
};

function DsaPage({ summary, actions }) {
  const [dsaTopics, setDsaTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [solvingQuestion, setSolvingQuestion] = useState('');
  const [solvedQuestions, setSolvedQuestions] = useState(() => new Set());
  const [solveError, setSolveError] = useState('');

  useEffect(() => {
    setLoading(true);
    actions.loadContent({ type: 'topic', category: 'DSA' }).then((data) => {
      setDsaTopics(data || []);
      setLoading(false);
    });
  }, [actions]);

  useEffect(() => {
    setSolvedQuestions(new Set());
    setSolveError('');
  }, [selectedTopic]);

  const totalProblems = dsaTopics.reduce((s, t) => s + (t.totalProblems || 0), 0);
  const totalSolved = dsaTopics.reduce((s, t) => {
    const tp = (summary?.topics || []).find((x) => x.topicId === t.itemId);
    return s + (tp !== undefined ? tp.solved : (t.solved || 0));
  }, 0);
  const overallPct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const weeksLeft = Math.max(1, Math.round(((totalProblems - totalSolved) / 5)));
  const topicCards = [
    ['Arrays', 'Arrays & Hashing', 'dsa-arrays-hashing', '#635bff', 'Build strong fundamentals with sorting, searching, and prefix patterns.'],
    ['Strings', 'Strings', 'dsa-arrays-hashing', '#db2777', 'Master frequency maps, palindromes, and string manipulation patterns.'],
    ['Hashing', 'Hashing', 'dsa-arrays-hashing', '#2563eb', 'Solve lookup and frequency problems with efficient hash-based techniques.'],
    ['Linked Lists', 'Linked Lists', 'dsa-linked-lists', '#f59e0b', 'Practice reversal, cycles, merging, and pointer techniques.'],
    ['Stack', 'Stack', 'dsa-stacks-queues', '#ef476f', 'Learn monotonic stacks, parsing, and last-in-first-out patterns.'],
    ['Queue', 'Queue', 'dsa-stacks-queues', '#0f766e', 'Use queues for scheduling, BFS traversal, and sliding window problems.'],
    ['Binary Search', 'Binary Search', 'dsa-binary-search', '#16a34a', 'Find answers efficiently across sorted arrays and search spaces.'],
    ['Trees', 'Trees & BST', 'dsa-trees', '#9333ea', 'Build confidence with DFS, BFS, and binary search tree problems.'],
    ['Graphs', 'Graphs', 'dsa-graphs', '#dc2626', 'Practice traversal, shortest paths, and dependency relationships.'],
    ['Dynamic Programming', 'Dynamic Programming', 'dsa-dynamic-programming', '#0891b2', 'Recognize overlapping subproblems and build memoized solutions.']
  ];
  const visibleQuestions = selectedTopic
    ? (DSA_PROBLEMS[selectedTopic] || []).map((question) => [selectedTopic, ...question])
    : [];
  const selectedProgressId = topicCards.find(([, questionTopic]) => questionTopic === selectedTopic)?.[2];

  const markQuestionSolved = async (slug) => {
    if (!selectedProgressId || solvingQuestion || solvedQuestions.has(slug)) return;
    setSolvingQuestion(slug);
    setSolveError('');
    try {
      await actions.solveTopic(selectedProgressId);
      setSolvedQuestions((current) => new Set(current).add(slug));
    } catch {
      setSolveError('Could not save this problem. Please try again.');
    } finally {
      setSolvingQuestion('');
    }
  };

  return (
    <section className="workspace-page">
      <WorkspaceHeader compact action={<button className="btn btn-primary"><CirclePlay size={17} /> Resume learning</button>} />
      <div className="dsa-banner">
        <div>
          <span className="page-eyebrow">CURRENT TRACK</span>
          <h3>Interview Foundations</h3>
          <p>{totalSolved} of {totalProblems} problems complete • Estimated {weeksLeft} weeks remaining</p>
        </div>
        <div className="dsa-banner-progress">
          <strong>{overallPct}%</strong>
          <div className="mini-progress"><i style={{ width: `${overallPct}%` }} /></div>
        </div>
      </div>
      {loading ? (
        <div className="dashboard-loading-state"><div className="dashboard-spinner" /><span>Loading DSA topics…</span></div>
      ) : (
        selectedTopic ? (
          <section className="dsa-question-page">
            <button type="button" className="dsa-back-button" onClick={() => setSelectedTopic(null)}>
              <ChevronLeft size={16} /> Back to DSA topics
            </button>
            <div className="dsa-problems-panel">
              <div className="dsa-problems-heading">
                <div>
                  <span className="page-eyebrow">CURATED PRACTICE</span>
                  <h3>{selectedTopic} Questions</h3>
                  <p>Practice these interview problems, then review a clear solution.</p>
                </div>
                <span className="dsa-problem-count">{visibleQuestions.length} problems</span>
              </div>
              {solveError && <p className="dsa-solve-error" role="alert">{solveError}</p>}
              <div className="dsa-problems-table-wrap">
                <table className="dsa-problems-table">
                  <thead><tr><th>Problem</th><th>Difficulty</th><th>Problem Link</th><th>Solution</th><th>Status</th></tr></thead>
                  <tbody>
                    {visibleQuestions.map(([topic, title, difficulty, slug, solutionSlug]) => (
                      <tr key={`${topic}-${slug}`}>
                        <td><strong>{title}</strong></td>
                        <td><span className={`dsa-difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span></td>
                        <td className="dsa-problem-links"><a href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noreferrer">Open problem <ArrowUpRight size={13} /></a></td>
                        <td className="dsa-problem-links"><a href={`https://neetcode.io/solutions/${solutionSlug}`} target="_blank" rel="noreferrer">View solution <ArrowUpRight size={13} /></a></td>
                        <td><button type="button" className={`dsa-solve-button${solvedQuestions.has(slug) ? ' solved' : ''}`} disabled={solvingQuestion === slug || solvedQuestions.has(slug)} onClick={() => markQuestionSolved(slug)}>{solvingQuestion === slug ? 'Saving…' : solvedQuestions.has(slug) ? 'Solved' : 'Mark solved'} <CheckCircle2 size={13} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
        <>
          <div className="dsa-topic-card-grid">
            {topicCards.map(([label, questionTopic, progressId, color, description]) => {
              const topic = dsaTopics.find((item) => item.itemId === progressId);
              const topicProgress = (summary?.topics || []).find((t) => t.topicId === progressId);
              const currentSolved = topicProgress !== undefined ? topicProgress.solved : (topic?.solved || 0);
              const total = topic?.totalProblems || DSA_PROBLEMS[questionTopic]?.length || 0;
              const pct = total > 0 ? Math.round((currentSolved / total) * 100) : 0;
              return (
                <article className={`content-card dsa-card${selectedTopic === questionTopic ? ' selected' : ''}`} key={label}>
                  <div className="content-card-top">
                    <span className="content-icon" style={{ color, backgroundColor: `${color}18` }}><Code2 size={19} /></span>
                    <span className="topic-count">{currentSolved} / {total}</span>
                  </div>
                  <h3>{label}</h3>
                  <p>{description}</p>
                  <div className="mini-progress"><i style={{ width: `${pct}%`, backgroundColor: color }} /></div>
                  <div className="card-meta">
                    <span>{pct}% complete</span>
                    <button type="button" onClick={() => setSelectedTopic(questionTopic)}>Open questions <ChevronRight size={14} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
        )
      )}
    </section>
  );
}

const NOTE_RESOURCES = [
  { itemId: 'note-programming-languages', title: 'Programming Language', category: 'Programming', description: 'Reference notes for core programming languages and concepts.', color: '#635bff', driveUrl: 'https://drive.google.com/drive/folders/1zJTiVdk6sv8p5MvQ3byVgOGSQ2O-ZJyX' },
  { itemId: 'note-data-structures-algorithms', title: 'Data Structures and Algorithms', category: 'DSA', description: 'DSA concepts, patterns, and interview revision notes.', color: '#2563eb', driveUrl: '' },
  { itemId: 'note-aptitude', title: 'Aptitude', category: 'Aptitude', description: 'Formulas, shortcuts, and solved placement aptitude notes.', color: '#16a34a', driveUrl: '' },
  { itemId: 'note-reasoning', title: 'Reasoning', category: 'Reasoning', description: 'Logical reasoning methods, shortcuts, and practice notes.', color: '#f59e0b', driveUrl: '' },
  { itemId: 'note-verbal-ability', title: 'Verbal Ability', category: 'Verbal Ability', description: 'Grammar, vocabulary, comprehension, and verbal preparation.', color: '#db2777', driveUrl: '' },
  { itemId: 'note-interview-questions', title: 'Interview Questions', category: 'Interview Preparation', description: 'Frequently asked technical and HR interview questions.', color: '#0891b2', driveUrl: '' }
];

function NotesPage({ summary, actions }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    actions.loadContent({ type: 'note' }).then((data) => {
      setNotes(data || []);
      setLoading(false);
    });
  }, [actions]);

  const bookmarkedIds = new Set((summary?.bookmarks || []).map((b) => b.itemId));
  const resources = NOTE_RESOURCES.map((resource) => {
    const matchingNote = notes.find((note) => note.category === resource.category || note.title === resource.title);
    return { ...resource, driveUrl: matchingNote?.pdfUrl || resource.driveUrl };
  });

  return (
    <section className="workspace-page">
      <WorkspaceHeader compact action={<button className="btn btn-outline-demo"><Download size={17} /> Download all</button>} />
      {loading ? (
        <div className="dashboard-loading-state"><div className="dashboard-spinner" /><span>Loading notes…</span></div>
      ) : (
        <div className="notes-layout">
          <div className="notes-resource-grid">
            {resources.map((note) => (
              <article
                className={`notes-resource-card${note.driveUrl ? ' clickable' : ''}`}
                key={note.itemId}
                onClick={() => note.driveUrl && window.open(note.driveUrl, '_blank', 'noopener,noreferrer')}
                onKeyDown={(event) => {
                  if (note.driveUrl && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    window.open(note.driveUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                role={note.driveUrl ? 'link' : undefined}
                tabIndex={note.driveUrl ? 0 : undefined}
              >
                <div className="notes-resource-top">
                  <div className="content-icon" style={{ color: note.color, backgroundColor: `${note.color}18` }}><FileText size={21} /></div>
                  <button
                    type="button"
                    className={`icon-button${bookmarkedIds.has(note.itemId) ? ' active' : ''}`}
                    aria-label={`Bookmark ${note.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      actions.toggleBookmark({ itemId: note.itemId, itemType: 'note', title: note.title, category: note.category, source: 'Google Drive Notes' });
                    }}
                  >
                    <Bookmark size={18} fill={bookmarkedIds.has(note.itemId) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h3>{note.title}</h3>
                <span className="notes-resource-category">{note.category}</span>
                <p>{note.description}</p>
                {note.driveUrl && <span className="note-open">Click to open notes <ChevronRight size={15} /></span>}
              </article>
            ))}
          </div>
          <aside className="notes-tip">
            <div className="content-icon purple"><BookOpen size={20} /></div>
            <h3>Revision tip</h3>
            <p>Spend 10 minutes reviewing a note before starting a quiz. Small, regular revisions improve recall far more than last-minute cramming.</p>
            <button type="button">Start a revision session <ArrowRight size={15} /></button>
          </aside>
        </div>
      )}
    </section>
  );
}

function MockTestsPage({ summary, actions }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    actions.loadContent({ type: 'mock' }).then((data) => {
      setTests(data || []);
      setLoading(false);
    });
  }, [actions]);

  const bestScore = summary?.quizzesTaken > 0 ? '82%' : 'N/A';
  const featured = tests.find((t) => t.itemId === 'mock-placement-readiness');
  const restTests = tests.filter((t) => t.itemId !== 'mock-placement-readiness');

  return (
    <section className="workspace-page">
      <WorkspaceHeader compact action={<div className="workspace-score"><Trophy size={18} /><span><strong>Best score: {bestScore}</strong><small>+8% this month</small></span></div>} />
      {featured && (
        <div className="mock-feature">
          <div>
            <span className="page-eyebrow">RECOMMENDED FOR YOU</span>
            <h3>{featured.title}</h3>
            <p>{featured.totalProblems} mixed questions designed to show you exactly where to focus next.</p>
            <button type="button" className="btn btn-primary" onClick={() => actions.recordQuiz({ category: 'Mixed' })}>Start test <ArrowRight size={16} /></button>
          </div>
          <div className="mock-feature-visual"><Target size={32} /><strong>{featured.totalProblems}</strong><span>questions</span></div>
        </div>
      )}
      <h3 className="workspace-subheading">Company-specific tests</h3>
      {loading ? (
        <div className="dashboard-loading-state"><div className="dashboard-spinner" /><span>Loading tests…</span></div>
      ) : (
        <div className="mock-list">
          {restTests.map((test) => (
            <article className="mock-row" key={test.itemId}>
              <div className="content-icon" style={{ color: test.color, backgroundColor: `${test.color}18` }}><Trophy size={19} /></div>
              <div className="note-copy">
                <h3>{test.title}</h3>
                <p>{test.totalProblems} questions <span>•</span> {test.duration} <span>•</span> {test.difficulty}</p>
              </div>
              <span className="mock-best">{test.completed ? 'Completed' : 'Not attempted'}</span>
              <button type="button" className="btn btn-small" onClick={() => actions.recordQuiz({ category: test.category })}>Take test <ChevronRight size={14} /></button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RoadmapPage({ summary, onNavigate }) {
  const categoryProgress = Object.fromEntries((summary?.categoryProgress || []).map(({ category, percent }) => [category, percent]));
  const averageFoundation = Math.round(
    ['Aptitude', 'Reasoning', 'Verbal Ability'].reduce((total, category) => total + (categoryProgress[category] || 0), 0) / 3
  );
  const phases = [
    { number: '1', title: 'Master placement fundamentals', description: 'Build speed and accuracy with aptitude, reasoning, and verbal ability practice.', detail: 'Practice daily', progress: averageFoundation, icon: Target, color: '#2563eb' },
    { number: '2', title: 'Build DSA problem-solving', description: 'Learn arrays, strings, linked lists, stacks, queues, trees, graphs, and dynamic programming.', detail: 'Solve topic-wise', progress: categoryProgress.DSA || 0, icon: Code2, color: '#db2777' },
    { number: '3', title: 'Test your readiness', description: 'Take company-specific mock tests, track your time, and review every mistake.', detail: `${summary?.quizzesTaken || 0} tests taken`, progress: Math.min(100, (summary?.quizzesTaken || 0) * 10), icon: Trophy, color: '#f59e0b' },
    { number: '4', title: 'Prepare for interviews', description: 'Revise projects, core CS concepts, technical questions, and HR answers.', detail: 'Final preparation', progress: 0, icon: Users, color: '#16a34a' }
  ];
  const overall = Math.max(0, Math.min(100, Number(summary?.overall) || Math.round(phases.reduce((total, phase) => total + phase.progress, 0) / phases.length)));
  const completedPhases = phases.filter((phase) => phase.progress >= 100).length;
  const phaseTabs = { '1': 'Practice', '2': 'DSA', '3': 'Mock Tests', '4': 'Profile Settings' };

  return (
    <section className="workspace-page roadmap-page">
      <div className="roadmap-hero">
        <div className="roadmap-hero-copy">
          <span className="page-eyebrow">KEEP MOVING FORWARD</span>
          <h2>Your next opportunity starts with today&apos;s progress.</h2>
          <p>Use this roadmap to balance learning, practice, testing, and interview preparation.</p>
        </div>
        <div className="roadmap-overall-score"><strong>{overall}%</strong><span>overall complete</span></div>
      </div>
      <div className="roadmap-progress">
        <div><strong>{overall}%</strong><span>roadmap complete</span></div>
        <div className="roadmap-track"><i style={{ width: `${overall}%` }} /></div>
        <span>{overall >= 100 ? 'Placement ready' : `${phases.length - completedPhases} phases remaining`}</span>
      </div>
      <div className="roadmap-list">
        {phases.map((phase) => {
          const PhaseIcon = phase.icon;
          const done = phase.progress >= 100;
          return (
            <article className={`roadmap-step${done ? ' completed' : ''}`} key={phase.number}>
              <div className="roadmap-number" style={{ color: phase.color, backgroundColor: `${phase.color}15` }}>{done ? <CheckCircle2 size={20} /> : phase.number}</div>
              <div className="roadmap-step-icon" style={{ color: phase.color, backgroundColor: `${phase.color}12` }}><PhaseIcon size={19} /></div>
              <div className="roadmap-step-copy">
                <span className="page-eyebrow">{done ? 'COMPLETED' : `PHASE ${phase.number}`}</span>
                <h3>{phase.title}</h3>
                <p>{phase.description}</p>
                <div className="roadmap-step-progress"><i style={{ width: `${phase.progress}%`, backgroundColor: phase.color }} /></div>
                <span className="roadmap-step-meta">{phase.progress}% complete <span>•</span> {phase.detail}</span>
              </div>
              <button type="button" onClick={() => onNavigate(phaseTabs[phase.number])}>{done ? 'Review' : phase.progress > 0 ? 'Continue' : 'Start phase'} <ChevronRight size={15} /></button>
            </article>
          );
        })}
      </div>
      <div className="roadmap-tip"><Zap size={18} /><span><strong>Recommended routine:</strong> study one concept, solve five questions, then review your mistakes every day.</span></div>
    </section>
  );
}

function BookmarksPage({ summary, actions }) {
  const bookmarks = summary?.bookmarks || [];
  return (
    <section className="workspace-page">
      <WorkspaceHeader compact action={<span className="bookmark-count"><Bookmark size={17} /> {bookmarks.length} saved items</span>} />
      {bookmarks.length ? (
        <div className="bookmarks-list">
          {bookmarks.map((bm) => (
            <article className="bookmark-row" key={bm.itemId}>
              <div className="content-icon" style={{ color: '#635bff', backgroundColor: '#635bff18' }}><Bookmark size={19} /></div>
              <div className="note-copy">
                <h3>{bm.title}</h3>
                <p>{bm.category} <span>•</span> {bm.source}</p>
              </div>
              <button
                type="button"
                className="icon-button active"
                aria-label={`Remove ${bm.title} bookmark`}
                onClick={() => actions.toggleBookmark({ itemId: bm.itemId, itemType: bm.itemType, title: bm.title, category: bm.category, source: bm.source })}
              >
                <Bookmark size={18} fill="currentColor" />
              </button>
              <button type="button" className="note-open">Open <ChevronRight size={15} /></button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><Bookmark size={28} /><h3>No bookmarks yet</h3><p>Save a problem or note to find it here later.</p></div>
      )}
    </section>
  );
}

function WorkspacePage({ tab, summary, actions, practiceQuery, practiceFilter, onNavigate }) {
  if (tab === 'Practice') return <PracticePage summary={summary} actions={actions} initialQuery={practiceQuery} initialFilter={practiceFilter} />;
  if (tab === 'DSA') return <DsaPage summary={summary} actions={actions} />;
  if (tab === 'Notes') return <NotesPage summary={summary} actions={actions} />;
  if (tab === 'Mock Tests') return <MockTestsPage summary={summary} actions={actions} />;
  if (tab === 'Roadmap') return <RoadmapPage summary={summary} onNavigate={onNavigate} />;
  if (tab === 'Bookmarks') return <BookmarksPage summary={summary} actions={actions} />;
  return <section className="dashboard-panel dashboard-tab-panel"><span className="page-eyebrow">{tab.toUpperCase()}</span><h2>{tab}</h2><p>Your {tab.toLowerCase()} workspace is ready. Keep practicing consistently to improve your placement readiness.</p></section>;
}

function ProgressPage({ summary }) {
  const categoryProgress = summary?.categoryProgress || [
    { category: 'Aptitude', percent: 0 },
    { category: 'Reasoning', percent: 0 },
    { category: 'Verbal Ability', percent: 0 },
    { category: 'DSA', percent: 0 }
  ];
  const colorMap = { Aptitude: '#2563eb', Reasoning: '#14b8a6', 'Verbal Ability': '#f59e0b', DSA: '#db2777' };

  // Build weekly activity from activityLog (last 7 entries)
  const activityLog = summary?.activityLog || [];
  const last7 = [...activityLog].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Compute topic completion rings
  const topics = summary?.topics || [];
  const rings = ['Aptitude', 'Reasoning', 'Verbal Ability', 'DSA'].map((cat) => {
    const catTopics = topics.filter((t) => t.category === cat);
    const completedCount = catTopics.filter((t) => t.completed).length;
    const totalCount = catTopics.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return [String(completedCount), cat.split(' ')[0], `${pct}%`, colorMap[cat] || '#635bff'];
  });

  // Build SVG polyline from activityLog
  const maxProblems = Math.max(1, ...last7.map((d) => d.problemsSolved));
  const svgPoints = last7.map((d, i) => {
    const x = 20 + i * Math.round(475 / Math.max(1, last7.length - 1));
    const y = 135 - Math.round((d.problemsSolved / maxProblems) * 107);
    return [String(x), String(y)];
  });
  const polylineStr = svgPoints.map(([x, y]) => `${x},${y}`).join(' ');
  const areaPath = svgPoints.length
    ? `M${svgPoints.map(([x, y]) => `${x} ${y}`).join(' L')} L${svgPoints[svgPoints.length - 1][0]} 135 L${svgPoints[0][0]} 135 Z`
    : '';

  return (
    <section className="progress-page">
      <div className="progress-summary-grid">
        <div className="progress-summary-card"><span>Overall Progress</span><div className="progress-summary-ring"><strong>{summary?.overall ?? 0}%</strong><small>Overall</small></div></div>
        <div className="progress-summary-card"><span>Problems Solved</span><strong className="progress-big-number">{summary?.problemsSolved ?? 0}</strong><small className="progress-positive">+{last7.reduce((s, d) => s + d.problemsSolved, 0)} this week</small></div>
        <div className="progress-summary-card"><span>Quizzes Taken</span><strong className="progress-big-number">{summary?.quizzesTaken ?? 0}</strong><small className="progress-positive">keep going!</small></div>
        <div className="progress-summary-card"><span>Study Streak</span><strong className="progress-big-number">{summary?.studyStreakDays ?? 0} Days</strong><small className="progress-purple">Best: {summary?.bestStreakDays ?? 0} days</small></div>
      </div>
      <div className="progress-dashboard-grid">
        <section className="progress-panel">
          <h3>Subject-wise Progress</h3>
          {categoryProgress.map(({ category, percent }) => (
            <div className="subject-progress-row" key={category}>
              <span>{category}</span>
              <div><i style={{ width: `${percent}%`, backgroundColor: colorMap[category] || '#635bff' }} /></div>
              <strong>{percent}%</strong>
            </div>
          ))}
        </section>
        <section className="progress-panel activity-chart-panel">
          <h3>Weekly Activity</h3>
          <div className="activity-chart">
            <svg viewBox="0 0 500 150" role="img" aria-label="Weekly activity trend">
              <defs><linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#635bff" stopOpacity=".22" /><stop offset="100%" stopColor="#635bff" stopOpacity="0" /></linearGradient></defs>
              {areaPath && <path className="activity-area" d={areaPath} />}
              {svgPoints.length > 1 && <polyline points={polylineStr} />}
              {svgPoints.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />)}
            </svg>
            <div className="activity-days">
              {(last7.length > 0 ? last7 : Array(7).fill(null)).map((d, i) => (
                <span key={i}>{d ? dayLabels[new Date(d.date).getDay()] : dayLabels[i]}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="progress-dashboard-grid">
        <section className="progress-panel">
          <h3>Topic Completion</h3>
          <div className="topic-rings">
            {rings.map(([count, label, percent, color]) => (
              <div className="topic-ring-item" key={label}><div className="topic-ring" style={{ '--ring-color': color, '--ring-progress': percent }}><strong>{count}</strong><small>Done</small></div><span>{label}</span><b>{percent}</b></div>
            ))}
          </div>
        </section>
        <section className="progress-panel recent-activity-panel">
          <h3>Recent Activity</h3>
          {activityLog.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No activity yet. Start solving problems!</p>
          ) : (
            [...activityLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((entry) => (
              <div className="recent-activity-item" key={entry.date}>
                <div style={{ color: '#635bff', backgroundColor: '#635bff18' }}><CheckCircle2 size={17} /></div>
                <span><strong>{entry.problemsSolved} problems solved</strong><small>{entry.date} • {entry.minutesStudied} min studied</small></span>
              </div>
            ))
          )}
        </section>
      </div>
    </section>
  );
}

const TOPIC_METADATA = {
  'apt-percentages': { color: '#2563eb', icon: Target, tab: 'Practice' },
  'apt-profit-loss': { color: '#f59e0b', icon: Target, tab: 'Practice' },
  'apt-time-work': { color: '#16a34a', icon: Target, tab: 'Practice' },
  'apt-ratio-proportion': { color: '#0891b2', icon: Target, tab: 'Practice' },
  'apt-speed-distance': { color: '#7c3aed', icon: Target, tab: 'Practice' },
  'apt-simple-compound-interest': { color: '#dc2626', icon: Target, tab: 'Practice' },

  'rsn-blood-relations': { color: '#0f766e', icon: Users, tab: 'Practice' },
  'rsn-syllogism': { color: '#635bff', icon: NotebookTabs, tab: 'Practice' },
  'rsn-direction-sense': { color: '#ea580c', icon: Target, tab: 'Practice' },
  'rsn-coding-decoding': { color: '#0284c7', icon: Code2, tab: 'Practice' },
  'rsn-seating-arrangement': { color: '#9333ea', icon: Users, tab: 'Practice' },

  'va-error-spotting': { color: '#db2777', icon: FileText, tab: 'Practice' },
  'va-reading-comprehension': { color: '#16a34a', icon: BookOpen, tab: 'Practice' },
  'va-sentence-completion': { color: '#2563eb', icon: FileText, tab: 'Practice' },
  'va-synonyms-antonyms': { color: '#f59e0b', icon: FileText, tab: 'Practice' },

  'dsa-arrays-hashing': { color: '#635bff', icon: Code2, tab: 'DSA' },
  'dsa-two-pointers': { color: '#2563eb', icon: Code2, tab: 'DSA' },
  'dsa-sliding-window': { color: '#0f766e', icon: Code2, tab: 'DSA' },
  'dsa-stacks-queues': { color: '#db2777', icon: Code2, tab: 'DSA' },
  'dsa-linked-lists': { color: '#f59e0b', icon: Code2, tab: 'DSA' },
  'dsa-binary-search': { color: '#16a34a', icon: Code2, tab: 'DSA' },
  'dsa-trees': { color: '#9333ea', icon: Code2, tab: 'DSA' },
  'dsa-graphs': { color: '#dc2626', icon: Code2, tab: 'DSA' },
  'dsa-dynamic-programming': { color: '#0891b2', icon: Code2, tab: 'DSA' }
};

const CATEGORY_FALLBACK = {
  Aptitude: { color: '#2563eb', icon: Target, tab: 'Practice' },
  Reasoning: { color: '#0f766e', icon: Users, tab: 'Practice' },
  'Verbal Ability': { color: '#db2777', icon: FileText, tab: 'Practice' },
  DSA: { color: '#635bff', icon: Code2, tab: 'DSA' }
};

function getContinueLearningTopics(summary) {
  const topics = summary?.topics || [];
  if (!topics.length) {
    return [
      { topicId: 'apt-percentages', title: 'Percentages', category: 'Aptitude', solved: 0, total: 20 },
      { topicId: 'rsn-blood-relations', title: 'Blood Relations', category: 'Reasoning', solved: 0, total: 15 },
      { topicId: 'va-error-spotting', title: 'Error Spotting', category: 'Verbal Ability', solved: 0, total: 12 },
      { topicId: 'dsa-arrays-hashing', title: 'Arrays & Hashing', category: 'DSA', solved: 0, total: 25 }
    ];
  }

  // 1. In-progress topics (started, not yet completed), sorted by recency then progress
  const inProgress = topics
    .filter((t) => (t.solved || 0) > 0 && !t.completed && (t.total ? t.solved < t.total : true))
    .sort((a, b) => {
      const dateA = a.lastAttempted ? new Date(a.lastAttempted).getTime() : 0;
      const dateB = b.lastAttempted ? new Date(b.lastAttempted).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      const pctA = a.total > 0 ? (a.solved || 0) / a.total : 0;
      const pctB = b.total > 0 ? (b.solved || 0) / b.total : 0;
      return pctB - pctA;
    });

  const selected = [...inProgress];

  // 2. If fewer than 4, include recently practiced completed topics (e.g. 100% completed)
  if (selected.length < 4) {
    const recentlyCompleted = topics
      .filter((t) => (t.completed || (t.total > 0 && (t.solved || 0) >= t.total)) && !selected.some((s) => s.topicId === t.topicId))
      .sort((a, b) => {
        const dateA = a.lastAttempted ? new Date(a.lastAttempted).getTime() : 0;
        const dateB = b.lastAttempted ? new Date(b.lastAttempted).getTime() : 0;
        return dateB - dateA;
      });
    for (const t of recentlyCompleted) {
      if (selected.length >= 4) break;
      selected.push(t);
    }
  }

  // 3. If fewer than 4, ensure balanced curriculum across categories
  const categories = ['Aptitude', 'Reasoning', 'Verbal Ability', 'DSA'];
  for (const cat of categories) {
    if (selected.length >= 4) break;
    const alreadyHasCategory = selected.some((t) => t.category === cat);
    if (!alreadyHasCategory) {
      const nextInCat = topics.find((t) => t.category === cat && !t.completed && !selected.some((s) => s.topicId === t.topicId));
      if (nextInCat) selected.push(nextInCat);
    }
  }

  // 4. If still fewer than 4, add any uncompleted topics
  if (selected.length < 4) {
    for (const t of topics) {
      if (selected.length >= 4) break;
      if (!t.completed && !selected.some((s) => s.topicId === t.topicId)) {
        selected.push(t);
      }
    }
  }

  // 5. Fallback: if all completed, add any remaining topics
  if (selected.length < 4) {
    for (const t of topics) {
      if (selected.length >= 4) break;
      if (!selected.some((s) => s.topicId === t.topicId)) {
        selected.push(t);
      }
    }
  }

  return selected.slice(0, 4);
}

function Dashboard({ user, setUser, onLogout, onGoHome, initialTab }) {
  const { loading: dashLoading, summary, actions } = useDashboard();
  const [dashboardTab, setDashboardTab] = useState(() => {
    if (typeof window === 'undefined') return 'Dashboard';
    const saved = window.localStorage.getItem('placify-dashboard-tab');
    if (saved) return saved;
    return initialTab || 'Dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDailyGoals, setShowDailyGoals] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [practiceQuery, setPracticeQuery] = useState('');
  const [practiceFilter, setPracticeFilter] = useState('All');
  const pageMeta = {
    Practice: ['DAILY PRACTICE', 'Practice with purpose.', 'Short, focused sessions that turn weak areas into strengths.'],
    DSA: ['DSA ROADMAP', 'Build problem-solving confidence.', 'Follow patterns, solve consistently, and become interview-ready one topic at a time.'],
    Notes: ['YOUR LIBRARY', 'Notes that make revision easier.', 'Save your favourite resources and revisit them before every practice session.'],
    'Mock Tests': ['ASSESSMENT CENTRE', 'Mock tests, real confidence.', 'Simulate the pressure of placement day and learn from every attempt.'],
    Roadmap: ['YOUR PLAN', 'A clear path to placement.', 'Your roadmap keeps the next step visible, so preparation never feels overwhelming.'],
    Bookmarks: ['SAVED FOR LATER', 'Your bookmarks.', 'Keep the problems, notes, and strategies you want to return to close at hand.'],
    Progress: ['YOUR LEARNING JOURNEY', 'Your Progress', 'Track your momentum and celebrate every improvement.'],
    'Profile Settings': ['YOUR ACCOUNT', 'Profile Settings', 'Keep your learner profile up to date.']
  }[dashboardTab];

  const handleSelectTab = (tab, opts = {}) => {
    setDashboardTab(tab);
    setIsSidebarOpen(false);
    if (opts.query !== undefined) setPracticeQuery(opts.query);
    if (opts.filter !== undefined) setPracticeFilter(opts.filter);
    try {
      window.localStorage.setItem('placify-dashboard-tab', tab);
    } catch {
      // ignore
    }
  };

  const handleContinueTopic = (topic) => {
    if (topic.category === 'DSA') {
      handleSelectTab('DSA');
    } else {
      handleSelectTab('Practice', { query: topic.title, filter: topic.category });
    }
  };

  const continueTopics = getContinueLearningTopics(summary);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!showDailyGoals) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowDailyGoals(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDailyGoals]);

  useEffect(() => {
    if (!showProfileMenu) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowProfileMenu(false);
    };

    const handlePointerDown = (event) => {
      if (!event.target.closest('.dashboard-profile-menu-wrap')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    if (initialTab && initialTab !== 'Dashboard') {
      handleSelectTab(initialTab);
    }
  }, [initialTab]);

  const dashboardItems = [
    { label: 'Dashboard', icon: LayoutDashboard }
  ];
  const learnItems = [
    { label: 'Practice', icon: Zap },
    { label: 'DSA', icon: NotebookTabs },
    { label: 'Notes', icon: FileText }
  ];
  const assessItems = [
    { label: 'Mock Tests', icon: Target },
    { label: 'Progress', icon: BarChart3 }
  ];
  const planItems = [
    { label: 'Roadmap', icon: Target },
    { label: 'Bookmarks', icon: BookOpen }
  ];

  const isTabActive = (label) => {
    if (label === 'Dashboard') {
      return dashboardTab === 'Dashboard' || dashboardTab === 'Overview';
    }
    return dashboardTab === label;
  };

  const renderSidebarItems = (items) => items.map(({ label, icon: Icon }) => (
    <button
      className={`dashboard-nav-item${isTabActive(label) ? ' active' : ''}`}
      type="button"
      key={label}
      onClick={() => handleSelectTab(label)}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  ));

  return (
    <div className="dashboard-shell">
      <button
        type="button"
        className={`dashboard-sidebar-backdrop${isSidebarOpen ? ' visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Close dashboard navigation"
        tabIndex={isSidebarOpen ? 0 : -1}
      />
      <aside id="dashboard-navigation" className={`dashboard-sidebar${isSidebarOpen ? ' open' : ''}`}>
        <div className="dashboard-brand">
          <div className="brand-icon-wrapper">
            <img src="/logo.png" alt="" aria-hidden="true" />
          </div>
          <div><strong>Placify</strong><span>Student dashboard</span></div>
          <button
            type="button"
            className="dashboard-sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close dashboard navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className="dashboard-sidebar-content">
          <span className="dashboard-section-label">DASHBOARD</span>
          {renderSidebarItems(dashboardItems)}
          <span className="dashboard-section-label">LEARN</span>
          {renderSidebarItems(learnItems)}
          <span className="dashboard-section-label">ASSESS</span>
          {renderSidebarItems(assessItems)}
          <span className="dashboard-section-label">PLAN</span>
          {renderSidebarItems(planItems)}
        </div>
        <div className="dashboard-profile-section">
          <button
            type="button"
            className={`dashboard-profile dashboard-profile-btn${dashboardTab === 'Profile Settings' ? ' active' : ''}`}
            onClick={() => handleSelectTab('Profile Settings')}
            title="Click to view & edit Profile Settings"
          >
            <UserAvatar user={user} size="md" showBadge={true} />
            <div className="dashboard-profile-meta">
              <strong>{user?.name || 'Placify Learner'}</strong>
              <span>{user?.headline || 'Student account'}</span>
            </div>
            <Settings size={16} className="dashboard-profile-gear" />
          </button>
          <button
            className="dashboard-home-button"
            type="button"
            onClick={onGoHome}
          >
            <Home size={17} />
            <span>Go to Home</span>
          </button>
          <button
            className="dashboard-logout"
            type="button"
            onClick={onLogout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-heading">
            <button
              type="button"
              className="dashboard-sidebar-toggle"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open dashboard navigation"
              aria-expanded={isSidebarOpen}
              aria-controls="dashboard-navigation"
            >
              {isSidebarOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
            {(dashboardTab === 'Dashboard' || dashboardTab === 'Overview') && (
              <>
                <h1>Good {getGreeting()}, {getFirstName(user?.name)}!</h1>
                <p>Keep going! You're doing great.</p>
              </>
            )}
            {pageMeta && (
              <>
                <span className="page-eyebrow">{pageMeta[0]}</span>
                <h1>{pageMeta[1]}</h1>
                <p>{pageMeta[2]}</p>
              </>
            )}
          </div>
          {(dashboardTab === 'Dashboard' || dashboardTab === 'Overview') && (
            <button
              type="button"
              className="dashboard-streak-badge"
              onClick={() => setShowDailyGoals(true)}
              aria-haspopup="dialog"
              aria-expanded={showDailyGoals}
            >
              <Flame size={22} />
              <span>
                <strong>Daily Goal</strong>
                <small>{(summary?.dailyGoals || []).filter((g) => g.completed).length} / {(summary?.dailyGoals || []).length || 5} topics</small>
              </span>
            </button>
          )}
          <div className="dashboard-profile-menu-wrap">
            <button
              type="button"
              className="dashboard-avatar-btn"
              onClick={() => setShowProfileMenu((visible) => !visible)}
              title="Open account menu"
              aria-label="Open account menu"
              aria-expanded={showProfileMenu}
              aria-haspopup="menu"
            >
              <UserAvatar user={user} size="md" showBadge={true} />
            </button>
            {showProfileMenu && (
              <div className="dashboard-profile-menu" role="menu">
                <div className="dashboard-profile-menu-user">
                  <UserAvatar user={user} size="sm" />
                  <div>
                    <strong>{user?.name || 'Placify Learner'}</strong>
                    <span>{user?.email || user?.headline || 'Student account'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleSelectTab('Profile Settings');
                  }}
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button type="button" role="menuitem" onClick={onLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        {dashboardTab === 'Profile Settings' ? (
          <ProfileSettings
            user={user}
            onUpdateUser={setUser}
            onBack={() => handleSelectTab('Dashboard')}
          />
        ) : (dashboardTab === 'Dashboard' || dashboardTab === 'Overview') ? (
          <>
            <section className="dashboard-overview-grid">
              <div className="dashboard-progress-card">
                <h2>Overall Progress</h2>
                <div className="dashboard-progress-content">
                  {(() => {
                    const overall = Math.max(0, Math.min(100, Number(summary?.overall) || 0));
                    const firstColorStop = (overall * 0.34).toFixed(2);
                    const secondColorStop = (overall * 0.67).toFixed(2);
                    const ringBackground = overall > 0
                      ? `radial-gradient(circle, #ffffff 57%, transparent 58%), conic-gradient(#3b82f6 0 ${firstColorStop}%, #ef476f ${firstColorStop}% ${secondColorStop}%, #16a34a ${secondColorStop}% ${overall}%, #e8eef8 ${overall}% 100%)`
                      : 'transparent';
                    return (
                      <div
                        className={`dashboard-progress-ring${overall > 0 ? ' active' : ''}`}
                        style={{ background: ringBackground }}
                      >
                        <strong>{overall}%</strong>
                        <span>Completion</span>
                      </div>
                    );
                  })()}
                  <div className="dashboard-subject-progress">
                    {(summary?.categoryProgress || [
                      { category: 'Aptitude', percent: 0 },
                      { category: 'Reasoning', percent: 0 },
                      { category: 'Verbal Ability', percent: 0 },
                      { category: 'DSA', percent: 0 }
                    ]).map(({ category, percent }) => {
                      const colorMap = { Aptitude: '#3b82f6', Reasoning: '#2563eb', 'Verbal Ability': '#ef476f', DSA: '#16a34a' };
                      return (
                        <div className="dashboard-subject-row" key={category}>
                          <div><strong>{category}</strong><span>{percent}%</span></div>
                          <div className="dashboard-subject-track"><i style={{ width: `${percent}%`, backgroundColor: colorMap[category] || '#635bff' }} /></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="dashboard-quick-actions">
                <h2>Quick Actions</h2>
                {[
                  ['Continue Learning', 'Practice', PlayCircle],
                  ['Solve Leftover Problems', 'DSA', CheckCircle2],
                  ['Take a Quiz', 'Mock Tests', Trophy],
                  ['View Notes', 'Notes', FileText]
                ].map(([label, tab, Icon]) => (
                  <button type="button" key={label} onClick={() => handleSelectTab(tab)}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="dashboard-section-block">
              <div className="dashboard-section-heading">
                <div>
                  <h2>Continue Learning</h2>
                  <span>Keep your momentum going • Real-time progress</span>
                </div>
                <button
                  type="button"
                  className="dashboard-view-all-link"
                  onClick={() => handleSelectTab('Practice')}
                >
                  View All Topics <span>→</span>
                </button>
              </div>

              <div className="dashboard-learning-grid">
                {continueTopics.map((item) => {
                  const total = item.total || 20;
                  const solved = item.solved || 0;
                  const percent = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
                  const meta = TOPIC_METADATA[item.topicId] || CATEGORY_FALLBACK[item.category] || { color: '#635bff', icon: Zap, tab: 'Practice' };
                  const Icon = meta.icon;
                  const isCompleted = item.completed || (total > 0 && solved >= total);
                  return (
                    <article className="dashboard-learning-card" key={item.topicId || item.title}>
                      <div className="dashboard-card-top-row">
                        <div className="dashboard-card-icon" style={{ color: meta.color, backgroundColor: `${meta.color}18` }}>
                          <Icon size={19} />
                        </div>
                        {isCompleted ? (
                          <span className="learning-badge completed"><CheckCircle2 size={12} /> Mastered</span>
                        ) : solved > 0 ? (
                          <span className="learning-badge in-progress"><span className="pulse-dot" /> In Progress</span>
                        ) : (
                          <span className="learning-badge upcoming">Next Up</span>
                        )}
                      </div>
                      <h3>{item.title}</h3>
                      <span className="dashboard-learning-cat">{item.category}</span>
                      <div className="dashboard-card-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                        <i style={{ width: `${percent}%`, backgroundColor: meta.color }} />
                      </div>
                      <div className="dashboard-learning-meta">
                        <strong style={{ color: percent > 0 ? meta.color : 'var(--text-muted)' }}>{percent}% complete</strong>
                        <span>{solved} / {total} solved</span>
                      </div>
                      <div className="dashboard-learning-actions">
                        <button
                          type="button"
                          className="dashboard-continue-btn"
                          onClick={() => handleContinueTopic({ ...item, ...meta })}
                          title={`Continue learning ${item.title}`}
                        >
                          Continue <ArrowRight size={13} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
            <section className="dashboard-section-block dashboard-recommended-block">
              <div className="dashboard-section-heading"><h2>Recommended for You</h2><button type="button" onClick={() => handleSelectTab('Practice')}>View All <span>→</span></button></div>
              <div className="dashboard-recommendation-grid">
                {[
                  ['Profit & Loss', 'Aptitude • Medium', 'Win more with smart prep', Target],
                  ['Syllogism', 'Reasoning • Medium', 'Build logical thinking', NotebookTabs],
                  ['Error Spotting', 'Verbal • Easy', 'Sharpen your grammar', FileText],
                  ['Array Basics', 'DSA • Easy', 'Start with the fundamentals', BookOpen]
                ].map(([title, meta, description, Icon]) => (
                  <article className="dashboard-recommended-card" key={title}>
                    <div className="dashboard-card-icon"><Icon size={18} /></div>
                    <h3>{title}</h3><span>{meta}</span><p>{description}</p>
                    <button type="button" onClick={() => handleSelectTab('Practice')}>Start now <span>→</span></button>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : dashboardTab === 'Progress' ? (
          <ProgressPage summary={summary} />
        ) : (
          <WorkspacePage
            tab={dashboardTab}
            summary={summary}
            actions={actions}
            practiceQuery={practiceQuery}
            practiceFilter={practiceFilter}
            onNavigate={handleSelectTab}
          />
        )}
        {showDailyGoals && (
          <div
            className="daily-goals-overlay"
            role="presentation"
            onClick={() => setShowDailyGoals(false)}
          >
            <section
              className="daily-goals-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="daily-goals-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="daily-goals-close"
                onClick={() => setShowDailyGoals(false)}
                aria-label="Close daily goals"
              >
                <X size={18} />
              </button>
              <div className="daily-goals-heading">
                <div className="daily-goals-icon"><Flame size={24} /></div>
                <div><span className="page-eyebrow">TODAY&apos;S PLAN</span><h2 id="daily-goals-title">Daily Goals</h2></div>
              </div>
              {(() => {
                const goals = summary?.dailyGoals || [];
                const completedCount = goals.filter((g) => g.completed).length;
                const totalCount = goals.length || 5;
                const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                return (
                  <>
                    <p className="daily-goals-summary">You are {completedCount} of {totalCount} topics complete. Finish {totalCount - completedCount} more to keep your learning streak going!</p>
                    <div className="daily-goals-progress"><i style={{ width: `${pct}%` }} /></div>
                    <div className="daily-goals-progress-label"><strong>{pct}% complete</strong><span>{totalCount - completedCount} topics left</span></div>
                    <div className="daily-goals-list">
                      {dashLoading ? (
                        <div className="dashboard-loading-state"><div className="dashboard-spinner" /></div>
                      ) : goals.map((goal, idx) => (
                        <button
                          type="button"
                          className={`daily-goal-item${goal.completed ? ' complete' : ''}`}
                          key={goal.label}
                          onClick={() => actions.toggleGoal(idx, !goal.completed)}
                          style={{ cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 0 }}
                        >
                          <CheckCircle2 size={19} />
                          <span><strong>{goal.label}</strong><small>{goal.category}</small></span>
                          {goal.completed && <em>Done</em>}
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
              <button type="button" className="btn btn-primary daily-goals-action" onClick={() => { setShowDailyGoals(false); handleSelectTab('Practice'); }}>
                Continue today&apos;s goals <Zap size={16} />
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
