import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Plus, Trash2, Package, Tag, Clock,
    CheckCircle, Loader2, Save,
    Edit3, Layers, ChevronDown, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';

interface Plan {
    id: number;
    name: string;
    price: number;
    durationDays: number;
    description?: string;
    subscriptionType: 'free' | 'premium';
    isActive: boolean;
}

const AdminSubscriptions: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        id: null as number | null,
        name: '',
        price: '',
        durationDays: '30',
        subscriptionType: 'premium' as 'free' | 'premium',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await api.get('/subscription-plan');
            const data = response.data.data || response.data;
            setPlans(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch plans', error);
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormData({
            id: null,
            name: '',
            price: '',
            durationDays: '30',
            subscriptionType: 'premium',
            description: '',
            isActive: true
        });
        setIsEditing(false);
        setShowForm(true);
        setError('');
    };

    const handleOpenEdit = (plan: Plan) => {
        setFormData({
            id: plan.id,
            name: plan.name,
            price: String(plan.price),
            durationDays: String(plan.durationDays),
            subscriptionType: plan.subscriptionType,
            description: plan.description || '',
            isActive: plan.isActive
        });
        setIsEditing(true);
        setShowForm(true);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                name: formData.name,
                price: formData.subscriptionType === 'free' ? 0 : Number(formData.price),
                durationDays: Number(formData.durationDays),
                subscriptionType: formData.subscriptionType,
                description: formData.description,
                isActive: formData.isActive
            };

            if (isEditing && formData.id) {
                await api.patch(`/subscription-plan/${formData.id}`, payload);
            } else {
                await api.post('/subscription-plan', payload);
            }

            setShowForm(false);
            fetchPlans();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Action failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePlanStatus = async (plan: Plan) => {
        try {
            await api.patch(`/subscription-plan/${plan.id}`, { isActive: !plan.isActive });
            setPlans(plans.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p));
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const handlePlanDelete = async () => {
        if (!selectedPlanId) return;
        try {
            await api.delete(`/subscription-plan/${selectedPlanId}`);
            setPlans(plans.filter(p => p.id !== selectedPlanId));
        } catch (error) {
            console.error('Failed to delete plan', error);
            alert('Tarif o\'chirilmadi. Balki u foydalanuvchilar tomonidan foydalanilayotgan bo\'lishi mumkin.');
        }
    };

    const openDeleteConfirm = (id: number) => {
        setSelectedPlanId(id);
        setShowDeleteConfirm(true);
    };

    return (
        <div className="admin-plans-page" onClick={() => setShowTypeDropdown(false)}>
            <header className="admin-header">
                <h1 className="gradient-text"><Package /> Subscription Management</h1>
                <button className="add-btn gradient-bg" onClick={handleOpenAdd}>
                    <Plus size={20} /> New Plan
                </button>
            </header>

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin" size={48} />
                </div>
            ) : (
                <div className="plans-grid">
                    {plans.map(plan => (
                        <motion.div
                            key={plan.id}
                            className={`plan-card glass-morphism ${!plan.isActive ? 'inactive' : ''}`}
                            whileHover={{ y: -5 }}
                        >
                            <div className="card-status">
                                <div className={`status-dot ${plan.isActive ? 'active' : 'off'}`}></div>
                                <span>{plan.isActive ? 'Active' : 'Disabled'}</span>
                            </div>

                            <div className="plan-main">
                                <div className="plan-icon">
                                    {plan.subscriptionType === 'free' ? <CheckCircle size={24} /> : <Layers size={24} />}
                                </div>
                                <div className="plan-content">
                                    <h3>{plan.name}</h3>
                                    <div className="plan-pricing">
                                        <span className="price">
                                            {plan.subscriptionType === 'free' ? 'FREE' : `$${Number(plan.price)}`}
                                        </span>
                                        <span className="duration">/ {plan.durationDays} days</span>
                                    </div>
                                    <p className="description">{plan.description || 'No description provided'}</p>
                                </div>
                            </div>

                            <div className="plan-actions">
                                <button className="action-btn edit" onClick={() => handleOpenEdit(plan)}>
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    className={`action-btn toggle ${plan.isActive ? 'on' : 'off'}`}
                                    onClick={() => togglePlanStatus(plan)}
                                >
                                    <Activity size={18} />
                                </button>
                                <button className="action-btn delete" onClick={() => openDeleteConfirm(plan.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {plans.length === 0 && (
                        <div className="empty-state">
                            <Package size={48} />
                            <p>No subscription plans found.</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {showForm && (
                    <div className="form-overlay" onClick={() => setShowForm(false)}>
                        <motion.div
                            className="form-container glass-morphism"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="gradient-text">{isEditing ? 'Edit Plan' : 'Create New Plan'}</h2>
                            {error && <div className="error-box">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group full">
                                        <label><Tag size={16} /> Plan Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Premium Monthly"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><Layers size={16} /> Plan Type</label>
                                        <div className="custom-dropdown">
                                            <div
                                                className={`dropdown-btn ${showTypeDropdown ? 'open' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); setShowTypeDropdown(!showTypeDropdown); }}
                                            >
                                                <span>{formData.subscriptionType.toUpperCase()}</span>
                                                <ChevronDown size={18} className={`chevron ${showTypeDropdown ? 'up' : ''}`} />
                                            </div>
                                            <AnimatePresence>
                                                {showTypeDropdown && (
                                                    <motion.div
                                                        className="dropdown-list glass-morphism"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                    >
                                                        <div
                                                            className={`item ${formData.subscriptionType === 'premium' ? 'active' : ''}`}
                                                            onClick={() => setFormData({ ...formData, subscriptionType: 'premium', price: formData.price === '0' ? '' : formData.price })}
                                                        >
                                                            PREMIUM
                                                        </div>
                                                        <div
                                                            className={`item ${formData.subscriptionType === 'free' ? 'active' : ''}`}
                                                            onClick={() => setFormData({ ...formData, subscriptionType: 'free', price: '0' })}
                                                        >
                                                            FREE
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label><Tag size={16} /> Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            disabled={formData.subscriptionType === 'free'}
                                            placeholder="9.99"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><Clock size={16} /> Duration (Days)</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="30"
                                            value={formData.durationDays}
                                            onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><Activity size={16} /> Status</label>
                                        <div className="toggle-switch" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                            <div className={`switch-track ${formData.isActive ? 'active' : ''}`}>
                                                <div className="switch-thumb"></div>
                                            </div>
                                            <span>{formData.isActive ? 'Active' : 'Hidden'}</span>
                                        </div>
                                    </div>

                                    <div className="form-group full">
                                        <label>Description</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Describe what users get with this plan..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="submit-btn gradient-bg" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> {isEditing ? 'Update Plan' : 'Create Plan'}</>}
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .admin-plans-page {
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
                    transition: transform 0.2s;
                }
                .add-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(229, 9, 20, 0.3); }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 25px;
                }
                .plan-card {
                    padding: 30px;
                    border-radius: 28px;
                    border: 1px solid var(--glass-border);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    transition: all 0.3s;
                    position: relative;
                }
                .plan-card.inactive { opacity: 0.6; grayscale: 0.8; }
                .plan-card:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.03); }

                .card-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; }
                .status-dot.active { background: #10b981; box-shadow: 0 0 10px #10b981; }
                .status-dot.off { background: #ef4444; }

                .plan-main {
                    display: flex;
                    gap: 20px;
                    align-items: flex-start;
                }
                .plan-icon {
                    width: 54px;
                    height: 54px;
                    background: rgba(229, 9, 20, 0.1);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    flex-shrink: 0;
                }
                .plan-content h3 { font-size: 1.4rem; margin-bottom: 5px; font-weight: 800; }
                .plan-pricing { display: flex; align-items: baseline; gap: 5px; margin-bottom: 12px; }
                .price { font-size: 1.8rem; font-weight: 900; color: white; }
                .duration { color: var(--text-muted); font-size: 0.9rem; font-weight: 600; }
                .description { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }

                .plan-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: auto;
                    padding-top: 20px;
                    border-top: 1px solid var(--glass-border);
                }
                .action-btn {
                    flex: 1;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    color: var(--text-muted);
                }
                .action-btn:hover { color: white; background: rgba(255,255,255,0.1); }
                .action-btn.edit:hover { border-color: #6366f1; color: #6366f1; }
                .action-btn.toggle.on:hover { border-color: #10b981; color: #10b981; }
                .action-btn.toggle.off:hover { border-color: #f59e0b; color: #f59e0b; }
                .action-btn.delete:hover { border-color: #ef4444; color: #ef4444; }

                /* Form Styles */
                .form-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(10px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .form-container {
                    width: 100%;
                    max-width: 600px;
                    padding: 40px;
                    border-radius: 32px;
                }
                .form-container h2 { text-align: center; margin-bottom: 30px; font-size: 1.8rem; font-weight: 900; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group.full { grid-column: span 2; }
                .form-group label { font-size: 0.85rem; color: var(--text-muted); font-weight: 700; display: flex; align-items: center; gap: 8px; }
                
                .form-group input, .form-group textarea {
                    padding: 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .form-group input:focus, .form-group textarea:focus { border-color: var(--primary); }
                
                /* Custom Dropdown in Form */
                .custom-dropdown { position: relative; }
                .dropdown-btn {
                    padding: 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }
                .dropdown-btn.open { border-color: var(--primary); }
                .chevron { transition: transform 0.3s; color: var(--text-muted); }
                .chevron.up { transform: rotate(180deg); color: var(--primary); }
                
                .dropdown-list {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0; right: 0;
                    background: #1a1b23;
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    z-index: 10;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                .dropdown-list .item {
                    padding: 12px 16px;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .dropdown-list .item:hover { background: rgba(255,255,255,0.05); color: white; }
                .dropdown-list .item.active { background: var(--primary); color: white; }

                /* Toggle Switch */
                .toggle-switch {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }
                .switch-track {
                    width: 48px;
                    height: 24px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 20px;
                    position: relative;
                    transition: background 0.3s;
                    border: 1px solid var(--glass-border);
                }
                .switch-track.active { background: #10b981; border-color: transparent; }
                .switch-thumb {
                    width: 18px;
                    height: 18px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 3px;
                    transform: translateY(-50%);
                    transition: left 0.3s;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                .switch-track.active .switch-thumb { left: calc(100% - 21px); }
                .toggle-switch span { font-size: 0.9rem; font-weight: 600; color: white; }

                .form-actions {
                    margin-top: 35px;
                    display: flex;
                    gap: 15px;
                }
                .submit-btn {
                    flex: 2;
                    padding: 16px;
                    border-radius: 14px;
                    border: none;
                    color: white;
                    font-weight: 800;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .cancel-btn {
                    flex: 1;
                    padding: 16px;
                    border-radius: 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                }

                .error-box {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 14px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    text-align: center;
                    font-size: 0.9rem;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .loading-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 100px 0;
                    color: var(--text-muted);
                    gap: 15px;
                }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                @media (max-width: 600px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .form-group.full { grid-column: auto; }
                }
            `}</style>
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Tarifni o'chirish"
                message="Haqiqatan ham ushbu obuna tarifini tizimdan o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
                onConfirm={handlePlanDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="O'chirish"
                cancelText="Bekor qilish"
            />
        </div>
    );
};

export default AdminSubscriptions;
