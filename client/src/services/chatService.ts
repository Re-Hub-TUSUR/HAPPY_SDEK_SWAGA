import apiClient from './apiClient';

export const chatApi = {
  createNewSession: async (): Promise<{ session_id: string }> => {
    const { data } = await apiClient.post('/chatbot/session/new');
    return data;
  },

  sendMessage: async (sessionId: string, message: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/chatbot/chat', {
      session_id: sessionId,
      message: message,
    });
    return data;
  },
};