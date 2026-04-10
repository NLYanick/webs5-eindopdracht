import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { Target, Submission, VoteStats } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Loader, AlertCircle, ThumbsUp, ThumbsDown, Upload, MapPin, Calendar, Trash2 } from 'lucide-react';

export const TargetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userVote, setUserVote] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchTargetData();
  }, [id]);

  const fetchTargetData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!id) {
        setError('Target ID is missing');
        setIsLoading(false);
        return;
      }

      const targetsData = await apiClient.getTargets();
      const targetData = Array.isArray(targetsData)
        ? targetsData.find((t: Target) => t._id === id)
        : targetsData?.find((t: Target) => t._id === id);

      if (!targetData) {
        setError('Target not found');
        setIsLoading(false);
        return;
      }

      setTarget(targetData);

      // Fetch submissions
      const submissionsData = await apiClient.getUserSubmissions(id);
      setSubmissions(submissionsData.submissions || []);

      // Fetch vote stats
      const votesData = await apiClient.getVotes(id);
      setVoteStats(votesData.votes || votesData);

      // Check if user is registered
      try {
        await apiClient.checkRegistration(id);
        setIsRegistered(true);
      } catch {
        setIsRegistered(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch target');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!id) return;
    try {
      await apiClient.registerForTarget(id);
      setIsRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    }
  };

  const handleUnregister = async () => {
    if (!id) return;
    try {
      await apiClient.unregisterFromTarget(id);
      setIsRegistered(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unregister');
    }
  };

  const handleVote = async (vote: 'thumbsUp' | 'thumbsDown') => {
    if (!id) return;
    try {
      await apiClient.vote(id, vote);
      setUserVote(vote);
      await fetchTargetData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  };

  const handleSubmitImage = async () => {
    if (!id || !submissionFile) return;
    setIsSubmitting(true);
    try {
      await apiClient.createSubmission(id, submissionFile);
      setSubmissionFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchTargetData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTarget = async () => {
    if (!id || !target) return;
    if (!window.confirm('Are you sure you want to delete this target?')) return;

    try {
      await apiClient.deleteTarget(id);
      navigate('/targets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete target');
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this submission?')) return;

    try {
      await apiClient.deleteSubmission(id, submissionId);
      await fetchTargetData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!target) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error || 'Target not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.sub === target.organizerId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {target.photoUrl && (
            <img
              src={`http://localhost:3000/uploads/${target.photoUrl}`}
              alt={target.title}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{target.title}</h1>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {target.city}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Ends: {new Date(target.endDate).toLocaleDateString()}
                  </div>
                  <div>
                    Status: <span className={target.status === 'OPEN' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {target.status}
                    </span>
                  </div>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={handleDeleteTarget}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Target
                </button>
              )}
            </div>

            {/* Registration and Voting Section */}
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  {!isOwner && (
                    isRegistered ? (
                      <button
                        onClick={handleUnregister}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Unregister
                      </button>
                    ) : (
                      <button
                        onClick={handleRegister}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Register to Participate
                      </button>
                    )
                  )}
                </div>

                {isRegistered && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleVote('thumbsUp')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
                        userVote === 'thumbsUp'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      {voteStats?.thumbsUp || 0}
                    </button>
                    <button
                      onClick={() => handleVote('thumbsDown')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
                        userVote === 'thumbsDown'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      {voteStats?.thumbsDown || 0}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Section */}
            {isRegistered && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
                <h2 className="text-xl font-bold mb-4">Submit Your Image</h2>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={handleSubmitImage}
                    disabled={!submissionFile || isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isSubmitting ? 'Uploading...' : 'Submit'}
                  </button>
                </div>
              </div>
            )}

            {/* Submissions List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Submissions</h2>
              {submissions.length === 0 ? (
                <p className="text-gray-500">No submissions yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissions.map((submission) => (
                    <div key={submission._id} className="bg-gray-100 rounded-lg overflow-hidden">
                      {submission.photoUrl && (
                        <img
                          src={`http://localhost:3000/uploads/${submission.photoUrl}`}
                          alt="Submission"
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                        {submission.score && (
                          <p className="text-lg font-bold mb-2">Score: {submission.score.toFixed(2)}</p>
                        )}
                        <button
                          onClick={() => handleDeleteSubmission(submission._id)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
