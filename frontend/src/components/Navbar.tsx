import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, User, LogOut, Menu, X } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar glass-morphism">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <Play fill="var(--primary)" color="var(--primary)" size={32} />
          <span className="logo-text">KINO<span>TIME</span></span>
        </Link>

        {/* Mobile Toggle Icon */}
        <button className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/movies" className="nav-link" onClick={closeMenu}>Movies</Link>
          <Link to="/subscription" className="nav-link" onClick={closeMenu}>Pricing</Link>
          {user && <Link to="/favorites" className="nav-link" onClick={closeMenu}>Favorites</Link>}
          {user && (user.role === 'admin' || user.role === 'superadmin') && user.isActive && (
            <div className="admin-dropdown desktop-only">
              <button className="nav-link dropdown-trigger">Manage ▼</button>
              <div className="dropdown-content glass-morphism">
                <Link to="/admin/movies" className="dropdown-link" onClick={closeMenu}>Movies</Link>
                <Link to="/admin/categories" className="dropdown-link" onClick={closeMenu}>Categories</Link>
                <Link to="/admin/subscriptions" className="dropdown-link" onClick={closeMenu}>Plans</Link>
                <Link to="/admin/users" className="dropdown-link" onClick={closeMenu}>Users</Link>
                {user.role === 'superadmin' && (
                  <Link to="/admin/admins" className="dropdown-link" onClick={closeMenu}>Admins</Link>
                )}
              </div>
            </div>
          )}

          {/* Mobile Admin Links (already inside nav-links which becomes a drawer) */}
          <div className="mobile-only admin-mobile-links">
            {user && (user.role === 'admin' || user.role === 'superadmin') && user.isActive && (
              <>
                <Link to="/admin/movies" className="nav-link admin-link" onClick={closeMenu}>Manage Movies</Link>
                <Link to="/admin/categories" className="nav-link admin-link" onClick={closeMenu}>Manage Categories</Link>
                <Link to="/admin/subscriptions" className="nav-link admin-link" onClick={closeMenu}>Manage Plans</Link>
                <Link to="/admin/users" className="nav-link admin-link" onClick={closeMenu}>Manage Users</Link>
                {user.role === 'superadmin' && (
                  <Link to="/admin/admins" className="nav-link admin-link" onClick={closeMenu}>Manage Admins</Link>
                )}
              </>
            )}
          </div>

          {/* User Menu inside navigation on mobile */}
          <div className="mobile-user-menu">
            {user ? (
              <>
                <Link to="/profile" className="profile-btn" onClick={closeMenu}>
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}/uploads/${user.avatarUrl}`}
                      alt={user.username}
                      className="avatar-small"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span>{user.username}</span>
                </Link>
                <button onClick={() => { logout(); closeMenu(); }} className="logout-btn">
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="login-btn gradient-bg" onClick={closeMenu}>Login</Link>
            )}
          </div>
        </div>

        <div className="nav-actions desktop-only">
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="profile-btn">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}/uploads/${user.avatarUrl}`}
                    alt={user.username}
                    className="avatar-small"
                  />
                ) : (
                  <User size={20} />
                )}
                <span>{user.username}</span>
              </Link>
              <button onClick={logout} className="logout-btn">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn gradient-bg">Login</Link>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 5%;
          border-bottom: 1px solid var(--glass-border);
        }
        .nav-container {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -1px;
          z-index: 1001;
        }
        .logo-text span {
          color: var(--primary);
        }
        .nav-links {
          display: flex;
          gap: 30px;
          align-items: center;
        }
        .nav-link {
          font-weight: 500;
          color: var(--text-muted);
          transition: color 0.3s;
        }
        .nav-link:hover {
          color: var(--text-main);
        }
        .admin-link {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .login-btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.2s;
          display: block;
          text-align: center;
        }
        .login-btn:hover {
          transform: translateY(-2px);
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--glass);
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: 500;
          border: 1px solid var(--glass-border);
          transition: 0.3s;
        }
        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .avatar-small {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
        }
        .logout-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logout-btn:hover {
          color: var(--primary);
        }
        .admin-dropdown {
          position: relative;
          height: 80px;
          display: flex;
          align-items: center;
        }
        .dropdown-trigger {
          background: var(--primary);
          color: white !important;
          padding: 10px 18px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 700;
          transition: 0.3s;
          box-shadow: 0 4px 15px rgba(229, 9, 20, 0.2);
        }
        .dropdown-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(229, 9, 20, 0.3);
          background: #ff2d2d;
        }
        .dropdown-content {
          position: absolute;
          top: 65px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          min-width: 200px;
          padding: 8px;
          border-radius: 14px;
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
          z-index: 1002;
          background: #15161c; /* Solid black background */
          border: 1px solid var(--glass-border);
          box-shadow: 0 15px 40px rgba(0,0,0,0.6);
          backdrop-filter: none; /* Remove blur to keep it solid */
        }
        .admin-dropdown:hover .dropdown-content {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
        .dropdown-link {
          display: block;
          padding: 12px 20px;
          border-radius: 8px;
          color: var(--text-muted);
          transition: 0.3s;
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .dropdown-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .mobile-toggle {
          display: none;
        }
        .mobile-user-menu {
          display: none;
        }
        .mobile-only {
          display: none;
        }
        .desktop-only {
          display: flex;
        }

        @media (max-width: 1024px) {
          .mobile-only {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
          }
          .desktop-only {
            display: none;
          }
          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            height: 100vh;
            width: 300px;
            background: rgba(10, 10, 12, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 100px 40px;
            transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            align-items: flex-start;
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
          }
          .nav-links.active {
            right: 0;
          }
          .mobile-toggle {
            display: block;
          }
          .desktop-only {
            display: none;
          }
          .mobile-user-menu {
            display: flex;
          }
          .admin-link {
            font-size: 0.85rem;
            color: var(--primary);
            font-weight: 600;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
