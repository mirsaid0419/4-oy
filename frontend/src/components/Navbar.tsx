import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar glass-morphism">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Play fill="var(--primary)" color="var(--primary)" size={32} />
          <span className="logo-text">KINO<span>TIME</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/movies" className="nav-link">Movies</Link>
          <Link to="/subscription" className="nav-link">Pricing</Link>
          {user && <Link to="/favorites" className="nav-link">Favorites</Link>}
          {user && (user.role === 'admin' || user.role === 'superadmin') && (
            <>
              <Link to="/admin/movies" className="nav-link admin-link">Manage Movies</Link>
              <Link to="/admin/categories" className="nav-link admin-link">Manage Categories</Link>
              <Link to="/admin/subscriptions" className="nav-link admin-link">Manage Plans</Link>
              {user.role === 'superadmin' && (
                <Link to="/admin/admins" className="nav-link admin-link">Manage Admins</Link>
              )}
            </>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="profile-btn">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:2003/uploads/${user.avatarUrl}`}
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
        }
        .logo-text span {
          color: var(--primary);
        }
        .nav-links {
          display: flex;
          gap: 30px;
        }
        .nav-link {
          font-weight: 500;
          color: var(--text-muted);
          transition: color 0.3s;
        }
        .nav-link:hover {
          color: var(--text-main);
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
        }
        .logout-btn:hover {
          color: var(--primary);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
