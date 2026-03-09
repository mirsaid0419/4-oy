import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';
import { User, Mail, Shield, History, Heart, Settings, Play, Camera, X, CheckCircle } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    fullName: user?.profile?.fullName || '',
    phone: user?.profile?.phone || '',
    country: user?.profile?.country || ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfileData = async () => {
    try {
      const [subRes, historyRes, favRes] = await Promise.all([
        api.get('/user-subscription/me'),
        api.get('/watch-history'),
        api.get('/favorite/my/all')
      ]);
      setSubscription(subRes.data.data);
      setWatchHistory(historyRes.data.data || []);
      setFavorites(favRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch profile data', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEditLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('email', editData.email);
      formData.append('fullName', editData.fullName);
      formData.append('phone', editData.phone);
      formData.append('country', editData.country);

      if (editData.password) formData.append('password', editData.password);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await api.patch(`/users/user/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUser(response.data.data);
        showToast('Profil muvaffaqiyatli yangilandi');
        setIsEditing(false);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profile-container">
        <header className="profile-header glass-morphism">
          <div className="profile-info-main">
            <div className="avatar-large">
              {user.avatarUrl ? (
                <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}/uploads/${user.avatarUrl}`} alt={user.username} />
              ) : (
                <User size={64} />
              )}
            </div>
            <div className="user-details">
              <h1>{user.profile?.fullName || user.username}</h1>
              <div className="user-sub-details">
                <p><Mail size={14} /> {user.email}</p>
                {user.username && user.profile?.fullName && <p className="username-tag">@{user.username}</p>}
                {user.profile?.country && <p><Shield size={14} /> {user.profile.country}</p>}
                {user.profile?.phone && <p className="phone-tag">{user.profile.phone}</p>}
              </div>
              <div className="role-badge">{user.role.toUpperCase()}</div>
            </div>
          </div>
          <button className="edit-btn glass-morphism" onClick={() => setIsEditing(true)}>
            <Settings size={20} /> Profilni tahrirlash
          </button>
        </header>

        {(!user.profile?.fullName || !user.profile?.phone) && (
          <div className="profile-completion-alert glass-morphism">
            <div className="alert-content">
              <Shield size={24} className="alert-icon" />
              <div>
                <h4>Profil ma'lumotlarini to'ldiring</h4>
                <p>Tizimda to'liq ishtirok etish va qulayliklar uchun profilni 100% to'ldiring.</p>
              </div>
            </div>
            <button className="complete-btn" onClick={() => setIsEditing(true)}>To'ldirish</button>
          </div>
        )}

        <div className="profile-grid">
          <div className="profile-sidebar">
            <section className="subscription-status glass-morphism">
              <div className="sidebar-section-header">
                <h3><Shield size={20} /> Obuna holati</h3>
              </div>

              {subscription ? (
                <div className="sub-active-card">
                  <div className="plan-pill">{subscription.plan.subscriptionType.toUpperCase()}</div>
                  <div className="sub-name">{subscription.plan.name}</div>
                  <div className="sub-price">{subscription.plan.price.toLocaleString()} so'm / oy</div>
                  <div className="sub-dates">
                    <p><span>Boshlanish:</span> {new Date(subscription.startDate).toLocaleDateString()}</p>
                    {subscription.endDate && (
                      <p><span>Tugash:</span> {new Date(subscription.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="active-badge"><CheckCircle size={14} /> ACTIVE</div>
                  <button className="upgrade-btn-small" onClick={() => navigate('/subscription')}>Rejani o'zgartirish</button>
                </div>
              ) : (
                <div className="sub-none-card">
                  <div className="promo-badge">PRO</div>
                  <div className="promo-icon"><Shield size={40} className="glow-icon" /></div>
                  <h4>Premiumga o'ting</h4>
                  <p>Eksklyuziv kinolar va reklamasiz ko'rish imkoniyatiga ega bo'ling!</p>
                  <button className="upgrade-cta-btn gradient-bg" onClick={() => navigate('/subscription')}>
                    Hoziroq boshlash
                  </button>
                </div>
              )}
            </section>
          </div>

          <div className="profile-main">
            <section className="tabs-content glass-morphism">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <History size={18} /> Ko'rilganlar
                </button>
                <button
                  className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
                  onClick={() => setActiveTab('favorites')}
                >
                  <Heart size={18} /> Sevimlilar
                </button>
              </div>

              <div className="tab-pane">
                {activeTab === 'history' ? (
                  <div className="history-list">
                    {watchHistory.length > 0 ? (
                      watchHistory.map((item: any) => (
                        <motion.div
                          key={item.id}
                          className="history-item"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => navigate(`/movie/${item.movieId}`)}
                        >
                          <div className="history-poster">
                            <img
                              src={item.movie?.posterUrl?.startsWith('http') ? item.movie.posterUrl : `${API_BASE_URL}/uploads/movies/${item.movie.posterUrl}`}
                              alt=""
                            />
                            <div className="play-overlay"><Play size={24} fill="white" /></div>
                            {item.movie?.durationMinutes && (
                              <div className="history-progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${Math.min(100, (item.watchedDuration / (item.movie.durationMinutes * 60)) * 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          <div className="item-details">
                            <h4>{item.movie?.title}</h4>
                            <div className="history-meta">
                              <p>Oxirgi ko'rilgan: {new Date(item.lastWatched || item.createdAt).toLocaleDateString()}</p>
                              {item.watchedDuration > 0 && (
                                <p className="duration-tag">{Math.floor(item.watchedDuration / 60)} min / {item.movie?.durationMinutes} min</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <History size={48} />
                        <p>Ko'rilgan videolar tarixi yo'q.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="favorites-pane">
                    {favorites.length > 0 ? (
                      <div className="favorites-grid-profile">
                        {favorites.map((fav: any) => (
                          <MovieCard key={fav.id} movie={fav.movie} />
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <Heart size={48} />
                        <p>Sevimlilar ro'yxati bo'sh.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="modal-overlay">
            <motion.div
              className="edit-modal glass-morphism"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Profilni tahrirlash</h2>
                <button className="close-btn" onClick={() => setIsEditing(false)}><X /></button>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="avatar-edit-section">
                  <div className="avatar-preview-wrapper" onClick={() => fileInputRef.current?.click()}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" />
                    ) : user.avatarUrl ? (
                      <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}/uploads/${user.avatarUrl}`} alt="" />
                    ) : (
                      <User size={40} />
                    )}
                    <div className="camera-icon"><Camera size={20} /></div>
                  </div>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <p>Rasmni o'zgartirish uchun bosing</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Foydalanuvchi nomi</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={e => setEditData({ ...editData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={e => setEditData({ ...editData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>To'liq ism</label>
                    <input
                      type="text"
                      placeholder="Ism sharifingiz"
                      value={editData.fullName}
                      onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefon</label>
                    <input
                      type="text"
                      placeholder="+998901234567"
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mamlakat</label>
                    <input
                      type="text"
                      placeholder="O'zbekiston"
                      value={editData.country}
                      onChange={e => setEditData({ ...editData, country: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Yangi parol (ixtiyoriy)</label>
                    <input
                      type="password"
                      placeholder="O'zgartirish uchun kiriting"
                      value={editData.password}
                      onChange={e => setEditData({ ...editData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Bekor qilish</button>
                  <button type="submit" className="save-btn gradient-bg" disabled={editLoading}>
                    {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .profile-page { padding: 120px 5% 60px; min-height: 100vh; max-width: 1400px; margin: 0 auto; }
        .toast-notification { position: fixed; top: 100px; right: 20px; padding: 15px 25px; border-radius: 12px; color: white; font-weight: 700; z-index: 10001; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .toast-notification.success { background: #10b981; }
        .toast-notification.error { background: #ef4444; }

        .profile-header { padding: 40px; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border: 1px solid var(--glass-border); }
        .profile-info-main { display: flex; align-items: center; gap: 30px; }
        .avatar-large { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 4px solid var(--primary); }
        .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
        .user-sub-details { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
        .user-sub-details p { color: var(--text-muted); font-size: 0.85rem; display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.03); padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .username-tag { color: var(--primary) !important; font-weight: 700; }
        .phone-tag { color: #fff !important; opacity: 0.8; }
        .role-badge { display: inline-block; padding: 5px 15px; background: var(--primary); color: white; border-radius: 30px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; }

        .profile-completion-alert { display: flex; align-items: center; justify-content: space-between; padding: 20px 30px; border-radius: 20px; margin-bottom: 30px; background: linear-gradient(90deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%); border-color: rgba(234, 179, 8, 0.3); }
        .alert-content { display: flex; align-items: center; gap: 20px; }
        .alert-icon { color: #eab308; filter: drop-shadow(0 0 10px rgba(234, 179, 8, 0.3)); }
        .alert-content h4 { font-size: 1.1rem; font-weight: 700; }
        .alert-content p { font-size: 0.85rem; color: var(--text-muted); }
        .complete-btn { padding: 10px 20px; background: #eab308; color: #000; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .complete-btn:hover { background: #facc15; transform: scale(1.05); box-shadow: 0 5px 15px rgba(234, 179, 8, 0.4); }

        .edit-btn { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .edit-btn:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

        .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 40px; align-items: start; }
        /* Subscription Section Styling */
        .subscription-status { padding: 30px; border-radius: 24px; position: relative; overflow: hidden; background: rgba(20, 20, 20, 0.4); border: 1px solid var(--glass-border); }
        .sidebar-section-header h3 { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; font-size: 1.2rem; color: #fff; font-weight: 700; }
        
        .sub-active-card { position: relative; background: rgba(229, 9, 20, 0.05); border-radius: 18px; padding: 25px; border: 1px solid rgba(229, 9, 20, 0.2); }
        .plan-pill { position: absolute; top: -12px; right: 20px; background: var(--primary); color: white; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 20px; box-shadow: 0 4px 10px rgba(229, 9, 20, 0.3); }
        .sub-name { font-size: 1.6rem; font-weight: 900; margin-bottom: 5px; color: var(--primary); }
        .sub-price { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 20px; opacity: 0.8; }
        .sub-dates { font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }
        .sub-dates span { color: #fff; opacity: 0.6; margin-right: 5px; }
        .active-badge { display: flex; align-items: center; gap: 6px; color: #10b981; font-weight: 800; font-size: 0.75rem; margin-bottom: 20px; background: rgba(16, 185, 129, 0.1); padding: 5px 12px; border-radius: 30px; width: fit-content; }
        .upgrade-btn-small { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03); color: white; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .upgrade-btn-small:hover { background: rgba(255,255,255,0.08); border-color: #fff; }

        /* Premium Promo Card (Empty State) */
        .sub-none-card { text-align: center; background: linear-gradient(135deg, rgba(20, 20, 20, 0.6) 0%, rgba(229, 9, 20, 0.05) 100%); border: 1px solid rgba(255, 255, 255, 0.05); padding: 35px 20px; border-radius: 20px; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .sub-none-card:before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(229, 9, 20, 0.1) 0%, transparent 70%); pointer-events: none; }
        .promo-badge { position: absolute; top: 15px; right: 15px; background: #FFD700; color: #000; font-size: 0.6rem; font-weight: 900; padding: 3px 8px; border-radius: 4px; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3); }
        .promo-icon { margin-bottom: 20px; display: inline-flex; animation: float 3s ease-in-out infinite; }
        .glow-icon { color: var(--primary); filter: drop-shadow(0 0 15px rgba(229, 9, 20, 0.5)); }
        .sub-none-card h4 { font-size: 1.4rem; font-weight: 800; margin-bottom: 12px; color: #fff; }
        .sub-none-card p { font-size: 0.85rem; line-height: 1.6; color: var(--text-muted); margin-bottom: 25px; padding: 0 10px; }
        .upgrade-cta-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; color: white; font-weight: 800; font-size: 0.95rem; cursor: pointer; box-shadow: 0 10px 20px rgba(229, 9, 20, 0.3); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .upgrade-cta-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(229, 9, 20, 0.4); }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; }
        .edit-modal { background: #1a1a1a; padding: 35px; border-radius: 24px; width: 100%; max-width: 600px; border: 1px solid var(--glass-border); overflow-y: auto; max-height: 90vh; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
        
        .avatar-edit-section { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 30px; }
        .avatar-preview-wrapper { width: 100px; height: 100px; border-radius: 50%; background: #2a2a2a; position: relative; cursor: pointer; border: 2px solid var(--primary); overflow: hidden; }
        .avatar-preview-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        .camera-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); opacity: 0; transition: 0.3s; }
        .avatar-preview-wrapper:hover .camera-icon { opacity: 1; }
        .avatar-edit-section p { font-size: 0.8rem; color: var(--text-muted); }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px; }
        .form-group { margin-bottom: 5px; }
        .form-group label { display: block; margin-bottom: 8px; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .form-group input { width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 10px; color: white; outline: none; font-size: 0.9rem; }
        .form-group input:focus { border-color: var(--primary); background: rgba(255,255,255,0.08); }

        .modal-actions { display: flex; gap: 15px; margin-top: 30px; }
        .cancel-btn { flex: 1; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; font-weight: 700; cursor: pointer; }
        .save-btn { flex: 2; padding: 12px; border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; }

        /* Other Styles */
        .tabs { display: flex; border-bottom: 1px solid var(--glass-border); padding: 0 20px; gap: 10px; }
        .tab { padding: 25px 20px; border: none; background: none; color: var(--text-muted); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; position: relative; }
        .tab.active { color: white; }
        .tab.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: var(--primary); border-radius: 4px 4px 0 0; }
        .tab-pane { padding: 30px; }
        .history-list { display: flex; flex-direction: column; gap: 20px; }
        .history-item { display: flex; gap: 25px; padding: 15px; border-radius: 18px; background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.3s; }
        .history-item:hover .item-details h4 { color: var(--primary); }
        .history-poster { width: 80px; height: 120px; border-radius: 8px; overflow: hidden; position: relative; flex-shrink: 0; }
        .history-poster img { width: 100%; height: 100%; object-fit: cover; }
        .play-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; }
        .history-item:hover .play-overlay { opacity: 1; }
        .history-progress-bar { position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: rgba(255,255,255,0.2); }
        .progress-fill { height: 100%; background: var(--primary); box-shadow: 0 0 10px var(--primary); }
        .history-meta { display: flex; flex-direction: column; gap: 4px; }
        .duration-tag { font-size: 0.75rem; color: var(--primary); font-weight: 700; opacity: 0.9; }

        .favorites-grid-profile { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 30px; }
       .empty-state { text-align: center; padding: 80px 40px; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 20px; }

        @media (max-width: 992px) {
          .profile-grid { grid-template-columns: 1fr; }
          .profile-header { flex-direction: column; text-align: center; padding: 30px; gap: 30px; }
          .profile-info-main { flex-direction: column; }
          .user-details h1 { font-size: 2rem; }
          .favorites-grid-profile { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; }
          .avatar-large { width: 100px; height: 100px; }
          .profile-completion-alert { flex-direction: column; text-align: center; gap: 20px; }
          .alert-content { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
