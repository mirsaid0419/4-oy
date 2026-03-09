import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Edit, X, Loader2, Tag, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/category');
            const data = response.data.data || response.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
            setCategories([]);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await api.post('/category', newCategory);
            setShowAddModal(false);
            fetchCategories();
            setNewCategory({ name: '', description: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kategoriya qo\'shishda xatolik yuz berdi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await api.patch(`/category/${editingCategory.id}`, {
                name: editingCategory.name,
                description: editingCategory.description,
            });
            setShowEditModal(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kategoriyani yangilashda xatolik yuz berdi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategoryId) return;
        setError('');
        try {
            await api.delete(`/category/${selectedCategoryId}`);
            fetchCategories();
            setShowDeleteConfirm(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kategoriyani o\'chirishda xatolik yuz berdi');
            setShowDeleteConfirm(false);
        }
    };

    const openEditModal = (category: any) => {
        setEditingCategory({ ...category });
        setError('');
        setShowEditModal(true);
    };

    const openDeleteConfirm = (id: number) => {
        setSelectedCategoryId(id);
        setShowDeleteConfirm(true);
    };

    return (
        <div className="admin-categories-page">
            <div className="admin-header">
                <h1><Tag /> Manage Categories</h1>
                <button className="add-btn gradient-bg" onClick={() => { setShowAddModal(true); setError(''); }}>
                    <Plus size={20} /> Add New Category
                </button>
            </div>

            {error && !showAddModal && !showEditModal && <div className="error-msg">{error}</div>}

            {/* ADD CATEGORY MODAL */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            className="category-modal glass-morphism"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="modal-header-left">
                                    <div className="modal-icon-wrap"><Tag size={22} /></div>
                                    <div><h2 className="modal-title gradient-text">Yangi Kategoriya</h2><p className="modal-subtitle">Tizimga yangi janr qo'shish</p></div>
                                </div>
                                <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                            </div>

                            <form onSubmit={handleAddCategory}>
                                {error && <div className="error-msg">{error}</div>}
                                <div className="modal-form-body">
                                    <div className="modal-form-group">
                                        <label className="modal-label">Kategoriya nomi <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            className="modal-input"
                                            placeholder="Masalan: Jangari"
                                            value={newCategory.name}
                                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Tavsif</label>
                                        <textarea
                                            className="modal-input modal-textarea"
                                            placeholder="Kategoriya haqida qisqacha ma'lumot..."
                                            value={newCategory.description}
                                            onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Bekor qilish</button>
                                    <button type="submit" className="submit-btn gradient-bg" disabled={isSubmitting}>
                                        {isSubmitting ? <><Loader2 size={18} className="spin-icon" /> Yuklanmoqda...</> : <><Plus size={18} /> Qo'shish</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EDIT CATEGORY MODAL */}
            <AnimatePresence>
                {showEditModal && editingCategory && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            className="category-modal glass-morphism"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="modal-header-left">
                                    <div className="modal-icon-wrap edit-icon"><Edit size={22} /></div>
                                    <div><h2 className="modal-title gradient-text">Kategoriyani Tahrirlash</h2><p className="modal-subtitle">{editingCategory.name}</p></div>
                                </div>
                                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                            </div>

                            <form onSubmit={handleUpdateCategory}>
                                {error && <div className="error-msg">{error}</div>}
                                <div className="modal-form-body">
                                    <div className="modal-form-group">
                                        <label className="modal-label">Kategoriya nomi <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            className="modal-input"
                                            value={editingCategory.name}
                                            onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-form-group">
                                        <label className="modal-label">Tavsif</label>
                                        <textarea
                                            className="modal-input modal-textarea"
                                            value={editingCategory.description}
                                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Bekor qilish</button>
                                    <button type="submit" className="submit-btn gradient-bg" disabled={isSubmitting}>
                                        {isSubmitting ? <><Loader2 size={18} className="spin-icon" /> Saqlanmoqda...</> : <><Edit size={18} /> Saqlash</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="categories-table-container glass-morphism">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th><Hash size={14} /> ID</th>
                            <th>Nomi</th>
                            <th>Tavsif</th>
                            <th>Slug</th>
                            <th>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td className="id-cell">#{cat.id}</td>
                                <td><div className="cat-name-cell">{cat.name}</div></td>
                                <td><div className="cat-desc-cell">{cat.description || <span className="no-data">Tavsif yo'q</span>}</div></td>
                                <td><code className="slug-code">{cat.slug}</code></td>
                                <td>
                                    <div className="actions-wrapper">
                                        <button className="icon-btn edit-btn" onClick={() => openEditModal(cat)} title="Tahrirlash"><Edit size={16} /></button>
                                        <button className="icon-btn delete-btn" onClick={() => openDeleteConfirm(cat.id)} title="O'chirish"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .admin-categories-page { padding: 120px 5% 50px; min-height: 100vh; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .admin-header h1 { display: flex; align-items: center; gap: 15px; font-size: 2.2rem; }
                .add-btn { padding: 13px 26px; border-radius: 14px; border: none; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
                .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(229, 9, 20, 0.35); }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .category-modal { width: 100%; max-width: 500px; background: rgba(20, 20, 30, 0.95); border: 1px solid var(--glass-border); border-radius: 28px; overflow: hidden; }
                
                .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; border-bottom: 1px solid var(--glass-border); }
                .modal-header-left { display: flex; align-items: center; gap: 16px; }
                .modal-icon-wrap { width: 46px; height: 46px; border-radius: 14px; background: rgba(229,9,20,0.1); border: 1px solid rgba(229,9,20,0.2); display: flex; align-items: center; justify-content: center; color: var(--primary); }
                .modal-icon-wrap.edit-icon { color: #6366f1; background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.2); }
                .modal-title { font-size: 1.4rem; font-weight: 800; margin: 0; }
                .modal-subtitle { font-size: 0.82rem; color: var(--text-muted); margin: 4px 0 0; }
                .modal-close-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-muted); border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .modal-close-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

                .modal-form-body { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
                .modal-form-group { display: flex; flex-direction: column; gap: 8px; }
                .modal-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
                .modal-input { padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 12px; color: white; font-size: 0.95rem; outline: none; transition: 0.2s; width: 100%; }
                .modal-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(229,9,20,0.1); }
                .modal-textarea { min-height: 100px; resize: none; }
                .required { color: var(--primary); }

                .modal-footer { display: flex; gap: 16px; padding: 24px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid var(--glass-border); }
                .submit-btn { flex: 2; padding: 14px; border-radius: 12px; border: none; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .cancel-btn { flex: 1; padding: 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-muted); cursor: pointer; }
                
                .error-msg { margin: 32px 32px 0; background: rgba(239,68,68,0.1); color: #ef4444; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.2); font-size: 0.9rem; }
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .categories-table-container { background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid var(--glass-border); overflow: hidden; }
                .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
                .admin-table th { padding: 20px; background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
                .admin-table td { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }
                .id-cell { font-family: monospace; color: var(--primary); font-weight: 700; }
                .cat-name-cell { font-weight: 700; color: white; }
                .cat-desc-cell { color: var(--text-muted); font-size: 0.9rem; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .slug-code { background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; color: #6366f1; }
                .no-data { opacity: 0.4; font-style: italic; }

                .actions-wrapper { display: flex; gap: 8px; }
                .icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .edit-btn { color: #6366f1; } .edit-btn:hover { background: rgba(99,102,241,0.1); }
                .delete-btn { color: #ef4444; } .delete-btn:hover { background: rgba(239,68,68,0.1); }
            `}</style>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Kategoriyani o'chirish"
                message="Haqiqatan ham ushbu kategoriyani o'chirib tashlamoqchimisiz? Bu kategoriya bilan bog'liq filmlar kategoriyasiz qolishi mumkin."
                onConfirm={handleDeleteCategory}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="O'chirish"
                cancelText="Bekor qilish"
            />
        </div>
    );
};

export default AdminCategories;
