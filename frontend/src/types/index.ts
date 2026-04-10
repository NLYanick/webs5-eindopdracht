// Auth Types
export interface User {
  sub: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Target Types
export interface Target {
  _id: string;
  title: string;
  organizerId: string;
  status: 'OPEN' | 'CLOSED';
  photoUrl: string;
  endDate: string;
  city: string;
  lat: number;
  lng: number;
  radiusInMeter: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTargetPayload {
  title: string;
  city: string;
  lat: number;
  lng: number;
  radiusInMeter: number;
  endDate?: string;
}

// Submission Types
export interface Submission {
  _id: string;
  targetId: string;
  userUid: string;
  imageName: string;
  photoUrl: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionPayload {
  file: File;
}

// Registration Types
export interface Register {
  _id: string;
  targetId: string;
  userUid: string;
  createdAt: string;
  updatedAt: string;
}

// Vote Types
export interface Vote {
  _id: string;
  targetId: string;
  userUid: string;
  vote: 'thumbsUp' | 'thumbsDown';
  createdAt: string;
  updatedAt: string;
}

export interface VoteStats {
  thumbsUp: number;
  thumbsDown: number;
}

// Score Types
export interface Score {
  _id: string;
  targetId: string;
  submissionId: string;
  userUid: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

// Reader Service Response Types
export interface TargetWithVotes extends Target {
  votes?: VoteStats;
}

export interface SubmissionWithScore extends Submission {
  score?: number;
}
