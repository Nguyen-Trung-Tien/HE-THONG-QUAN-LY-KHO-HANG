import axiosInstance from "../utils/axiosInstance";

export const getAllStock = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get(`/stock`, {
    params: { page, limit },
  });
  return res.data;
};

export const getStockProduct = async () => {
  const res = await axiosInstance.get(`/stock`);
  return res.data;
};

export const getStockById = async (id) => {
  const res = await axiosInstance.get(`/stock/${id}`);
  return res.data;
};

export const createStock = async (data) => {
  const res = await axiosInstance.post(`/products/create`, data);
  return res.data;
};

export const updateStock = async (id, data) => {
  const res = await axiosInstance.put(`/stock/${id}`, data);
  return res.data;
};

export const deleteStock = async (id) => {
  const res = await axiosInstance.delete(`/stock/${id}`);
  return res.data;
};

export const getOutOfStockProduct = async () => {
  const res = await axiosInstance.get(`/stock/low-stock?threshold=50`);
  return res.data;
};

export const getExpiryAlerts = async (days = 30) => {
  const res = await axiosInstance.get(`/stock/expiry-alerts?days=${days}`);
  return res.data;
};

export const getReorderSuggestions = async () => {
  const res = await axiosInstance.get(`/stock/reorder-suggestions`);
  return res.data;
};

export const createReorderReceipt = async (data) => {
  const res = await axiosInstance.post(`/stock/create-reorder-receipt`, data);
  return res.data;
};
