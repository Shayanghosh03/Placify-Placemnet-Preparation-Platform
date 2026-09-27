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
import { ArrowRight, BarChart3, BookOpen, Bookmark, CheckCircle2, ChevronRight, CirclePlay, Code2, Download, FileText, Filter, Flame, Home, LayoutDashboard, LogOut, Mail, MapPin, Menu, NotebookTabs, PlayCircle, RotateCcw, Search, Send, Settings, Target, Trophy, Users, X, Zap } from 'lucide-react';
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

  const handleStartLearning = () => {
    setAuthModalType('register');
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
              onStartLearning={handleStartLearning}
            />

            {/* 4 Main Pastel Category Cards (Aptitude, Reasoning, Verbal, DSA) */}
            <MainCategories
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* 4 Compact Feature Items */}
            <FeatureBar
              onSelectFeature={(feat) => setSelectedFeature(feat)}
            />

            {/* Trust Bar & Stats Counter */}
            <TrustAndStats />
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
            <FeatureBar onSelectFeature={(feat) => setSelectedFeature(feat)} />
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
            <TrustAndStats />
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

function PracticePage({ summary, actions, initialQuery = '', initialFilter = 'All' }) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialFilter !== undefined) setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setLoadingTopics(true);
    actions.loadContent({ type: 'topic' }).then((data) => {
      setTopics(data || []);
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
                  <button type="button" onClick={() => actions.solveTopic(topic.itemId)}>Practice <ArrowRight size={14} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DsaPage({ summary, actions }) {
  const [dsaTopics, setDsaTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    actions.loadContent({ type: 'topic', category: 'DSA' }).then((data) => {
      setDsaTopics(data || []);
      setLoading(false);
    });
  }, [actions]);

  const totalProblems = dsaTopics.reduce((s, t) => s + (t.totalProblems || 0), 0);
  const totalSolved = dsaTopics.reduce((s, t) => {
    const tp = (summary?.topics || []).find((x) => x.topicId === t.itemId);
    return s + (tp !== undefined ? tp.solved : (t.solved || 0));
  }, 0);
  const overallPct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const weeksLeft = Math.max(1, Math.round(((totalProblems - totalSolved) / 5)));

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
        <div className="workspace-card-grid">
          {dsaTopics.map((topic) => {
            const topicProgress = (summary?.topics || []).find((t) => t.topicId === topic.itemId);
            const currentSolved = topicProgress !== undefined ? topicProgress.solved : (topic.solved || 0);
            const total = topic.totalProblems || topic.total || 0;
            const pct = total > 0 ? Math.round((currentSolved / total) * 100) : 0;
            return (
              <article className="content-card dsa-card" key={topic.itemId}>
                <div className="content-card-top">
                  <span className="content-icon purple"><Code2 size={19} /></span>
                  <span className="topic-count">{currentSolved} / {total}</span>
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <div className="mini-progress"><i style={{ width: `${pct}%`, backgroundColor: topic.color }} /></div>
                <div className="card-meta">
                  <span>{pct}% complete</span>
                  <button type="button" onClick={() => actions.solveTopic(topic.itemId)}>View problems <ChevronRight size={14} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

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

  return (
    <section className="workspace-page">
      <WorkspaceHeader compact action={<button className="btn btn-outline-demo"><Download size={17} /> Download all</button>} />
      {loading ? (
        <div className="dashboard-loading-state"><div className="dashboard-spinner" /><span>Loading notes…</span></div>
      ) : (
        <div className="notes-layout">
          <div className="notes-list">
            {notes.map((note) => (
              <article className="note-row" key={note.itemId}>
                <div className="content-icon" style={{ color: note.color, backgroundColor: `${note.color}18` }}><FileText size={20} /></div>
                <div className="note-copy">
                  <h3>{note.title}</h3>
                  <p>{note.category} <span>•</span> {note.pages}</p>
                </div>
                <button
                  type="button"
                  className={`icon-button${bookmarkedIds.has(note.itemId) ? ' active' : ''}`}
                  aria-label={`Bookmark ${note.title}`}
                  onClick={() => actions.toggleBookmark({ itemId: note.itemId, itemType: 'note', title: note.title, category: note.category, source: 'Notes Library' })}
                >
                  <Bookmark size={18} fill={bookmarkedIds.has(note.itemId) ? 'currentColor' : 'none'} />
                </button>
                <button type="button" className="note-open">Open <ChevronRight size={15} /></button>
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

function RoadmapPage() {
  const phases = [['1', 'Strengthen fundamentals', 'Complete core aptitude, reasoning, and verbal topics.', true], ['2', 'Build DSA foundations', 'Learn patterns and solve 75 curated problems.', true], ['3', 'Practice company tests', 'Take timed mocks and review every mistake.', false], ['4', 'Prepare for interviews', 'Revise projects, CS fundamentals, and HR questions.', false]];
  return <section className="workspace-page"><WorkspaceHeader compact action={<button className="btn btn-outline-demo"><RotateCcw size={16} /> Reset roadmap</button>} /><div className="roadmap-progress"><div><strong>42%</strong><span>roadmap complete</span></div><div className="roadmap-track"><i style={{ width: '42%' }} /></div><span>12 weeks left</span></div><div className="roadmap-list">{phases.map(([number, title, description, done]) => <article className={`roadmap-step${done ? ' completed' : ''}`} key={number}><div className="roadmap-number">{done ? <CheckCircle2 size={20} /> : number}</div><div><span className="page-eyebrow">{done ? 'COMPLETED' : `PHASE ${number}`}</span><h3>{title}</h3><p>{description}</p></div><button type="button">{done ? 'Review' : 'Start phase'} <ChevronRight size={15} /></button></article>)}</div></section>;
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

function WorkspacePage({ tab, summary, actions, practiceQuery, practiceFilter }) {
  if (tab === 'Practice') return <PracticePage summary={summary} actions={actions} initialQuery={practiceQuery} initialFilter={practiceFilter} />;
  if (tab === 'DSA') return <DsaPage summary={summary} actions={actions} />;
  if (tab === 'Notes') return <NotesPage summary={summary} actions={actions} />;
  if (tab === 'Mock Tests') return <MockTestsPage summary={summary} actions={actions} />;
  if (tab === 'Roadmap') return <RoadmapPage summary={summary} />;
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
  const [practiceQuery, setPracticeQuery] = useState('');
  const [practiceFilter, setPracticeFilter] = useState('All');
  const [solvingTopicId, setSolvingTopicId] = useState(null);
  const [realtimeNotification, setRealtimeNotification] = useState(null);
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

  const handleQuickSolve = async (topicId, topicTitle) => {
    if (!topicId || solvingTopicId) return;
    setSolvingTopicId(topicId);
    try {
      await actions.solveTopic(topicId, 1);
      setRealtimeNotification(`+1 problem solved in ${topicTitle}! Live progress updated.`);
      setTimeout(() => {
        setRealtimeNotification((curr) => (curr?.includes(topicTitle) ? null : curr));
      }, 3500);
    } catch (err) {
      console.error('Quick solve failed:', err);
    } finally {
      setSolvingTopicId(null);
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
          <button
            type="button"
            className="dashboard-avatar-btn"
            onClick={() => handleSelectTab('Profile Settings')}
            title="Open Profile Settings"
            aria-label="Open Profile Settings"
          >
            <UserAvatar user={user} size="md" showBadge={true} />
          </button>
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
                  <div className="dashboard-progress-ring"><strong>{summary?.overall ?? 0}%</strong><span>Completion</span></div>
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

              {realtimeNotification && (
                <div className="realtime-progress-banner" role="status" aria-live="polite">
                  <Zap size={16} />
                  <span>{realtimeNotification}</span>
                </div>
              )}

              <div className="dashboard-learning-grid">
                {continueTopics.map((item) => {
                  const total = item.total || 20;
                  const solved = item.solved || 0;
                  const percent = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
                  const meta = TOPIC_METADATA[item.topicId] || CATEGORY_FALLBACK[item.category] || { color: '#635bff', icon: Zap, tab: 'Practice' };
                  const Icon = meta.icon;
                  const isCompleted = item.completed || (total > 0 && solved >= total);
                  const isSolving = solvingTopicId === item.topicId;

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
                        <button
                          type="button"
                          className="dashboard-quick-btn"
                          onClick={() => handleQuickSolve(item.topicId, item.title)}
                          disabled={isSolving || isCompleted}
                          title={isCompleted ? 'Topic completed!' : 'Quick solve 1 problem (+1)'}
                        >
                          {isSolving ? (
                            <span className="btn-spinner" />
                          ) : isCompleted ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <>+1 Solved <Zap size={12} /></>
                          )}
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
