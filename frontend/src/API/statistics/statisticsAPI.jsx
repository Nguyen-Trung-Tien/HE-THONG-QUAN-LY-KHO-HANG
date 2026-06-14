import axiosInstance from "../utils/axiosInstance";

export const fetchTotalRevenue = async () => {
  const res = await axiosInstance.get(`/statistics/revenue`);
  if (res.status !== 200) throw new Error("Lỗi khi lấy doanh thu");
  return res.data;
};

export const fetchAllOrders = async () => {
  try {
    const response = await axiosInstance.get(`/statistics/all-orders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error.response?.data || new Error("Không thể lấy danh sách đơn hàng");
  }
};

export const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/statistics/order-details/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error.response?.data || new Error("Không thể lấy thông tin đơn hàng");
  }
};

export const fetchAllStock = async () => {
  try {
    const response = await axiosInstance.get(`/statistics/all-stock`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all stock:", error);
    throw error.response?.data || new Error("Không thể lấy danh sách tồn kho");
  }
};

export const fetchAllCustomers = async () => {
  try {
    const response = await axiosInstance.get(`/statistics/all-customers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all customers:", error);
    throw error.response?.data || new Error("Không thể lấy danh sách khách hàng");
  }
};

// Lấy thống kê tổng quan
export const fetchGeneralStats = async (period = 'month') => {
    try {
        const response = await axiosInstance.get(`/statistics/general`, {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching general stats:", error);
        throw error.response?.data || new Error("Không thể lấy số liệu thống kê chung");
    }
};

// Lấy dữ liệu doanh thu để vẽ biểu đồ
export const fetchRevenueByPeriod = async (period = "year") => {
  const res = await axiosInstance.get(`/statistics/revenue-by-period?period=${period}`);
  return res.data;
};
// Lấy top sản phẩm bán chạy
export const fetchTopSellingProducts = async () => {
    try {
        const response = await axiosInstance.get(`/statistics/top-products`);
        return response.data;
    } catch (error) {
        console.error("Error fetching top selling products:", error);
        throw error.response?.data || new Error("Không tìm được sản phẩm bán chạy nhất");
    }
};

// Lấy thống kê trạng thái đơn hàng
export const fetchOrderStatusStats = async () => {
    try {
        const response = await axiosInstance.get(`/statistics/order-status`);
        return response.data;
    } catch (error) {
        console.error("Error fetching order status stats:", error);
        throw error.response?.data || new Error("Không thể lấy số liệu thống kê trạng thái đơn hàng");
    }
};

export const fetchDeadstockReport = async (months = 3) => {
    try {
        const response = await axiosInstance.get(`/statistics/deadstock`, {
            params: { months }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching deadstock report:", error);
        throw error.response?.data || new Error("Không thể lấy báo cáo hàng tồn kho lâu ngày");
    }
};

export const fetchInventoryStructure = async () => {
  try {
    const response = await axiosInstance.get(`/statistics/inventory-structure`);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory structure:", error);
    throw error.response?.data || new Error("Không thể lấy cơ cấu hàng hóa");
  }
};

export const fetchAbcAnalysis = async (days = 90) => {
  try {
    const response = await axiosInstance.get(`/statistics/abc-analysis`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching ABC analysis:", error);
    throw error.response?.data || new Error("Không thể lấy báo cáo phân tích ABC");
  }
};
