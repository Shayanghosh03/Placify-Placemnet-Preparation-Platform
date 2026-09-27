import React from 'react';
import { MoreVertical } from 'lucide-react';
import UserAvatar from './UserAvatar';

const navItems = ['Home', 'About', 'Contact'];

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  showDashboardShortcut = false,
  onGoDashboard,
  user,
  onOpenProfile
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleNavigation = (item) => {
    setActiveTab(item);
    setMenuOpen(false);
  };

  const handleAuth = (type) => {
    onOpenAuthModal(type);
    setMenuOpen(false);
  };

  const renderAuthButtons = () => {
    if (showDashboardShortcut) {
      return (
        <div className="navbar-auth-logged-in">
          <button
            type="button"
            className="navbar-user-chip"
            onClick={() => {
              if (onOpenProfile) onOpenProfile();
              else onGoDashboard();
              setMenuOpen(false);
            }}
            title="Open Profile Settings"
          >
            <UserAvatar user={user} size="sm" showBadge={false} />
            <span className="navbar-user-name">{user?.name || 'My Profile'}</span>
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              onGoDashboard();
              setMenuOpen(false);
            }}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    return (
      <>
        <button
          className="btn btn-login"
          onClick={() => handleAuth('login')}
        >
          Login
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleAuth('register')}
        >
          Get Started
        </button>
      </>
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <button
          className="brand-logo"
          onClick={() => handleNavigation('Home')}
          aria-label="Go to Placify home"
        >
          <div className="brand-icon-wrapper">
            <img src="/logo.png" alt="" aria-hidden="true" />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">Placify</span>
            <span className="brand-tagline">Learn. Practice. Get Placed.</span>
          </div>
        </button>

        <nav aria-label="Main navigation">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li
                className={`nav-link-item${activeTab === item ? ' active' : ''}`}
                key={item}
              >
                <button
                  type="button"
                  onClick={() => handleNavigation(item)}
                  aria-current={activeTab === item ? 'page' : undefined}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          {renderAuthButtons()}
        </div>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <MoreVertical size={23} />
        </button>

        {menuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <button
                className={activeTab === item ? 'active' : ''}
                type="button"
                key={item}
                onClick={() => handleNavigation(item)}
              >
                {item}
              </button>
            ))}
            <div className="mobile-menu-divider" />
            {showDashboardShortcut ? (
              <>
                <button
                  type="button"
                  className="mobile-profile-button"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    else onGoDashboard();
                    setMenuOpen(false);
                  }}
                >
                  <UserAvatar user={user} size="sm" />
                  <span>{user?.name || 'Profile Settings'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onGoDashboard();
                    setMenuOpen(false);
                  }}
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => handleAuth('login')}>Login</button>
                <button type="button" onClick={() => handleAuth('register')}>Get Started</button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
