import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Auth
export const syncUser = (data: any) => api.post('/auth/sync', data);
export const getMe = () => api.get('/auth/me');
export const completeOnboarding = (data: any) => api.put('/auth/onboarding', data);

// User
export const getUserProfile = () => api.get('/users/profile');
export const updateProfile = (data: any) => api.put('/users/profile', data);
export const getUserStats = () => api.get('/users/stats');
export const getUserAchievements = () => api.get('/users/achievements');

// Exams
export const getExams = (params?: any) => api.get('/exams', { params });
export const getDiagnosticExam = () => api.get('/exams/diagnostic');
export const getExam = (id: string) => api.get(`/exams/${id}`);
export const startExam = (id: string) => api.post(`/exams/${id}/start`);
export const submitExam = (id: string, data: any) => api.post(`/exams/${id}/submit`, data);
export const getExamResults = (id: string) => api.get(`/exams/${id}/results`);

// Questions
export const getCategories = () => api.get('/questions/categories');
export const getPracticeQuestions = (data: any) => api.post('/questions/practice', data);
export const submitAnswer = (data: any) => api.post('/questions/answer', data);

// Study Plans
export const getStudyPlan = () => api.get('/study-plans');
export const generateStudyPlan = (data?: any) => api.post('/study-plans/generate', data);
export const completeTask = (data: any) => api.put('/study-plans/task/complete', data);

// AI
export const aiTutor = (data: any) => api.post('/ai/tutor', data);
export const aiExplain = (data: any) => api.post('/ai/explain', data);
export const aiPredictScore = () => api.post('/ai/predict-score');
export const aiMotivate = () => api.post('/ai/motivate');

// Analytics
export const getAnalyticsOverview = () => api.get('/analytics/overview');
export const getProgress = () => api.get('/analytics/progress');
export const getWeaknesses = () => api.get('/analytics/weaknesses');

// Leaderboard
export const getLeaderboard = (limit?: number) => api.get('/leaderboard', { params: { limit } });

// Subscriptions
export const getPlans = () => api.get('/subscriptions/plans');
export const subscribe = (planId: string) => api.post('/subscriptions/subscribe', { planId });

export default api;
