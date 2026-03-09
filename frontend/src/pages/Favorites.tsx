import React, { useEffect, useState } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { Heart, Loader2, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await api.get('/favorite/my/all');
            setFavorites(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="favorites-page">
            <header className="page-header">
                <motion.h1
                    className="gradient-text"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Heart fill="#e50914" color="#e50914" /> My Favorites
                </motion.h1>
                <p>O'zingizga yoqqan va keyinroq ko'rmoqchi bo'lgan kinolaringiz ro'yxati.</p>
            </header>

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin" size={48} />
                </div>
            ) : (
                <div className="favorites-container">
                    {favorites.length > 0 ? (
                        <div className="favorites-grid">
                            {favorites.map(fav => (
                                <motion.div
                                    key={fav.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    layout
                                >
                                    <MovieCard movie={fav.movie} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className="empty-favorites glass-morphism"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <PlayCircle size={80} />
                            <h2>Sevimlilar ro'yxati bo'sh</h2>
                            <p>Hali rish hech qanday kinoni sevimlilarga qo'shmabsiz.</p>
                            <Link to="/movies" className="browse-btn gradient-bg">
                                Kinolarni ko'rish
                            </Link>
                        </motion.div>
                    )}
                </div>
            )}

            <style>{`
                .favorites-page {
                    padding: 120px 5% 60px;
                    min-height: 100vh;
                }
                .page-header {
                    margin-bottom: 50px;
                    text-align: center;
                }
                .page-header h1 {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    font-size: 3rem;
                    font-weight: 900;
                    margin-bottom: 10px;
                }
                .page-header p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .favorites-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 35px;
                }

                .empty-favorites {
                    max-width: 600px;
                    margin: 100px auto;
                    padding: 60px;
                    text-align: center;
                    border-radius: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    color: var(--text-muted);
                }
                .empty-favorites h2 { color: white; font-size: 1.8rem; }
                .browse-btn {
                    padding: 14px 35px;
                    border-radius: 30px;
                    color: white;
                    font-weight: 700;
                    text-decoration: none;
                    margin-top: 10px;
                    transition: transform 0.2s;
                }
                .browse-btn:hover { transform: scale(1.05); }

                .loading-state {
                    display: flex;
                    justify-content: center;
                    padding: 100px;
                    color: var(--primary);
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Favorites;
