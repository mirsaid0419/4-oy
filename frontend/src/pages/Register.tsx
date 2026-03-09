import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, User, Upload, Loader2, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      if (avatar) {
        data.append('avatar', avatar);
      }

      await api.post('/auth/user/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-card glass-morphism success-view">
          <CheckCircle size={80} color="#4ade80" />
          <h2 className="gradient-text">Registration Successful!</h2>
          <p>Redirecting you to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card glass-morphism">
        <div className="card-header">
          <h2 className="gradient-text">Create Account</h2>
          <p>Join the future of cinema today</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="file-upload">
            <label htmlFor="avatar-upload" className="upload-label">
              <Upload size={20} />
              <span>{avatar ? avatar.name : 'Upload Avatar'}</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </div>

          <div className="button-group">
            <button type="submit" className="register-submit gradient-bg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
            <button type="button" className="cancel-btn glass-morphism" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>

        <div className="card-footer">
          <span>Already have an account?</span>
          <Link to="/login">Sign In</Link>
        </div>
      </div>

      <style>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #1e2029 0%, var(--bg-dark) 100%);
          padding: 80px 20px 40px;
        }
        .register-card {
          width: 100%;
          max-width: 500px;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
        }
        .success-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 60px;
        }
        .card-header h2 {
          font-size: 2.2rem;
          margin-bottom: 10px;
        }
        .card-header p {
          color: var(--text-muted);
          margin-bottom: 30px;
        }
        .error-msg {
          background: rgba(229, 9, 20, 0.1);
          color: var(--primary);
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          border: 1px solid rgba(229, 9, 20, 0.2);
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .input-group {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-group input {
          width: 100%;
          padding: 15px 15px 15px 50px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: white;
          outline: none;
          transition: border-color 0.3s;
        }
        .input-group input:focus {
          border-color: var(--primary);
        }
        .file-upload {
          margin-bottom: 5px;
        }
        .upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px dashed var(--glass-border);
          border-radius: 10px;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.3s;
        }
        .upload-label:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--text-muted);
        }
        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        .register-submit {
          flex: 2;
          padding: 15px;
          border-radius: 12px;
          border: none;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, background 0.3s;
        }
        .register-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .cancel-btn {
          flex: 1;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.05);
        }
        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .card-footer {
          margin-top: 35px;
          font-size: 0.95rem;
          color: var(--text-muted);
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .card-footer a {
          color: var(--primary);
          font-weight: 600;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
