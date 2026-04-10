import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Target, Trophy, Share2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center text-white mb-20">
          <h1 className="text-6xl font-bold mb-4">TargetApp</h1>
          <p className="text-2xl mb-8">Create targets, submit images, and compete with others</p>
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 border border-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link
                to="/targets"
                className="p-6 text-center bg-blue-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <Target className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold mb-2">Browse Targets</h3>
                <p className="text-gray-600">Explore available targets and register to participate</p>
              </Link>

              <Link
                to="/create-target"
                className="p-6 text-center bg-green-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <Trophy className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold mb-2">Create Target</h3>
                <p className="text-gray-600">Create a new target and invite others to participate</p>
              </Link>

              <Link
                to="/targets"
                className="p-6 text-center bg-purple-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <Share2 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-bold mb-2">Vote & Share</h3>
                <p className="text-gray-600">Vote on submissions and share your feedback</p>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold">Create a Target</h3>
                    <p className="text-gray-600">Set up a target with location, radius, and end date</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold">Register Participants</h3>
                    <p className="text-gray-600">Users register to participate in your target</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold">Submit Images</h3>
                    <p className="text-gray-600">Participants submit images that match the target</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold">Vote & Score</h3>
                    <p className="text-gray-600">Vote on submissions and see automated scores</p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 mt-1">✓</div>
                  <div>
                    <h3 className="font-bold">Location-based Targets</h3>
                    <p className="text-gray-600">Create targets with geographic boundaries</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 mt-1">✓</div>
                  <div>
                    <h3 className="font-bold">AI-Powered Scoring</h3>
                    <p className="text-gray-600">Automatic image analysis and scoring</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 mt-1">✓</div>
                  <div>
                    <h3 className="font-bold">Community Voting</h3>
                    <p className="text-gray-600">Thumbs up/down voting from participants</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 mt-1">✓</div>
                  <div>
                    <h3 className="font-bold">Real-time Updates</h3>
                    <p className="text-gray-600">See scores and votes update in real-time</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
