import axiosInstance from "../utils/axiosInstance";

export const fetchLocations = async () => {
  const response = await axiosInstance.get(`/locations`);
  return response.data;
};

export const generateLocations = async () => {
  const response = await axiosInstance.post(`/locations/generate`);
  return response.data;
};

export const assignProductToLocation = async (locationId, productId) => {
  const response = await axiosInstance.put(`/locations/${locationId}/assign`, { productId });
  return response.data;
};
