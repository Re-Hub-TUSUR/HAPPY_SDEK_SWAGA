import apiClient from './apiClient';
import { ApiUser, OverviewData, TestResult } from '../types';

export const testApi = {
  getAllTests: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/tests/');
    return data;
  },
  getTestById: async (testId: number): Promise<any> => {
    const { data } = await apiClient.get(`/tests/${testId}`);
    return data;
  },
  createTest: async (formData: FormData): Promise<any> => {
    const { data } = await apiClient.post('/tests/', formData);
    return data;
  },
  updateTest: async (testId: number, formData: FormData): Promise<any> => {
    const { data } = await apiClient.put(`/tests/${testId}`, formData);
    return data;
  },
  deleteTest: async (testId: number): Promise<any> => {
    const { data } = await apiClient.delete(`/tests/${testId}`);
    return data;
  },
  submitTest: async (testId: number, answers: any): Promise<any> => {
    const { data } = await apiClient.post(`/tests/${testId}/submit`, { answers });
    return data;
  },
  getUserResults: async (): Promise<TestResult[]> => {
    const { data } = await apiClient.get('/tests/results');
    return data;
  },
  getSummaryRecommendation: async (): Promise<{ recommendation: string }> => {
    const { data } = await apiClient.get('/tests/summary-recommendation');
    return data;
  },
  getAnalyticsOverview: async (): Promise<OverviewData> => {
    const { data } = await apiClient.get('/analytics/overview');
    return data;
  },
  getAllUsers: async (): Promise<ApiUser[]> => {
    const { data } = await apiClient.get('/analytics/users');
    return data;
  },
  getResultsByUserId: async (userId: number): Promise<TestResult[]> => {
    const { data } = await apiClient.get(`/analytics/user/${userId}/results`);
    return data;
  },
};