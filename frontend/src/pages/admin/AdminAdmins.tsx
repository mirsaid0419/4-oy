import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../../services/api';
import { UserPlus, User, Mail, Shield, UserX, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';

const AdminAdmins: React.FC = () => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showDemoteConfirm, setShowDemoteConfirm] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin'
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await api.get('/users/all/admins');
            const data = response.data.data || response.data;
            setAdmins(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch admins', error);
            setAdmins([]);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const data = new FormData();
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('role', formData.role);
            if (avatar) {
                data.append('avatar', avatar);
            }

            await api.post('/auth/admin/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowAddForm(false);
            fetchAdmins();
            setFormData({ username: '', email: '', password: '', role: 'admin' });
            setAvatar(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add admin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAdminStatus = async (adminId: number) => {
        setTogglingId(adminId);
        try {
            await api.patch(`/users/${adminId}/toggle-status`);
            fetchAdmins();
        } catch (error) {
            console.error('Failed to toggle admin status', error);
            alert('Failed to update status');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDemoteAdmin = async () => {
        if (!selectedAdminId) return;
        setTogglingId(selectedAdminId);
        try {
            await api.patch(`/users/${selectedAdminId}/demote`);
            fetchAdmins();
            alert('Admin muvaffaqiyatli foydalanuvchiga aylantirildi');
        } catch (error) {
            console.error('Failed to demote admin', error);
            alert('Amalni bajarib bo\'lmadi');
        } finally {
            setTogglingId(null);
        }
    };

    const openDemoteConfirm = (id: number) => {
        setSelectedAdminId(id);
        setShowDemoteConfirm(true);
    };

    return (
        <div className="admin-admins-page" onClick={() => setShowRoleDropdown(false)}>
            <div className="admin-header">
                <h1 className="gradient-text"><Shield /> Admin Management</h1>
                <button className="add-btn gradient-bg" onClick={(e) => { e.stopPropagation(); setShowAddForm(!showAddForm); }}>
                    <UserPlus size={20} /> Add New Admin
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        className="add-form-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            className="add-form-container glass-morphism"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleAddAdmin}>
                                <h2 className="gradient-text">Register New Admin</h2>
                                {error && <div className="error-msg">{error}</div>}

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><User size={16} /> Username</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Mail size={16} /> Email</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="example@gmail.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Shield size={16} /> Password</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Shield size={16} /> Role</label>
                                        <div className="custom-dropdown">
                                            <div
                                                className={`dropdown-trigger ${showRoleDropdown ? 'open' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); setShowRoleDropdown(!showRoleDropdown); }}
                                            >
                                                <span>{formData.role === 'admin' ? 'Admin' : 'Super Admin'}</span>
                                                <ChevronDown size={18} className={`chevron ${showRoleDropdown ? 'rotated' : ''}`} />
                                            </div>
                                            <AnimatePresence>
                                                {showRoleDropdown && (
                                                    <motion.div
                                                        className="dropdown-options glass-morphism"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div
                                                            className={`option-item ${formData.role === 'admin' ? 'active' : ''}`}
                                                            onClick={() => { setFormData({ ...formData, role: 'admin' }); setShowRoleDropdown(false); }}
                                                        >
                                                            Admin
                                                        </div>
                                                        <div
                                                            className={`option-item ${formData.role === 'superadmin' ? 'active' : ''}`}
                                                            onClick={() => { setFormData({ ...formData, role: 'superadmin' }); setShowRoleDropdown(false); }}
                                                        >
                                                            Super Admin
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Avatar</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="file-input"
                                            onChange={e => e.target.files && setAvatar(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn gradient-bg" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Register Admin'}
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="admins-grid">
                {admins.map(admin => (
                    <motion.div
                        key={admin.id}
                        className={`admin-card glass-morphism ${!admin.isActive ? 'inactive' : ''}`}
                        whileHover={{ y: -5 }}
                    >
                        <div className="admin-status-indicator">
                            <div className={`status-dot ${admin.isActive ? 'active' : 'inactive'}`}></div>
                        </div>

                        <div className="admin-info">
                            <div className="admin-avatar">
                                {admin.avatarUrl ? (
                                    <img src={admin.avatarUrl.startsWith('http') ? admin.avatarUrl : `${API_BASE_URL}/uploads/${admin.avatarUrl}`} alt="" />
                                ) : (
                                    <User size={30} />
                                )}
                            </div>
                            <div className="admin-details">
                                <h3>{admin.username}</h3>
                                <p>{admin.email}</p>
                                <div className="badges-row">
                                    <span className={`badge ${admin.role}`}>{admin.role.toUpperCase()}</span>
                                    <span className={`status-badge ${admin.isActive ? 'active' : 'inactive'}`}>
                                        {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="admin-actions">
                            <button
                                className={`status-toggle-btn ${admin.isActive ? 'deactivate' : 'activate'}`}
                                onClick={() => toggleAdminStatus(admin.id)}
                                disabled={togglingId === admin.id}
                            >
                                {togglingId === admin.id ? <Loader2 className="animate-spin" size={16} /> : (admin.isActive ? 'Deactivate' : 'Activate')}
                            </button>
                            <button
                                className="icon-btn delete-btn"
                                title="Demote to User"
                                onClick={() => openDemoteConfirm(admin.id)}
                            >
                                <UserX size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .admin-admins-page {
                    padding: 120px 5% 50px;
                    min-height: 100vh;
                }
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .admin-header h1 {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    font-size: 2.2rem;
                }
                .add-btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    border: none;
                    color: white;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(229, 9, 20, 0.3);
                }
                
                .add-form-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                .add-form-container {
                    width: 100%;
                    max-width: 650px;
                    padding: 40px;
                    border-radius: 28px;
                    position: relative;
                }
                .add-form-container h2 {
                    margin-bottom: 30px;
                    text-align: center;
                    font-size: 1.8rem;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .form-group input {
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                }
                .form-group input:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(229, 9, 20, 0.1);
                }
                .form-group.full-width {
                    grid-column: span 2;
                }
                
                /* Custom Dropdown Styles */
                .custom-dropdown {
                    position: relative;
                }
                .dropdown-trigger {
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .dropdown-trigger:hover, .dropdown-trigger.open {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--primary);
                }
                .chevron {
                    transition: transform 0.3s;
                    color: var(--text-muted);
                }
                .chevron.rotated {
                    transform: rotate(180deg);
                    color: var(--primary);
                }
                .dropdown-options {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: #15161c;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    z-index: 10;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .option-item {
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--text-muted);
                }
                .option-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .option-item.active {
                    background: var(--primary);
                    color: white;
                    font-weight: 600;
                }

                .file-input {
                    padding: 10px !important;
                }
                .error-msg {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 14px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    text-align: center;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .form-actions {
                    margin-top: 35px;
                    display: flex;
                    gap: 15px;
                }
                .submit-btn {
                    flex: 2;
                    padding: 14px;
                    border-radius: 12px;
                    border: none;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(229, 9, 20, 0.3);
                }
                .cancel-btn {
                    flex: 1;
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .cancel-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .admins-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 30px;
                }
                .admin-card {
                    padding: 30px;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    border: 1px solid var(--glass-border);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .admin-card:hover {
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    transform: translateY(-5px);
                }
                .admin-info {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }
                .admin-avatar {
                    width: 70px;
                    height: 70px;
                    flex-shrink: 0;
                    border-radius: 20px;
                    background: var(--glass);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 2px solid var(--glass-border);
                }
                .admin-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .admin-details {
                    flex: 1;
                    min-width: 0;
                }
                .admin-details h3 {
                    margin-bottom: 5px;
                    font-size: 1.2rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .admin-details p {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .badges-row {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .admin-card.inactive {
                    opacity: 0.6;
                    filter: grayscale(0.8);
                }
                .status-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 3px 10px;
                    border-radius: 6px;
                    letter-spacing: 0.5px;
                }
                .status-badge.active { color: #10b981; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
                .status-badge.inactive { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
                
                .admin-status-indicator {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                }
                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .status-dot.active { background: #10b981; box-shadow: 0 0 15px #10b981; }
                .status-dot.inactive { background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
                
                .admin-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding-top: 15px;
                    border-top: 1px solid var(--glass-border);
                    margin-top: auto;
                }
                .status-toggle-btn {
                    flex: 1;
                    padding: 10px 15px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-toggle-btn.deactivate {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.2);
                }
                .status-toggle-btn.deactivate:hover {
                    background: #ef4444;
                    color: white;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                }
                .status-toggle-btn.activate {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border-color: rgba(16, 185, 129, 0.2);
                }
                .status-toggle-btn.activate:hover {
                    background: #10b981;
                    color: white;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                }
                .delete-btn {
                    width: 42px;
                    height: 42px;
                    flex-shrink: 0;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    color: #ef4444;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: #ef4444;
                    transform: translateY(-2px);
                }
                .badge {
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }
                .badge.admin { background: rgba(75, 85, 99, 0.2); border: 1px solid rgba(75, 85, 99, 0.3); color: #d1d5db; }
                .badge.superadmin { background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .form-group.full-width {
                        grid-column: span 1;
                    }
                    .add-form-container {
                        padding: 30px 20px;
                    }
                }
            `}</style>
            <ConfirmModal
                isOpen={showDemoteConfirm}
                title="Adminni pastlatish"
                message="Haqiqatan ham ushbu adminni huquqlarini cheklab, oddiy foydalanuvchiga aylantirmoqchimisiz?"
                onConfirm={handleDemoteAdmin}
                onCancel={() => setShowDemoteConfirm(false)}
                confirmText="Tasdiqlash"
                cancelText="Bekor qilish"
            />
        </div>
    );
};

export default AdminAdmins;
