import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    posterUrl: string;
    releaseYear: number;
    durationMinutes: number;
    subscriptionType: 'free' | 'premium';
  };
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const posterFullUrl = movie.posterUrl
    ? (movie.posterUrl.startsWith('http') ? movie.posterUrl : `http://localhost:2003/uploads/movies/${movie.posterUrl}`)
    : 'https://via.placeholder.com/300x450';

  useEffect(() => {
    if (token) {
      checkFavoriteStatus();
    }
  }, [token, movie.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/favorite/check/${movie.id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite status', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/favorite/toggle', { movieId: movie.id });
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  return (
    <motion.div
      className="movie-card"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-wrapper">
        <Link to={`/movie/${movie.id}`}>
          <div className="poster-wrapper">
            <img src={posterFullUrl} alt={movie.title} />
            <div className="overlay">
              <div className="play-icon">
                <Play fill="white" size={32} />
              </div>
            </div>
            {movie.subscriptionType === 'premium' && (
              <div className="badge premium">PREMIUM</div>
            )}
            <button
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
            >
              <Heart size={20} fill={isFavorite ? '#e50914' : 'none'} />
            </button>
          </div>
          <div className="movie-info">
            <h3>{movie.title}</h3>
            <div className="meta">
              <span className="year">{movie.releaseYear}</span>
              <span className="dot">•</span>
              <span className="duration">
                <Clock size={14} />
                {movie.durationMinutes} min
              </span>
            </div>
          </div>
        </Link>
      </div>

      <style>{`
        .movie-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          overflow: hidden;
          transition: transform 0.3s;
          border: 1px solid var(--glass-border);
          position: relative;
        }
        .card-wrapper {
          position: relative;
        }
        .poster-wrapper {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
        }
        .poster-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .movie-card:hover .poster-wrapper img {
          transform: scale(1.1);
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .movie-card:hover .overlay {
          opacity: 1;
        }
        .play-icon {
          width: 60px;
          height: 60px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
        }
        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          z-index: 2;
        }
        .badge.premium {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          color: black;
        }
        .favorite-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 5;
        }
        .favorite-btn:hover {
          background: rgba(229, 9, 20, 0.2);
          border-color: var(--primary);
          transform: scale(1.1);
        }
        .favorite-btn.active {
          color: var(--primary);
          border-color: var(--primary);
          background: rgba(229, 9, 20, 0.1);
        }
        .movie-info {
          padding: 15px;
        }
        .movie-info h3 {
          font-size: 1rem;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .duration {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </motion.div>
  );
};

export default MovieCard;
