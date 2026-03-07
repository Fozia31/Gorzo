import { api } from "./api";

export const validatePromoCode = async (payload) => {
  try {
    const response = await api.post("/payments/promo/validate", payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const initiateMpesaPayment = async (payload) => {
  try {
    const response = await api.post("/payments/mpesa/initiate", payload);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const checkDoctorAccess = async ({ userId, doctorId }) => {
  try {
    const response = await api.get("/payments/access", {
      params: { userId, doctorId },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
