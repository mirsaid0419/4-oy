import React, { useEffect, useState, useRef } from 'react';
import api, { API_BASE_URL } from '../../services/api';
import { Plus, Trash2, Film, Edit, Upload, X, Image, Loader2, Star, Video, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';

const AdminMovies: React.FC = () => {
    const [movies, setMovies] = useState<any[]>([]);
    const [showAddMovie, setShowAddMovie] = useState(false);
    const [showEditMovie, setShowEditMovie] = useState(false);
    const [editingMovie, setEditingMovie] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [editPosterPreview, setEditPosterPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const [newMovie, setNewMovie] = useState({
        title: '',
        description: '',
        releaseYear: new Date().getFullYear(),
        durationMinutes: 120,
        subscriptionType: 'free',
        categoryIdsRaw: '',
        quality: 'p720' as 'p240' | 'p360' | 'p480' | 'p720' | 'p1080' | 'p4K',
        language: 'uz'
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [poster, setPoster] = useState<File | null>(null);
    const [video, setVideo] = useState<File | null>(null);

    useEffect(() => {
        fetchMovies();
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

    const fetchMovies = async () => {
        try {
            const response = await api.get('/movie');
            const data = response.data.data || response.data;
            setMovies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch movies', error);
            setMovies([]);
        }
    };

    const handlePosterChange = (file: File | null, isEdit = false) => {
        if (!file) return;
        if (isEdit) {
            setPoster(file);
            setEditPosterPreview(URL.createObjectURL(file));
        } else {
            setPoster(file);
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const handleVideoChange = (file: File | null) => {
        if (!file) return;
        setVideo(file);
    };

    const handleDrop = (e: React.DragEvent, isEdit = false) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handlePosterChange(file, isEdit);
        }
    };

    const handleAddMovie = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('title', newMovie.title);
            formData.append('description', newMovie.description);
            formData.append('releaseYear', newMovie.releaseYear.toString());
            formData.append('durationMinutes', newMovie.durationMinutes.toString());
            formData.append('subscriptionType', newMovie.subscriptionType);
            formData.append('quality', newMovie.quality);
            formData.append('language', newMovie.language);

            const categoryIds = newMovie.categoryIdsRaw.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            categoryIds.forEach(id => formData.append('categoryIds', id.toString()));

            if (poster) formData.append('poster', poster);
            if (video) formData.append('video', video);

            await api.post('/movie', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowAddMovie(false);
            fetchMovies();
            resetAddForm();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kino qo\'shishda xatolik yuz berdi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateMovie = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('title', editingMovie.title);
            formData.append('description', editingMovie.description);
            formData.append('releaseYear', editingMovie.releaseYear.toString());
            formData.append('durationMinutes', editingMovie.durationMinutes.toString());
            formData.append('subscriptionType', editingMovie.subscriptionType);

            const categoryIds = editingMovie.categoryIdsRaw.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
            categoryIds.forEach((id: number) => formData.append('categoryIds', id.toString()));

            if (poster) formData.append('poster', poster);

            await api.patch(`/movie/${editingMovie.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowEditMovie(false);
            setEditingMovie(null);
            setPoster(null);
            setEditPosterPreview(null);
            fetchMovies();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kinoni yangilashda xatolik yuz berdi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (movie: any) => {
        const catIds = movie.categories ? movie.categories.map((c: any) => c.categoryId).join(', ') : '';
        setEditingMovie({ ...movie, categoryIdsRaw: catIds });
        setEditPosterPreview(movie.posterUrl || null);
        setPoster(null);
        setError('');
        setShowEditMovie(true);
    };

    const resetAddForm = () => {
        setNewMovie({
            title: '',
            description: '',
            releaseYear: new Date().getFullYear(),
            durationMinutes: 120,
            subscriptionType: 'free',
            categoryIdsRaw: '',
            quality: 'p720',
            language: 'uz'
        });
        setPoster(null);
        setVideo(null);
        setPosterPreview(null);
        setError('');
    };

    const toggleCategory = (id: number, isEdit = false) => {
        const movie = isEdit ? editingMovie : newMovie;
        const setMovie = isEdit ? setEditingMovie : setNewMovie;

        let ids = movie.categoryIdsRaw.split(',').map((id: string) => id.trim()).filter((id: string) => id !== '');
        const idStr = id.toString();

        if (ids.includes(idStr)) {
            ids = ids.filter((i: string) => i !== idStr);
        } else {
            ids.push(idStr);
        }

        setMovie({ ...movie, categoryIdsRaw: ids.join(',') });
    };

    const handleDeleteMovie = async () => {
        if (!selectedMovieId) return;
        try {
            await api.delete(`/movie/${selectedMovieId}`);
            fetchMovies();
        } catch (error) {
            console.error('Failed to delete movie', error);
        }
    };

    const openDeleteConfirm = (id: number) => {
        setSelectedMovieId(id);
        setShowDeleteConfirm(true);
    };

    return (
        <div className="admin-movies-page">
            <div className="admin-header">
                <h1><Film /> Manage Movies</h1>
                <button className="add-btn gradient-bg" onClick={() => { resetAddForm(); setShowAddMovie(true); }}>
                    <Plus size={20} /> Add New Movie
                </button>
            </div>

            {/* ADD MOVIE MODAL */}
            <AnimatePresence>
                {showAddMovie && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddMovie(false)}
                    >
                        <motion.div
                            className="movie-modal glass-morphism"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="modal-header-left">
                                    <div className="modal-icon-wrap">
                                        <Film size={22} />
                                    </div>
                                    <div>
                                        <h2 className="modal-title gradient-text">Yangi Kino Qo'shish</h2>
                                        <p className="modal-subtitle">Cloudinary'ga yuklanadi (Poster + Video)</p>
                                    </div>
                                </div>
                                <button className="modal-close-btn" onClick={() => setShowAddMovie(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddMovie}>
                                {error && <div className="error-msg">{error}</div>}
                                <div className="modal-form-grid">
                                    <div className="media-upload-col">
                                        <label className="modal-label">Poster</label>
                                        <div
                                            className={`poster-drop-zone ${isDragging ? 'dragging' : ''} ${posterPreview ? 'has-preview' : ''}`}
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={(e) => handleDrop(e, false)}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {posterPreview ? (
                                                <>
                                                    <img src={posterPreview} alt="Poster" className="poster-preview-img" />
                                                    <div className="poster-overlay"><Upload size={24} /><span>O'zgartirish</span></div>
                                                </>
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <div className="upload-icon-wrap"><Image size={32} /></div>
                                                    <p className="upload-title">Poster yuklash</p>
                                                </div>
                                            )}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handlePosterChange(e.target.files[0], false)} />

                                        <div className="video-upload-section">
                                            <label className="modal-label">Video Fayli</label>
                                            <div className={`video-drop-zone ${video ? 'has-video' : ''}`} onClick={() => videoInputRef.current?.click()}>
                                                {video ? (
                                                    <div className="video-selected-info">
                                                        <CheckCircle2 size={24} className="success-icon" />
                                                        <div className="video-text">
                                                            <p className="video-filename">{video.name}</p>
                                                            <p className="video-size">{(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                        </div>
                                                        <button type="button" className="remove-video-btn" onClick={(e) => { e.stopPropagation(); setVideo(null); }}><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="video-placeholder"><Video size={24} /><span>Video tanlash</span></div>
                                                )}
                                            </div>
                                            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && handleVideoChange(e.target.files[0])} />
                                        </div>

                                        <div className="sub-type-selector">
                                            <label className="modal-label">Obuna turi</label>
                                            <div className="sub-toggle-row">
                                                <button type="button" className={`sub-toggle-btn ${newMovie.subscriptionType === 'free' ? 'active-free' : ''}`} onClick={() => setNewMovie({ ...newMovie, subscriptionType: 'free' })}>Free</button>
                                                <button type="button" className={`sub-toggle-btn ${newMovie.subscriptionType === 'premium' ? 'active-premium' : ''}`} onClick={() => setNewMovie({ ...newMovie, subscriptionType: 'premium' })}><Star size={13} /> Premium</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="fields-col">
                                        <div className="modal-form-group">
                                            <label className="modal-label">Kino nomi <span className="required">*</span></label>
                                            <input type="text" required className="modal-input" value={newMovie.title} onChange={e => setNewMovie({ ...newMovie, title: e.target.value })} />
                                        </div>
                                        <div className="modal-form-row">
                                            <div className="modal-form-group">
                                                <label className="modal-label">Yil <span className="required">*</span></label>
                                                <input type="number" required className="modal-input" value={newMovie.releaseYear} onChange={e => setNewMovie({ ...newMovie, releaseYear: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <div className="modal-form-group">
                                                <label className="modal-label">Davomiylik (min) <span className="required">*</span></label>
                                                <input type="number" required className="modal-input" value={newMovie.durationMinutes} onChange={e => setNewMovie({ ...newMovie, durationMinutes: parseInt(e.target.value) || 0 })} />
                                            </div>
                                        </div>

                                        <div className="modal-form-group">
                                            <label className="modal-label">Sifat (Quality)</label>
                                            <div className="quality-chips">
                                                {(['p240', 'p360', 'p480', 'p720', 'p1080', 'p4K'] as const).map(q => (
                                                    <button key={q} type="button" className={`quality-chip ${newMovie.quality === q ? 'active' : ''}`} onClick={() => setNewMovie({ ...newMovie, quality: q })}>
                                                        {q.replace('p', '')}{q === 'p4K' ? '' : 'p'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="modal-form-group">
                                            <label className="modal-label">Til (Language)</label>
                                            <input type="text" className="modal-input" value={newMovie.language} onChange={e => setNewMovie({ ...newMovie, language: e.target.value })} />
                                        </div>

                                        <div className="modal-form-group">
                                            <label className="modal-label">Tavsif</label>
                                            <textarea className="modal-input modal-textarea" value={newMovie.description} onChange={e => setNewMovie({ ...newMovie, description: e.target.value })} />
                                        </div>

                                        <div className="modal-form-group">
                                            <label className="modal-label">Kategoriyalar <span className="required">*</span></label>
                                            <div className="category-selection-area">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        className={`category-chip-btn ${newMovie.categoryIdsRaw.split(',').includes(cat.id.toString()) ? 'active' : ''}`}
                                                        onClick={() => toggleCategory(cat.id, false)}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                                {categories.length === 0 && <p className="no-data">Kategoriyalar topilmadi</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddMovie(false)}>Bekor qilish</button>
                                    <button type="submit" className="submit-btn gradient-bg" disabled={isSubmitting}>
                                        {isSubmitting ? <><Loader2 size={18} className="spin-icon" /> Yuklanmoqda...</> : <><Plus size={18} /> Kino Qo'shish</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EDIT MOVIE MODAL */}
            <AnimatePresence>
                {showEditMovie && editingMovie && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowEditMovie(false); setEditingMovie(null); setPoster(null); setEditPosterPreview(null); }}
                    >
                        <motion.div
                            className="movie-modal glass-morphism"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="modal-header-left">
                                    <div className="modal-icon-wrap edit-icon"><Edit size={22} /></div>
                                    <div><h2 className="modal-title gradient-text">Kinoni Tahrirlash</h2><p className="modal-subtitle">{editingMovie.title}</p></div>
                                </div>
                                <button className="modal-close-btn" onClick={() => { setShowEditMovie(false); setEditingMovie(null); setPoster(null); setEditPosterPreview(null); }}><X size={20} /></button>
                            </div>

                            <form onSubmit={handleUpdateMovie}>
                                {error && <div className="error-msg">{error}</div>}
                                <div className="modal-form-grid">
                                    <div className="media-upload-col">
                                        <label className="modal-label">Poster</label>
                                        <div
                                            className={`poster-drop-zone ${isDragging ? 'dragging' : ''} ${editPosterPreview ? 'has-preview' : ''}`}
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={(e) => handleDrop(e, true)}
                                            onClick={() => editFileInputRef.current?.click()}
                                        >
                                            {editPosterPreview ? (
                                                <>
                                                    <img src={editPosterPreview} alt="Poster" className="poster-preview-img" />
                                                    <div className="poster-overlay"><Upload size={24} /><span>O'zgartirish</span></div>
                                                </>
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <div className="upload-icon-wrap"><Image size={32} /></div>
                                                    <p className="upload-title">Poster yuklash</p>
                                                </div>
                                            )}
                                        </div>
                                        <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handlePosterChange(e.target.files[0], true)} />

                                        <div className="sub-type-selector">
                                            <label className="modal-label">Obuna turi</label>
                                            <div className="sub-toggle-row">
                                                <button type="button" className={`sub-toggle-btn ${editingMovie.subscriptionType === 'free' ? 'active-free' : ''}`} onClick={() => setEditingMovie({ ...editingMovie, subscriptionType: 'free' })}>Free</button>
                                                <button type="button" className={`sub-toggle-btn ${editingMovie.subscriptionType === 'premium' ? 'active-premium' : ''}`} onClick={() => setEditingMovie({ ...editingMovie, subscriptionType: 'premium' })}><Star size={13} /> Premium</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="fields-col">
                                        <div className="modal-form-group">
                                            <label className="modal-label">Kino nomi <span className="required">*</span></label>
                                            <input type="text" required className="modal-input" value={editingMovie.title} onChange={e => setEditingMovie({ ...editingMovie, title: e.target.value })} />
                                        </div>
                                        <div className="modal-form-row">
                                            <div className="modal-form-group">
                                                <label className="modal-label">Yil <span className="required">*</span></label>
                                                <input type="number" required className="modal-input" value={editingMovie.releaseYear} onChange={e => setEditingMovie({ ...editingMovie, releaseYear: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <div className="modal-form-group">
                                                <label className="modal-label">Davomiylik (min) <span className="required">*</span></label>
                                                <input type="number" required className="modal-input" value={editingMovie.durationMinutes} onChange={e => setEditingMovie({ ...editingMovie, durationMinutes: parseInt(e.target.value) || 0 })} />
                                            </div>
                                        </div>
                                        <div className="modal-form-group">
                                            <label className="modal-label">Kategoriyalar <span className="required">*</span></label>
                                            <div className="category-selection-area">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        className={`category-chip-btn ${editingMovie.categoryIdsRaw.split(',').includes(cat.id.toString()) ? 'active' : ''}`}
                                                        onClick={() => toggleCategory(cat.id, true)}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                                {categories.length === 0 && <p className="no-data">Kategoriyalar topilmadi</p>}
                                            </div>
                                        </div>
                                        <div className="modal-form-group">
                                            <label className="modal-label">Tavsif</label>
                                            <textarea className="modal-input modal-textarea" value={editingMovie.description} onChange={e => setEditingMovie({ ...editingMovie, description: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="cancel-btn" onClick={() => { setShowEditMovie(false); setEditingMovie(null); setPoster(null); setEditPosterPreview(null); }}>Bekor qilish</button>
                                    <button type="submit" className="submit-btn gradient-bg" disabled={isSubmitting}>
                                        {isSubmitting ? <><Loader2 size={18} className="spin-icon" /> Saqlanmoqda...</> : <><Edit size={18} /> Saqlash</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="movies-table-container glass-morphism">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Poster</th><th>Kino nomi</th><th>Tavsif</th><th>Kategoriyalar</th><th>Yil</th><th>Status</th><th>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movies.map(movie => (
                            <tr key={movie.id}>
                                <td className="id-cell">#{movie.id}</td>
                                <td><img src={movie.posterUrl ? (movie.posterUrl.startsWith('http') ? movie.posterUrl : `${API_BASE_URL}/uploads/movies/${movie.posterUrl}`) : 'https://via.placeholder.com/50x70/1a1a2e/6366f1?text=🎬'} className="table-thumb" alt="" /></td>
                                <td><div className="movie-title-text" title={movie.title}>{movie.title}</div></td>
                                <td><div className="movie-description-text" title={movie.description}>{movie.description || 'Tavsif yo\'q'}</div></td>
                                <td>
                                    <div className="categories-wrapper">
                                        {movie.categories?.length > 0 ? movie.categories.map((cat: any) => (<span key={cat.categoryId} className="category-chip">{cat.category?.name || 'Category'}</span>)) : <span className="no-data">Yo'q</span>}
                                    </div>
                                </td>
                                <td><span className="year-text">{movie.releaseYear}</span></td>
                                <td><span className={`badge ${movie.subscriptionType}`}>{movie.subscriptionType === 'premium' ? '⭐ PREMIUM' : 'FREE'}</span></td>
                                <td>
                                    <div className="actions-wrapper">
                                        <button className="icon-btn edit-btn" onClick={() => openEditModal(movie)} title="Tahrirlash"><Edit size={16} /></button>
                                        <button className="icon-btn delete-btn" onClick={() => openDeleteConfirm(movie.id)} title="O'chirish"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .admin-movies-page { padding: 120px 5% 50px; min-height: 100vh; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .admin-header h1 { display: flex; align-items: center; gap: 15px; font-size: 2.2rem; }
                .add-btn { padding: 13px 26px; border-radius: 14px; border: none; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
                .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(229, 9, 20, 0.35); }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .movie-modal { width: 100%; max-width: 900px; background: rgba(20, 20, 30, 0.95); border: 1px solid var(--glass-border); border-radius: 28px; overflow: hidden; max-height: 95vh; overflow-y: auto; }
                
                .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; border-bottom: 1px solid var(--glass-border); }
                .modal-header-left { display: flex; align-items: center; gap: 16px; }
                .modal-icon-wrap { width: 46px; height: 46px; border-radius: 14px; background: rgba(229,9,20,0.1); border: 1px solid rgba(229,9,20,0.2); display: flex; align-items: center; justify-content: center; color: var(--primary); }
                .modal-icon-wrap.edit-icon { color: #6366f1; background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.2); }
                .modal-title { font-size: 1.4rem; font-weight: 800; margin: 0; }
                .modal-subtitle { font-size: 0.82rem; color: var(--text-muted); margin: 4px 0 0; }
                .modal-close-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-muted); border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .modal-close-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

                .modal-form-grid { display: grid; grid-template-columns: 260px 1fr; gap: 32px; padding: 32px; }
                @media (max-width: 768px) { .modal-form-grid { grid-template-columns: 1fr; } }

                .hidden { display: none; }
                .media-upload-col { display: flex; flex-direction: column; gap: 20px; }
                .poster-drop-zone { width: 100%; aspect-ratio: 2/3; border-radius: 16px; border: 2px dashed var(--glass-border); background: rgba(255,255,255,0.02); position: relative; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .poster-drop-zone:hover { border-color: var(--primary); background: rgba(229,9,20,0.05); }
                .poster-preview-img { width: 100%; height: 100%; object-fit: cover; }
                .poster-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: 0.3s; }
                .poster-drop-zone:hover .poster-overlay { opacity: 1; }
                .upload-placeholder { text-align: center; color: var(--text-muted); }
                .upload-icon-wrap { margin-bottom: 12px; color: var(--primary); }

                .video-upload-section { display: flex; flex-direction: column; gap: 10px; }
                .video-drop-zone { border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); border-radius: 12px; padding: 15px; cursor: pointer; transition: 0.2s; }
                .video-drop-zone:hover { background: rgba(255,255,255,0.06); }
                .video-placeholder { display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 0.9rem; }
                .video-selected-info { display: flex; align-items: center; gap: 12px; }
                .success-icon { color: #10b981; }
                .video-text { flex: 1; min-width: 0; }
                .video-filename { color: white; font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
                .video-size { color: var(--text-muted); font-size: 0.75rem; margin: 2px 0 0; }
                .remove-video-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
                .remove-video-btn:hover { color: #ef4444; }

                .sub-type-selector { display: flex; flex-direction: column; gap: 10px; }
                .sub-toggle-row { display: flex; gap: 8px; }
                .sub-toggle-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); color: var(--text-muted); font-weight: 700; cursor: pointer; transition: 0.2s; }
                .sub-toggle-btn.active-free { background: rgba(255,255,255,0.1); color: white; }
                .sub-toggle-btn.active-premium { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); color: #f59e0b; }

                .quality-chips { display: flex; flex-wrap: wrap; gap: 8px; }
                .quality-chip { padding: 8px 14px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .quality-chip:hover { background: rgba(255,255,255,0.06); }
                .quality-chip.active { background: var(--primary); border-color: var(--primary); color: white; }

                .category-selection-area { display: flex; flex-wrap: wrap; gap: 8px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; border: 1px solid var(--glass-border); }
                .category-chip-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .category-chip-btn:hover { border-color: rgba(255,255,255,0.2); }
                .category-chip-btn.active { background: rgba(99,102,241,0.1); border-color: #6366f1; color: #6366f1; }

                .fields-col { display: flex; flex-direction: column; gap: 20px; }
                .modal-form-group { display: flex; flex-direction: column; gap: 8px; }
                .modal-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .modal-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
                .modal-input { padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 12px; color: white; font-size: 0.95rem; outline: none; transition: 0.2s; width: 100%; }
                .modal-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(229,9,20,0.1); }
                .modal-textarea { min-height: 120px; resize: none; }
                
                .modal-footer { display: flex; gap: 16px; padding: 24px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid var(--glass-border); }
                .submit-btn { flex: 2; padding: 14px; border-radius: 12px; border: none; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .cancel-btn { flex: 1; padding: 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-muted); cursor: pointer; }
                
                .error-msg { margin: 32px 32px 0; background: rgba(239,68,68,0.1); color: #ef4444; padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(239,68,68,0.2); font-size: 0.9rem; }
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .movies-table-container { background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid var(--glass-border); overflow: hidden; }
                .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
                .admin-table th { padding: 20px; background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
                .admin-table td { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }
                .table-thumb { width: 44px; height: 60px; object-fit: cover; border-radius: 6px; }
                .movie-title-text { font-weight: 700; font-size: 0.95rem; }
                .movie-description-text { color: var(--text-muted); font-size: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .category-chip { padding: 4px 10px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.75rem; margin-right: 4px; }
                .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
                .badge.free { background: rgba(75, 85, 99, 0.2); color: #9ca3af; }
                .badge.premium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .actions-wrapper { display: flex; gap: 8px; }
                .icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .edit-btn { color: #6366f1; } .edit-btn:hover { background: rgba(99,102,241,0.1); }
                .delete-btn { color: #ef4444; } .delete-btn:hover { background: rgba(239,68,68,0.1); }
            `}</style>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Kino o'chirish"
                message="Haqiqatan ham ushbu kinoni tizimdan butkul o'chirib tashlamoqchimisiz? Ushbu amal ortga qaytmaydi."
                onConfirm={handleDeleteMovie}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="O'chirish"
                cancelText="Bekor qilish"
            />
        </div>
    );
};

export default AdminMovies;
