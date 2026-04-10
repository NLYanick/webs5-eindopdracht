import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Lazy load pages for code splitting
const TargetsPage = lazy(() =>
  import('./pages/TargetsPage').then((m) => ({ default: m.TargetsPage }))
);
const CreateTargetPage = lazy(() =>
  import('./pages/CreateTargetPage').then((m) => ({ default: m.CreateTargetPage }))
);
const TargetDetailPage = lazy(() =>
  import('./pages/TargetDetailPage').then((m) => ({ default: m.TargetDetailPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

// Loading fallback component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/targets"
                element={
                  <ProtectedRoute>
                    <TargetsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/targets/:id"
                element={
                  <ProtectedRoute>
                    <TargetDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-target"
                element={
                  <ProtectedRoute>
                    <CreateTargetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
