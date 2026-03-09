import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data;
            login(access_token, user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card glass-morphism">
                <div className="card-header">
                    <h2 className="gradient-text">Welcome Back</h2>
                    <p>Sign in to your account to continue</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Mail size={20} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-submit gradient-bg" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <div className="card-footer">
                    <span>Don't have an account?</span>
                    <Link to="/register">Register Now</Link>
                </div>
            </div>

            <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #1e2029 0%, var(--bg-dark) 100%);
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
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
          gap: 20px;
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
        .login-submit {
          padding: 15px;
          border-radius: 10px;
          border: none;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }
        .card-footer {
          margin-top: 30px;
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

export default Login;
