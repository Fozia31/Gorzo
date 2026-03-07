import { api } from "./api";

export const createDoctorAdvice = async (payload) => {
  try {
    const response = await api.post("/doctor-advice", payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorAdviceByDoctor = async (doctorId, params = {}) => {
  try {
    const response = await api.get(`/doctor-advice/doctor/${doctorId}`, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorAdvice = async (params = {}) => {
  try {
    const response = await api.get("/doctor-advice", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDoctorAdviceById = async (adviceId) => {
  try {
    const response = await api.get(`/doctor-advice/${adviceId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateDoctorAdvice = async (adviceId, payload) => {
  try {
    const response = await api.put(`/doctor-advice/${adviceId}`, payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const incrementDoctorAdviceViews = async (adviceId) => {
  try {
    const response = await api.patch(`/doctor-advice/${adviceId}/views`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteDoctorAdvice = async (adviceId) => {
  try {
    const response = await api.delete(`/doctor-advice/${adviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadDoctorAdviceFiles = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post("/doctor-advice/upload/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadDoctorAdviceAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await api.post("/doctor-advice/upload/audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
