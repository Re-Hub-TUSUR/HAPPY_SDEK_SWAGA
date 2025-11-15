import apiClient from './apiClient';

export const testApi = {
  getAllTests: async () => {
    const { data } = await apiClient.get('/tests/');
    return data;
  },
  getTestById: async (testId: number) => {
    const { data } = await apiClient.get(`/tests/${testId}`);
    return data;
  },
  createTest: async (formData: FormData) => {
    const { data } = await apiClient.post('/tests/', formData);
    return data;
  },
  updateTest: async (testId: number, formData: FormData) => {
    const { data } = await apiClient.put(`/tests/${testId}`, formData);
    return data;
  },
  deleteTest: async (testId: number) => {
    const { data } = await apiClient.delete(`/tests/${testId}`);
    return data;
  },
  submitTest: async (testId: number, answers: any) => {
    const { data } = await apiClient.post(`/tests/${testId}/submit`, { answers });
    return data;
  },
  getUserResults: async () => {
    const { data } = await apiClient.get('/tests/results');
    return data;
  },
  getSummaryRecommendation: async () => {
    const { data } = await apiClient.get('/tests/summary-recommendation');
    return data;
  },
};