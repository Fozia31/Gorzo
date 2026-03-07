import axios from 'axios';

import {api} from "./api"

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUserById = async (userId, payload) => {
  try {
    const response = await api.put(`/users/${userId}`, payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
