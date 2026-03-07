import { api } from "./api";

export const getDoctors = async (params = {}) => {
  try {
    const response = await api.get("/doctors", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createDoctorByAdmin = async (adminId, payload) => {
  try {
    const response = await api.post(`/doctors/admin/${adminId}`, payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteDoctorById = async (doctorId) => {
  try {
    const response = await api.delete(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorById = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorByUserId = async (userId) => {
  try {
    const response = await api.get(`/doctors/user/${userId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateDoctorById = async (doctorId, payload) => {
  try {
    const response = await api.put(`/doctors/${doctorId}`, payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorDashboardSummary = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/dashboard/summary`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorPatients = async (doctorId, params = {}) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/patients`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorAvailability = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/availability`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateDoctorAvailability = async (doctorId, availability) => {
  try {
    const response = await api.put(`/doctors/${doctorId}/availability`, { availability });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitDoctorRating = async (doctorId, payload) => {
  try {
    const response = await api.post(`/doctors/${doctorId}/ratings`, payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorRatings = async (doctorId, params = {}) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/ratings`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorRatingStats = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/ratings/stats`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
