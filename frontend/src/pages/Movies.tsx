import React, { useEffect, useState } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { Search, Filter, Loader2, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Movies: React.FC = () => {
    const [movies, setMovies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [subscriptionFilter, setSubscriptionFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        fetchMovies();
        fetchCategories();
    }, []);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const response = await api.get('/movie');
            setMovies(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch movies', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/category');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSub = subscriptionFilter === 'all' || movie.subscriptionType === subscriptionFilter;
        const matchesCat = categoryFilter === 'all' ||
            (movie.categories && movie.categories.some((c: any) => c.categoryId === parseInt(categoryFilter)));

        return matchesSearch && matchesSub && matchesCat;
    });

    const activeCategoryName = categoryFilter === 'all' ? 'Categories' : (categories.find(c => c.id.toString() === categoryFilter)?.name || 'Category');
    const activeSubName = subscriptionFilter === 'all' ? 'Any Access' : (subscriptionFilter === 'free' ? 'Free' : 'Premium');

    return (
        <div className="movies-catalog-page" onClick={() => setOpenDropdown(null)}>
            <div className="catalog-header">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="gradient-text"
                >
                    KinoTime: Explore Movies
                </motion.h1>
                <p className="subtitle">Discover thousands of movies, from all-time classics to the latest blockbusters.</p>

                <div className="search-filter-bar glass-morphism" onClick={(e) => e.stopPropagation()}>
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters">
                        <div className="custom-dropdown">
                            <button
                                className={`dropdown-btn ${openDropdown === 'cat' ? 'open' : ''}`}
                                onClick={() => setOpenDropdown(openDropdown === 'cat' ? null : 'cat')}
                            >
                                <Filter size={18} className="filter-icon" />
                                <span>{activeCategoryName}</span>
                            </button>
                            <AnimatePresence>
                                {openDropdown === 'cat' && (
                                    <motion.div
                                        className="dropdown-list glass-morphism"
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                    >
                                        <div
                                            className={`dropdown-item ${categoryFilter === 'all' ? 'active' : ''}`}
                                            onClick={() => { setCategoryFilter('all'); setOpenDropdown(null); }}
                                        >
                                            All Categories
                                        </div>
                                        {categories.map(cat => (
                                            <div
                                                key={cat.id}
                                                className={`dropdown-item ${categoryFilter === cat.id.toString() ? 'active' : ''}`}
                                                onClick={() => { setCategoryFilter(cat.id.toString()); setOpenDropdown(null); }}
                                            >
                                                {cat.name}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="custom-dropdown">
                            <button
                                className={`dropdown-btn ${openDropdown === 'sub' ? 'open' : ''}`}
                                onClick={() => setOpenDropdown(openDropdown === 'sub' ? null : 'sub')}
                            >
                                <span>{activeSubName}</span>
                            </button>
                            <AnimatePresence>
                                {openDropdown === 'sub' && (
                                    <motion.div
                                        className="dropdown-list glass-morphism"
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                    >
                                        <div
                                            className={`dropdown-item ${subscriptionFilter === 'all' ? 'active' : ''}`}
                                            onClick={() => { setSubscriptionFilter('all'); setOpenDropdown(null); }}
                                        >
                                            Any Access
                                        </div>
                                        <div
                                            className={`dropdown-item ${subscriptionFilter === 'free' ? 'active' : ''}`}
                                            onClick={() => { setSubscriptionFilter('free'); setOpenDropdown(null); }}
                                        >
                                            Free
                                        </div>
                                        <div
                                            className={`dropdown-item ${subscriptionFilter === 'premium' ? 'active' : ''}`}
                                            onClick={() => { setSubscriptionFilter('premium'); setOpenDropdown(null); }}
                                        >
                                            Premium
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <div className="catalog-results">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={48} />
                        <p>Loading your cinematic experience...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className="catalog-grid"
                        >
                            {filteredMovies.length > 0 ? (
                                filteredMovies.map(movie => (
                                    <motion.div
                                        layout
                                        key={movie.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MovieCard movie={movie} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <VideoOff size={64} />
                                    <h3>No movies found</h3>
                                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                                    <button onClick={() => { setSearchTerm(''); setSubscriptionFilter('all'); setCategoryFilter('all'); }} className="reset-btn">Reset All Filters</button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <style>{`
                .movies-catalog-page {
                    padding: 120px 5% 60px;
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%),
                                radial-gradient(circle at bottom left, rgba(239, 68, 68, 0.05), transparent 40%);
                }
                .catalog-header {
                    text-align: center;
                    margin-bottom: 60px;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .catalog-header h1 {
                    font-size: 3.5rem;
                    margin-bottom: 15px;
                    font-weight: 900;
                }
                .subtitle {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                    margin-bottom: 40px;
                }
                .search-filter-bar {
                    display: flex;
                    gap: 20px;
                    padding: 15px 25px;
                    border-radius: 20px;
                    align-items: center;
                    border: 1px solid var(--glass-border);
                }
                .search-input-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 12px 20px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    transition: border-color 0.3s;
                }
                .search-input-wrapper:focus-within {
                    border-color: var(--primary);
                }
                .search-input-wrapper input {
                    background: none;
                    border: none;
                    color: white;
                    width: 100%;
                    outline: none;
                    font-size: 1rem;
                }
                .search-icon { color: var(--text-muted); }
                .filters {
                    display: flex;
                    gap: 15px;
                }
                .custom-dropdown {
                    position: relative;
                }
                .dropdown-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(0, 0, 0, 0.4);
                    padding: 12px 20px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: white;
                    font-weight: 600;
                    font-size: 0.95rem;
                    min-width: 140px;
                    justify-content: space-between;
                }
                .dropdown-btn:hover {
                    background: rgba(0, 0, 0, 0.6);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .dropdown-btn.open {
                    border-color: var(--primary);
                    background: rgba(0, 0, 0, 0.7);
                    box-shadow: 0 0 15px rgba(229, 9, 20, 0.1);
                }
                .dropdown-list {
                    position: absolute;
                    top: calc(100% + 10px);
                    left: 0;
                    width: 100%;
                    min-width: 200px;
                    background: #0a0a0a !important;
                    border: 1px solid var(--glass-border);
                    border-radius: 15px;
                    z-index: 1000;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .dropdown-scroll-area {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .dropdown-scroll-area::-webkit-scrollbar {
                    width: 5px;
                }
                .dropdown-scroll-area::-webkit-scrollbar-thumb {
                    background: var(--glass-border);
                    border-radius: 10px;
                }
                .dropdown-item {
                    padding: 12px 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    background: transparent;
                }
                .dropdown-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .dropdown-item.active {
                    background: var(--primary) !important;
                    color: white !important;
                    font-weight: 700;
                }
                .filter-icon { color: var(--primary); }
                
                .catalog-results {
                    margin-top: 40px;
                }
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    gap: 20px;
                    color: var(--text-muted);
                }
                .catalog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 35px;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                    color: var(--primary);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .no-results {
                    grid-column: 1 / -1;
                    padding: 100px 20px;
                    text-align: center;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                .no-results h3 { color: white; font-size: 1.5rem; }
                .reset-btn {
                    margin-top: 10px;
                    padding: 10px 25px;
                    border-radius: 30px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .reset-btn:hover { transform: scale(1.05); }

                @media (max-width: 1024px) {
                    .catalog-header h1 { font-size: 3rem; }
                    .search-filter-bar { padding: 15px; }
                }

                @media (max-width: 768px) {
                    .movies-catalog-page { padding-top: 100px; }
                    .catalog-header { margin-bottom: 40px; }
                    .catalog-header h1 { font-size: 2.2rem; }
                    .subtitle { font-size: 1rem; }
                    .search-filter-bar { 
                        flex-direction: column; 
                        padding: 20px;
                        gap: 15px;
                    }
                    .search-input-wrapper { width: 100%; }
                    .filters { 
                        width: 100%; 
                        flex-direction: column;
                        gap: 10px;
                    }
                    .custom-dropdown, .dropdown-btn { width: 100%; }
                    
                    .catalog-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                }

                @media (max-width: 480px) {
                    .catalog-header h1 { font-size: 1.8rem; }
                    .catalog-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }
                    .movies-catalog-page { padding-left: 15px; padding-right: 15px; }
                }
            `}</style>
        </div>
    );
};

export default Movies;
