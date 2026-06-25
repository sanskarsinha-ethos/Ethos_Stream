import axiosInstance from './axiosInstance';

export const userApi = {
  getProfiles: async () => {
    const response = await axiosInstance.get('/profiles');
    return response.data;
  },

  createProfile: async (data) => {
    // data: { name, isKids, avatarUrl }
    const response = await axiosInstance.post('/profiles', data);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await axiosInstance.put(`/profiles/${id}`, data);
    return response.data;
  },

  deleteProfile: async (id) => {
    const response = await axiosInstance.delete(`/profiles/${id}`);
    return response.data;
  },

  getWatchlist: async (profileId, page = 0, size = 20) => {
    const response = await axiosInstance.get(`/profiles/${profileId}/mylist`, { params: { page, size } });
    return response.data;
  },

  addToWatchlist: async (profileId, videoId) => {
    const response = await axiosInstance.post(`/profiles/${profileId}/mylist/${videoId}`);
    return response.data;
  },

  removeFromWatchlist: async (profileId, videoId) => {
    const response = await axiosInstance.delete(`/profiles/${profileId}/mylist/${videoId}`);
    return response.data;
  },

  getHistory: async (profileId, page = 0, size = 20) => {
    const response = await axiosInstance.get(`/profiles/${profileId}/history`, { params: { page, size } });
    return response.data;
  },

  updateHistory: async (profileId, videoId, data) => {
    // data: { positionSeconds, isCompleted }
    const response = await axiosInstance.post(`/profiles/${profileId}/history/${videoId}`, data);
    return response.data;
  },

  syncProfile: async (name) => {
    // Called once after register
    const response = await axiosInstance.post('/auth/sync-profile', { name });
    return response.data;
  }
};
