import { api } from "./api";

export const initiatePayment = async ({ userId, doctorId, phoneNumber, amount }) => {
  const response = await api.post("/payments/initiate", {
    userId,
    doctorId,
    phoneNumber,
    amount,
  });
  return response.data;
};

export const getPaymentStatus = async (transactionId) => {
  const response = await api.get(`/payments/${transactionId}/status`);
  return response.data;
};

export const getConsultationAccess = async ({ userId, doctorId }) => {
  const response = await api.get(`/payments/consultation-access/${doctorId}`, {
    params: { userId },
  });
  return response.data;
};
