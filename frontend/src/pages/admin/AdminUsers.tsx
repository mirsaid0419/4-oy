import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../../services/api';
import { User, Trash2, Loader2, Search, UserCheck, UserX, Globe, Phone } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/all/users');
            const data = response.data.data || response.data;
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: number) => {
        setTogglingId(userId);
        try {
            await api.patch(`/users/${userId}/toggle-status`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to toggle status', error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUserId) return;
        try {
            await api.delete(`/users/${selectedUserId}`);
            fetchUsers();
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-users-page">
            <div className="admin-header">
                <h1 className="gradient-text"><User /> User Management</h1>
                <div className="search-bar glass-morphism">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin" size={48} />
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="users-table-container glass-morphism">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact & Location</th>
                                <th>Role</th>
                                <th>Joined At</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className={user.isDeleted ? 'row-deleted' : ''}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar-sm">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}/uploads/${user.avatarUrl}`} alt="" />
                                                ) : (
                                                    <User size={18} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="username">{user.username}</div>
                                                <div className="email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <div className="info-item"><Phone size={12} /> {user.profile?.phone || 'N/A'}</div>
                                            <div className="info-item"><Globe size={12} /> {user.profile?.country || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                            {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-wrapper">
                                            <button
                                                className={`icon-btn ${user.isActive ? 'status-btn-deactivate' : 'status-btn-activate'}`}
                                                title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                                onClick={() => handleToggleStatus(user.id)}
                                                disabled={togglingId === user.id}
                                            >
                                                {togglingId === user.id ? <Loader2 className="animate-spin" size={16} /> : (user.isActive ? <UserX size={18} /> : <UserCheck size={18} />)}
                                            </button>
                                            <button
                                                className="icon-btn delete-btn"
                                                title="Delete User"
                                                onClick={() => { setSelectedUserId(user.id); setShowDeleteConfirm(true); }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="no-data">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .admin-users-page { padding: 120px 5% 50px; min-height: 100vh; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; gap: 20px; }
                .admin-header h1 { display: flex; align-items: center; gap: 15px; font-size: 2.2rem; flex-shrink: 0; }
                
                .search-bar { display: flex; align-items: center; gap: 15px; padding: 10px 20px; border-radius: 12px; width: 100%; max-width: 400px; }
                .search-bar input { background: none; border: none; color: white; outline: none; width: 100%; font-size: 1rem; }
                
                .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; gap: 20px; color: var(--text-muted); }
                
                .users-table-container { border-radius: 24px; overflow: hidden; border: 1px solid var(--glass-border); }
                .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
                .admin-table th { padding: 20px; background: rgba(255, 255, 255, 0.04); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
                .admin-table td { padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 0.95rem; }
                
                .user-info-cell { display: flex; align-items: center; gap: 15px; }
                .user-avatar-sm { width: 40px; height: 40px; border-radius: 10px; background: var(--glass); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--glass-border); flex-shrink: 0; }
                .user-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
                
                .username { font-weight: 700; color: white; }
                .email { font-size: 0.8rem; color: var(--text-muted); }
                
                .contact-info { display: flex; flex-direction: column; gap: 4px; }
                .info-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); }
                
                .role-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
                .role-badge.user { background: rgba(75, 85, 99, 0.2); color: #9ca3af; }
                
                .status-badge { font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 6px; }
                .status-badge.active { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                .status-badge.inactive { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                
                .actions-wrapper { display: flex; gap: 10px; }
                .icon-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: var(--text-muted); }
                .status-btn-activate:hover { color: #10b981; border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
                .status-btn-deactivate:hover { color: #f59e0b; border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
                .delete-btn:hover { color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                
                .no-data { text-align: center; padding: 40px !important; color: var(--text-muted); }
                .row-deleted { opacity: 0.5; filter: grayscale(1); }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 992px) {
                    .admin-header { flex-direction: column; align-items: stretch; }
                    .search-bar { max-width: none; }
                }
            `}</style>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Userni o'chirish"
                message="Haqiqatan ham ushbu foydalanuvchini o'chirmoqchimisiz? Bu unga kirishni butunlay cheklaydi."
                onConfirm={handleDeleteUser}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="O'chirish"
                cancelText="Bekor qilish"
            />
        </div>
    );
};

export default AdminUsers;
