import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = localStorage.getItem('token');

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth Service
  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    return response.data;
  }

  async register(username: string, email: string, password: string) {
    const response = await this.client.post('/auth/register', { username, email, password });
    return response.data;
  }

  // Target Service
  async createTarget(formData: FormData) {
    const response = await this.client.post('/targets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteTarget(id: string) {
    const response = await this.client.delete(`/targets/${id}`);
    return response.data;
  }

  async getVotes(targetId: string) {
    const response = await this.client.get(`/targets/${targetId}/votes`);
    return response.data;
  }

  async vote(targetId: string, vote: 'thumbsUp' | 'thumbsDown') {
    const response = await this.client.post(`/targets/${targetId}/vote`, { vote });
    return response.data;
  }

  async removeVote(targetId: string) {
    const response = await this.client.delete(`/targets/${targetId}/vote`);
    return response.data;
  }

  // Submission Service
  async createSubmission(targetId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await this.client.post(
      `/targets/${targetId}/submissions`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  async deleteSubmission(targetId: string, submissionId: string) {
    const response = await this.client.delete(`/targets/${targetId}/submissions/${submissionId}`);
    return response.data;
  }

  // Register Service
  async registerForTarget(targetId: string) {
    const response = await this.client.post(`/registerations/${targetId}`, {});
    return response.data;
  }

  async unregisterFromTarget(targetId: string) {
    const response = await this.client.delete(`/registerations/${targetId}`);
    return response.data;
  }

  async checkRegistration(targetId: string) {
    const response = await this.client.get(`/registerations/${targetId}/check`);
    return response.data;
  }

  // Reader Service
  async getTargets(city?: string, lat?: number, lng?: number) {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    
    const response = await this.client.get(`/reader/targets?${params.toString()}`);
    return response.data;
  }

  async getTargetSubmissions(targetId: string) {
    const response = await this.client.get(`/reader/targets/${targetId}/submissions`);
    return response.data;
  }

  async getUserSubmissions(targetId: string) {
    const response = await this.client.get(`/reader/targets/${targetId}/submissions/my`);
    return response.data;
  }

  async getSubmissionPhoto(targetId: string, fileName: string) {
    const response = await this.client.get(`/reader/targets/${targetId}/submissions/${fileName}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
