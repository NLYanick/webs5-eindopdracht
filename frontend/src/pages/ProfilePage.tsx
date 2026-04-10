import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import type { Target, Submission } from '../types';
import { AlertCircle, Loader, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [myTargets, setMyTargets] = useState<Target[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'targets' | 'submissions'>('targets');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all targets and filter for current user's targets
        // Note: This assumes targets have an ownerId or similar field
        // For now, we're fetching all targets and would need backend support for filtering
        const targets = await apiClient.getTargets();
        setMyTargets(targets);

        // Fetch user's submissions across all targets
        // This would need a "my-submissions" endpoint
        // For now, set empty array
        setMySubmissions([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!window.confirm('Are you sure you want to delete this target?')) return;

    try {
      await apiClient.deleteTarget(targetId);
      setMyTargets(myTargets.filter((t) => t._id !== targetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete target');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'targets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Targets ({myTargets.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'submissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Submissions ({mySubmissions.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'targets' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {myTargets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't created any targets yet.</p>
                <a
                  href="/create-target"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Target
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {myTargets.map((target) => (
                  <div
                    key={target._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{target.title}</h3>
                        <p className="text-gray-600 mb-1">📍 {target.city}</p>
                        <p className="text-gray-600 mb-2">
                          📅 Ends: {new Date(target.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Radius: {target.radiusInMeter}m | Status: {target.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/targets/${target._id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDeleteTarget(target._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {mySubmissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't submitted any images yet.</p>
                <a
                  href="/targets"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Targets
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySubmissions.map((submission) => (
                  <div key={submission._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={submission.photoUrl}
                      alt="Submission"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        📅 {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                      {submission.score && (
                        <p className="text-lg font-bold text-blue-600">
                          Score: {submission.score.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
