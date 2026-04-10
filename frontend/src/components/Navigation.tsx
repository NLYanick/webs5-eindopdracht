import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Plus, List, User } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Home className="w-6 h-6" />
            TargetApp
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link to="/targets" className="flex items-center gap-2 hover:text-blue-600">
                <List className="w-5 h-5" />
                Targets
              </Link>
              <Link to="/create-target" className="flex items-center gap-2 hover:text-blue-600">
                <Plus className="w-5 h-5" />
                Create Target
              </Link>
              <Link to="/profile" className="flex items-center gap-2 hover:text-blue-600">
                <User className="w-5 h-5" />
                {user?.email}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
