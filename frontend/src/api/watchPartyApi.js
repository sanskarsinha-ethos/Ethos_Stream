import axiosInstance from './axiosInstance';

export const watchPartyApi = {
  createRoom: async (data) => {
    // data: { videoId, profileId }
    const response = await axiosInstance.post('/rooms', data);
    return response.data;
  },

  getRoom: async (code) => {
    const response = await axiosInstance.get(`/rooms/${code}`);
    return response.data;
  },

  joinRoom: async (code, data) => {
    // data: { profileId }
    const response = await axiosInstance.post(`/rooms/${code}/join`, data);
    return response.data;
  },

  leaveRoom: async (code, data) => {
    // data: { profileId }
    const response = await axiosInstance.post(`/rooms/${code}/leave`, data);
    return response.data;
  },

  endRoom: async (code) => {
    const response = await axiosInstance.delete(`/rooms/${code}`);
    return response.data;
  }
};
