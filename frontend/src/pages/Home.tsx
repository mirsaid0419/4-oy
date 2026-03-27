import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movie', {
        params: { limit: 8 }
      });
      setMovies(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch movies', error);
      // Fallback data for demo if API fails
      setMovies([
        { id: 1, title: 'Inception', releaseYear: 2010, durationMinutes: 148, subscriptionType: 'premium', posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800' },
        { id: 2, title: 'Interstellar', releaseYear: 2014, durationMinutes: 169, subscriptionType: 'premium', posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800' },
        { id: 3, title: 'The Dark Knight', releaseYear: 2008, durationMinutes: 152, subscriptionType: 'free', posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800' },
        { id: 4, title: 'The Matrix', releaseYear: 1999, durationMinutes: 136, subscriptionType: 'free', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-text"
          >
            KinoTime: Unlimited Movies, TV Shows, & More.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Watch anywhere. Cancel anytime. Start your cinematic journey today with Kino Time.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button className="primary-btn gradient-bg" onClick={() => navigate('/register')}>Get Started</button>
            <button className="secondary-btn glass-morphism" onClick={() => navigate('/subscription')}>Learn More</button>
          </motion.div>
        </div>
        <div className="hero-overlay"></div>
      </section>

      <section className="movie-section">
        <div className="section-header">
          <h2>Trending Now</h2>
          <button className="view-all" onClick={() => navigate('/movies')}>View All</button>
        </div>

        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : (
          <div className="movie-grid">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      <style>{`
        .home-page {
          padding-top: 80px;
        }
        .hero {
          height: 80vh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 5%;
          background: url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000') no-repeat center center/cover;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, var(--bg-dark) 20%, transparent 60%),
                      linear-gradient(to top, var(--bg-dark) 0%, transparent 40%);
        }
        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
        }
        .hero-content h1 {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .hero-content p {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 40px;
        }
        .hero-actions {
          display: flex;
          gap: 20px;
        }
        .primary-btn, .secondary-btn {
          padding: 16px 40px;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.3s;
        }
        .secondary-btn {
          color: white;
        }
        .movie-section {
          padding: 60px 5%;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .section-header h2 {
          font-size: 2rem;
        }
        .view-all {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
        }
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 30px;
        }
        .loading {
          text-align: center;
          padding: 50px;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .home-page {
            padding-top: 60px;
          }
          .hero {
            height: 60vh;
            padding: 0 20px;
            background-position: 70% center;
          }
          .hero-content h1 { 
            font-size: 2.2rem; 
          }
          .hero-content p {
            font-size: 1rem;
            margin-bottom: 25px;
          }
          .hero-actions { 
            flex-direction: column; 
            gap: 12px;
          }
          .primary-btn, .secondary-btn {
            padding: 14px 30px;
            width: 100%;
            text-align: center;
          }
          .movie-section {
            padding: 40px 20px;
          }
          .section-header h2 {
            font-size: 1.5rem;
          }
          .movie-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
        }

        @media (max-width: 480px) {
          .hero {
            height: 50vh;
          }
          .hero-content h1 {
            font-size: 1.8rem;
          }
          .movie-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
