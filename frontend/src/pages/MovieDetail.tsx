import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';
import { Star, Clock, Calendar, ChevronLeft, Heart, Share2, Play, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 10, comment: '' });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [watchProgress, setWatchProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressInterval = useRef<any>(null);

  const { token, user } = useAuth();
  const navigate = useNavigate();
  const videoSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const scrollToWatch = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMovieDetail();
    fetchReviews();
    if (token) {
      checkFavoriteStatus();
    }
  }, [id, token, user]);

  const fetchMovieDetail = async () => {
    try {
      const response = await api.get(`/movie/${id}`);
      setMovie(response.data.data);

      if (token) {
        const progressRes = await api.get(`/watch-history/movie/${id}`);
        if (progressRes.data.data) {
          setWatchProgress(progressRes.data.data.watchedDuration);
        }
      }
    } catch (error) {
      console.error('Failed to fetch movie detail', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/review/movie/${id}`);
      const data = response.data.data || [];
      setReviews(data);

      if (user) {
        const myReview = data.find((r: any) => r.userId === user.id);
        if (myReview) {
          setHasReviewed(true);
          setUserReview({ rating: myReview.rating, comment: myReview.comment || '' });
        } else {
          setHasReviewed(false);
          setUserReview({ rating: 10, comment: '' });
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/favorite/check/${id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite status', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await api.post('/favorite/toggle', { movieId: Number(id) });
      setIsFavorite(response.data.isFavorite);
      showToast(response.data.isFavorite ? 'Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi');
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await api.post('/review', {
        movieId: Number(id),
        rating: userReview.rating,
        comment: userReview.comment
      });
      showToast(hasReviewed ? 'Izoh tahrirlandi' : 'Izoh muvaffaqiyatli yuborildi');
      fetchReviews();
      fetchMovieDetail();
    } catch (error) {
      console.error('Failed to submit review', error);
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRemoveReview = async (reviewId: number) => {
    if (!window.confirm('Sharhingizni o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/review/${reviewId}`);
      showToast('Sharh o\'chirildi');
      fetchReviews();
      fetchMovieDetail();
    } catch (error) {
      console.error('Failed to delete review', error);
      showToast('O\'chirishda xatolik yuz berdi', 'error');
    }
  };

  const addToWatchHistory = async (currentTime?: number) => {
    if (!token) return;
    try {
      const duration = Math.floor(currentTime || (videoRef.current?.currentTime || 0));
      await api.post('/watch-history', {
        movieId: Number(id),
        watchedDuration: duration
      });
    } catch (error) {
      console.error('Failed to add to watch history', error);
    }
  };

  const onVideoPlay = () => {
    addToWatchHistory();
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      addToWatchHistory();
    }, 10000); // Har 10 sekundda saqlaydi
  };

  const onVideoPause = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    addToWatchHistory();
  };

  useEffect(() => {
    if (videoRef.current && watchProgress > 0) {
      const handleLoadedMetadata = () => {
        if (videoRef.current) videoRef.current.currentTime = watchProgress;
      };
      const video = videoRef.current;
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [watchProgress]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const posterFullUrl = movie?.posterUrl
    ? (movie.posterUrl.startsWith('http') ? movie.posterUrl : `${API_BASE_URL}/uploads/movies/${movie.posterUrl}`)
    : 'https://via.placeholder.com/800x1200';

  if (loading) return <div className="loading">Loading movie details...</div>;

  return (
    <div className="movie-detail-page">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.5, x: '-50%' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="backdrop">
        <img src={posterFullUrl} alt={movie.title} className="backdrop-img" />
        <div className="backdrop-overlay"></div>
      </div>

      <div className="detail-container">
        <Link to="/movies" className="back-btn">
          <ChevronLeft /> Back to Catalog
        </Link>

        <div className="main-info">
          <motion.div
            className="poster-side clickable"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={scrollToWatch}
          >
            <img src={posterFullUrl} alt={movie.title} />
            <div className="poster-overlay">
              <div className="play-icon-large">
                <Play fill="white" size={48} />
              </div>
              <span>WATCH NOW</span>
            </div>
          </motion.div>

          <div className="content-side">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="movie-title">{movie.title}</h1>

              <div className="info-badges">
                <span className="info-badge"><Star fill="gold" size={16} /> {movie?.rating ? Number(movie.rating).toFixed(1) : '0.0'}</span>
                <span className="info-badge"><Clock size={16} /> {movie?.durationMinutes} min</span>
                <span className="info-badge"><Calendar size={16} /> {movie?.releaseYear}</span>
                <span className={`info-badge ${movie?.subscriptionType || 'free'}`}>{(movie?.subscriptionType || 'free').toUpperCase()}</span>
              </div>

              <div className="categories">
                {movie.categories?.map((c: any) => (
                  <span key={c.category.id} className="category-tag">#{c.category.name}</span>
                ))}
              </div>

              <p className="description">{movie.description}</p>

              <div className="detail-actions">
                <button
                  className={`favorite-action ${isFavorite ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                >
                  <Heart size={24} fill={isFavorite ? '#e50914' : 'none'} />
                  {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                </button>
                <button className="share-action">
                  <Share2 size={24} />
                  Share
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="video-section-wrapper" ref={videoSectionRef}>
          {movie.files && movie.files.length > 0 ? (
            <div className="video-section">
              <h3 className="section-title gradient-text">Stream Movie</h3>
              <div className="video-list">
                {movie.files.map((file: any) => (
                  <div key={file.id} className="video-player-container glass-morphism">
                    <video
                      ref={videoRef}
                      controls
                      className="movie-video"
                      poster={posterFullUrl}
                      src={`${API_BASE_URL}/movie-file/watch/${file.id}?token=${token}`}
                      preload="metadata"
                      onPlay={onVideoPlay}
                      onPause={onVideoPause}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="video-meta">
                      <div className="quality-info">
                        <span className="quality-badge">{file.quality}</span>
                        <span className="lang-badge">{file.language.toUpperCase()}</span>
                      </div>
                      <p className="video-filename">{movie.title} - Official Source</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-videos glass-morphism">
              <VideoOff size={48} />
              <p>Ushbu kino uchun video fayllar hali yuklanmagan.</p>
            </div>
          )}
        </div>

        <div className="reviews-section">
          <h3 className="section-title gradient-text">Fikrlar va Reyting ({reviews.length})</h3>

          <div className="reviews-grid">
            {(!user || user.role === 'user') ? (
              <div className="add-review glass-morphism">
                <h4>{hasReviewed ? 'Sharhingizni tahrirlang' : 'Fikringizni qoldiring'}</h4>
                <form onSubmit={handleSubmitReview}>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <Star
                        key={num}
                        size={24}
                        fill={num <= userReview.rating ? 'gold' : 'none'}
                        color={num <= userReview.rating ? 'gold' : '#4b5563'}
                        onClick={() => {
                          if (!token) { navigate('/login'); return; }
                          setUserReview({ ...userReview, rating: num });
                        }}
                        className="star-icon"
                      />
                    ))}
                    <span className="rating-num">{userReview.rating}/10</span>
                  </div>
                  <textarea
                    required
                    placeholder="Kino haqida fikringizni yozing..."
                    value={userReview.comment}
                    onChange={e => {
                      if (!token) { navigate('/login'); return; }
                      setUserReview({ ...userReview, comment: e.target.value });
                    }}
                  ></textarea>
                  <button type="submit" className="submit-review-btn gradient-bg" disabled={isSubmittingReview}>
                    {isSubmittingReview ? 'Yuborilmoqda...' : (hasReviewed ? 'Yangilash' : 'Yuborish')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="add-review glass-morphism admin-notice">
                <h4>Reyting va Izohlar</h4>
                <p>Adminlar kinolarga izoh qoldira olishmaydi. Bu bo'lim faqat foydalanuvchilar uchun.</p>
              </div>
            )}

            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="review-card glass-morphism">
                    <div className="review-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          {review.user?.avatarUrl ? (
                            <img
                              src={review.user.avatarUrl.startsWith('http') ? review.user.avatarUrl : `${API_BASE_URL}/uploads/${review.user.avatarUrl}`}
                              alt={review.user.username}
                            />
                          ) : (
                            review.user?.username?.charAt(0).toUpperCase() || '?'
                          )}
                        </div>
                        <div className="user-details">
                          <h5>
                            {review.user?.username}
                            {user?.id === review.userId && <span className="you-badge">Siz</span>}
                          </h5>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="review-right">
                        <div className="review-rating">
                          <Star fill="gold" size={14} color="gold" />
                          <span>{review.rating}/10</span>
                        </div>
                        {user?.id === review.userId && (
                          <button
                            className="delete-review-btn"
                            onClick={() => handleRemoveReview(review.id)}
                            title="O'chirish"
                          >
                            O'chirish
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="empty-reviews">Hali fikrlar yo'q. Birinchi bo'lib fikr qoldiring!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .movie-detail-page {
          min-height: 100vh;
          position: relative;
          padding-bottom: 80px;
        }
        .backdrop {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: -1;
        }
        .backdrop-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: blur(25px) brightness(0.2);
        }
        .backdrop-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, #000, transparent);
        }
        .detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 120px 20px 40px;
        }
        .back-btn {
          display: flex; align-items: center; gap: 8px;
          color: var(--text-muted); margin-bottom: 40px;
          font-weight: 500; transition: color 0.3s;
        }
        .back-btn:hover { color: white; }
        
        .main-info {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 60px;
          margin-bottom: 80px;
        }
        .poster-side { position: relative; }
        .poster-side.clickable { cursor: pointer; }
        .poster-side img {
          width: 100%; border-radius: 20px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
          border: 1px solid var(--glass-border);
        }
        .poster-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; opacity: 0; transition: all 0.3s;
          border-radius: 20px; gap: 15px;
        }
        .poster-side:hover .poster-overlay { opacity: 1; }
        .play-icon-large {
          width: 90px; height: 90px; background: var(--primary);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 0 40px rgba(229, 9, 20, 0.4);
        }
        .poster-overlay span { font-weight: 900; letter-spacing: 3px; font-size: 0.9rem; }

        .movie-title { font-size: 4rem; font-weight: 900; margin-bottom: 25px; line-height: 1.1; }
        .info-badges { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }
        .info-badge {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.05); padding: 10px 18px;
          border-radius: 30px; font-size: 0.9rem; border: 1px solid var(--glass-border);
        }
        .info-badge.premium { border-color: #ffd700; color: #ffd700; }
        .categories { display: flex; gap: 12px; margin-bottom: 35px; }
        .category-tag { color: var(--text-muted); font-size: 1rem; font-weight: 600; }

        .description { font-size: 1.25rem; line-height: 1.8; color: #cbd5e1; margin-bottom: 40px; }
        
        .detail-actions { display: flex; gap: 20px; }
        .favorite-action, .share-action {
          padding: 14px 28px; border-radius: 14px;
          display: flex; align-items: center; gap: 12px;
          cursor: pointer; transition: all 0.3s; font-weight: 700;
          background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white;
        }
        .favorite-action.active { border-color: var(--primary); background: rgba(229, 9, 20, 0.1); color: var(--primary); }
        .favorite-action:hover, .share-action:hover { background: rgba(255,255,255,0.1); transform: translateY(-3px); }

        .video-section-wrapper { margin-top: 100px; }
        .section-title { font-size: 2.2rem; font-weight: 900; margin-bottom: 40px; }
        .video-player-container { margin-bottom: 40px; border-radius: 24px; overflow: hidden; border: 1px solid var(--glass-border); }
        .movie-video { width: 100%; aspect-ratio: 16/9; background: black; display: block; }
        .video-meta { padding: 25px; display: flex; justify-content: space-between; align-items: center; }
        .quality-info { display: flex; gap: 10px; }
        .quality-badge { background: var(--primary); padding: 6px 14px; border-radius: 8px; font-weight: 800; }
        .lang-badge { background: #374151; padding: 6px 14px; border-radius: 8px; font-weight: 800; }
        .video-filename { color: var(--text-muted); font-weight: 600; }

        .no-videos { padding: 80px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 20px; }

        /* Toast Notifications */
        .toast-notification {
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          padding: 15px 30px;
          border-radius: 12px;
          z-index: 9999;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .toast-notification.success {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }
        .toast-notification.error {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .admin-notice h4 { color: var(--primary); margin-bottom: 20px; }
        .admin-notice p { color: var(--text-muted); line-height: 1.6; font-weight: 500; }

        .reviews-section { margin-top: 120px; }
        .reviews-grid { display: grid; grid-template-columns: 400px 1fr; gap: 50px; }
        .add-review { padding: 40px; border-radius: 24px; height: fit-content; position: sticky; top: 100px; }
        .add-review h4 { font-size: 1.4rem; margin-bottom: 25px; }
        .rating-input { display: flex; align-items: center; gap: 5px; margin-bottom: 20px; }
        .star-icon { cursor: pointer; transition: transform 0.2s; }
        .star-icon:hover { transform: scale(1.2); }
        .rating-num { margin-left: 10px; font-weight: 800; color: gold; font-size: 1.1rem; }
        
        textarea {
          width: 100%; padding: 15px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);
          border-radius: 12px; color: white; resize: none; min-height: 120px; margin-bottom: 20px;
          outline: none; transition: border-color 0.3s;
        }
        textarea:focus { border-color: var(--primary); }
        .submit-review-btn { width: 100%; padding: 15px; border-radius: 12px; border: none; color: white; font-weight: 800; cursor: pointer; }

        .reviews-list { display: flex; flex-direction: column; gap: 25px; }
        .review-card { padding: 25px; border-radius: 20px; }
        .review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .user-info { display: flex; gap: 15px; align-items: center; }
        .user-avatar {
          width: 50px; height: 50px; background: var(--primary); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-weight: 900;
          font-size: 1.2rem; border: 2px solid rgba(255,255,255,0.1); overflow: hidden;
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-details h5 { font-size: 1.1rem; margin-bottom: 2px; display: flex; align-items: center; gap: 8px; }
        .user-details span { font-size: 0.8rem; color: var(--text-muted); }
        
        .you-badge {
          background: var(--primary);
          color: white;
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .review-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .delete-review-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .delete-review-btn:hover {
          background: #ef4444;
          color: white;
        }

        .review-rating {
          background: rgba(255,215,0,0.1); padding: 6px 14px; border-radius: 30px;
          display: flex; align-items: center; gap: 8px; color: gold; font-weight: 800; font-size: 0.9rem;
        }
        .review-comment { font-size: 1.05rem; line-height: 1.6; color: #d1d5db; }
        .empty-reviews { padding: 40px; text-align: center; color: var(--text-muted); background: var(--glass); border-radius: 20px; }

        @media (max-width: 992px) {
          .main-info { grid-template-columns: 1fr; }
          .poster-side { max-width: 320px; margin: 0 auto; }
          .movie-title { font-size: 2.8rem; text-align: center; }
          .info-badges, .categories, .detail-actions { justify-content: center; }
          .reviews-grid { grid-template-columns: 1fr; }
          .add-review { position: static; }
        }
      `}</style>
    </div>
  );
};

export default MovieDetail;
