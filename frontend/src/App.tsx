import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import AdminMovies from './pages/admin/AdminMovies';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!token) return <Navigate to="/login" />;

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children, superOnly = false }: { children: React.ReactNode; superOnly?: boolean }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" />;

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const isSuper = user.role === 'superadmin';

  if (!isAdmin) return <Navigate to="/" />;
  if (superOnly && !isSuper) return <Navigate to="/admin/movies" />;

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/subscription" element={<Pricing />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route path="/movie/:id" element={<MovieDetail />} />

          {/* Admin Routes */}
          <Route
            path="/admin/movies"
            element={
              <AdminRoute>
                <AdminMovies />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/admins"
            element={
              <AdminRoute superOnly>
                <AdminAdmins />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <AdminRoute>
                <AdminSubscriptions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        main {
          flex: 1;
        }
        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
