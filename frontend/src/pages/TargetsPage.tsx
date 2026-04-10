import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { Target } from '../types';
import { Loader, AlertCircle, MapPin, Calendar, Users } from 'lucide-react';

export const TargetsPage: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.getTargets(city || undefined);
      setTargets(Array.isArray(data) ? data : data.targets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch targets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTargets();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Available Targets</h1>
          <Link
            to="/create-target"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create New Target
          </Link>
        </div>

        <form onSubmit={handleCityFilter} className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex gap-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search by city..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : targets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No targets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targets.map((target) => (
              <Link
                key={target._id}
                to={`/targets/${target._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {target.photoUrl && (
                  <img
                    src={`http://localhost:3000/uploads/${target.photoUrl}`}
                    alt={target.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{target.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {target.city}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(target.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Status: <span className={target.status === 'OPEN' ? 'text-green-600' : 'text-red-600'}>
                        {target.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
