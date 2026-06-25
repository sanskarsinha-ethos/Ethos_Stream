import axiosInstance from './axiosInstance';

export const contentApi = {
  getVideos: async (params) => {
    // params: { genre, search, page, size }
    const response = await axiosInstance.get('/videos', { params });
    return response.data;
  },

  getFeaturedVideos: async () => {
    const response = await axiosInstance.get('/videos/featured');
    return response.data;
  },

  getVideoById: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}`);
    return response.data;
  },

  getStreamUrl: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}/stream`);
    return response.data;
  },

  getGenres: async () => {
    const response = await axiosInstance.get('/genres');
    return response.data;
  },

  getRecommendations: async (profileId, limit = 10) => {
    const response = await axiosInstance.get(`/profiles/${profileId}/recommendations`, { params: { limit } });
    return response.data;
  }
};
