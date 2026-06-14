import axiosInstance from "../utils/axiosInstance";

const getAllInventoryCounts = async (params) => {
  const response = await axiosInstance.get(`/inventory-count`, { params });
  return response.data;
};

const getInventoryCountById = async (id) => {
  const response = await axiosInstance.get(`/inventory-count/${id}`);
  return response.data;
};

const createInventoryCount = async (data) => {
  const response = await axiosInstance.post(`/inventory-count/create`, data);
  return response.data;
};

const approveInventoryCount = async (id) => {
  const response = await axiosInstance.put(`/inventory-count/${id}/approve`);
  return response.data;
};

const cancelInventoryCount = async (id) => {
  const response = await axiosInstance.put(`/inventory-count/${id}/cancel`);
  return response.data;
};

export {
  getAllInventoryCounts,
  getInventoryCountById,
  createInventoryCount,
  approveInventoryCount,
  cancelInventoryCount,
};
