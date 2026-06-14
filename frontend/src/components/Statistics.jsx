import React, { useState, useEffect } from "react";
import { fetchTotalRevenue, fetchInventoryStructure, fetchAbcAnalysis } from "../API/statistics/statisticsAPI";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import Card from "./common/Card";
import Badge from "./common/Badge";
import { FiTrendingUp, FiBox, FiUsers, FiDollarSign, FiCalendar, FiAlertCircle, FiSettings, FiGrid, FiArrowRight } from "react-icons/fi";
import { cn } from "../utils/cn";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Statistics = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [inventoryStructure, setInventoryStructure] = useState([]);
  const [abcData, setAbcData] = useState({ summary: {}, products: [] });
  const [abcDays, setAbcDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const [abcLoading, setAbcLoading] = useState(false);

  const loadGeneralData = async () => {
    setLoading(true);
    try {
      const [rev, structure] = await Promise.all([
        fetchTotalRevenue(),
        fetchInventoryStructure()
      ]);
      setTotalRevenue(rev.totalRevenue || 0);
      setInventoryStructure(structure || []);
    } catch (err) {
      console.error("Error fetching general stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAbcData = async (days) => {
    setAbcLoading(true);
    try {
      const data = await fetchAbcAnalysis(days);
      setAbcData(data || { summary: {}, products: [] });
    } catch (err) {
      console.error("Error fetching ABC stats:", err);
    } finally {
      setAbcLoading(false);
    }
  };

  useEffect(() => {
    loadGeneralData();
  }, []);

  useEffect(() => {
    if (activeTab === "abc") {
      loadAbcData(abcDays);
    }
  }, [activeTab, abcDays]);

  const salesData = {
    labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    datasets: [
      {
        label: "Doanh thu (Triệu VNĐ)",
        data: [650, 590, 800, 810, 560, 550, 400, 840, 640, 1200, 1320, 910],
        fill: true,
        borderColor: "#38BDF8", 
        backgroundColor: "rgba(56, 189, 248, 0.7)", 
        borderRadius: 8,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const COLORS = [
    "#38BDF8",
    "#34D399",
    "#FBBF24",
    "#818CF8",
    "#94A3B8",
    "#F43F5E",
    "#EC4899",
    "#8B5CF6",
    "#10B981",
    "#F59E0B",
    "#6366F1",
    "#D946EF",
  ];

  const inventoryData = {
    labels: inventoryStructure.map(item => item.type || "Khác"),
    datasets: [
      {
        data: inventoryStructure.map(item => item.count),
        backgroundColor: COLORS.slice(0, inventoryStructure.length),
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const totalStock = inventoryStructure.reduce((sum, item) => sum + Number(item.count), 0);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#020617",
        padding: 12,
        titleFont: { size: 10, weight: 'black' },
        bodyFont: { size: 12, weight: 'bold' },
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(226, 232, 240, 0.05)", drawBorder: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: "#64748b" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: "#64748b" },
      },
    },
  };

  // ABC Pareto Chart Data Calculation (Top 15 products for clear chart visualization)
  const topAbcProducts = (abcData.products || []).slice(0, 15);
  
  const abcChartData = {
    labels: topAbcProducts.map(p => p.name.length > 18 ? p.name.slice(0, 15) + '...' : p.name),
    datasets: [
      {
        type: 'bar',
        label: 'Giá trị xuất (VND)',
        data: topAbcProducts.map(p => p.exportValue),
        backgroundColor: topAbcProducts.map(p => 
          p.category === 'A' ? 'rgba(239, 68, 68, 0.85)' : 
          p.category === 'B' ? 'rgba(56, 189, 248, 0.85)' : 
          'rgba(148, 163, 184, 0.7)'
        ),
        borderRadius: 6,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Tỷ lệ tích lũy (%)',
        data: topAbcProducts.map(p => p.cumulativeShare),
        borderColor: '#F59E0B',
        borderWidth: 2,
        pointBackgroundColor: '#F59E0B',
        pointRadius: 3,
        tension: 0.2,
        yAxisID: 'y1',
      }
    ]
  };

  const abcChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#020617",
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: "rgba(226, 232, 240, 0.05)", drawBorder: false },
        ticks: { font: { size: 9, weight: 'bold' }, color: "#64748b" }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { font: { size: 9, weight: 'bold' }, color: "#F59E0B", callback: (val) => `${val}%` }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 9, weight: 'bold' }, color: "#64748b" }
      }
    }
  };

  // Generate smart location warnings
  const locationWarnings = (abcData.products || []).filter(p => {
    if (!p.location) return false;
    // Warning: Group A is placed in Zone B, C, D
    if (p.category === 'A' && p.location.aisle !== 'A') return true;
    // Warning: Group C is placed in Zone A
    if (p.category === 'C' && p.location.aisle === 'A') return true;
    return false;
  });

  const stats = [
    { label: "Tổng doanh thu", value: `${totalRevenue.toLocaleString()}đ`, icon: <FiDollarSign />, color: "text-primary", bg: "bg-primary/10", trend: "+12.5%" },
    { label: "Sản phẩm xuất kho", value: "2,450", icon: <FiBox />, color: "text-success", bg: "bg-success/10", trend: "+8.2%" },
    { label: "Khách hàng mới", value: "128", icon: <FiUsers />, color: "text-info", bg: "bg-info/10", trend: "+24%" },
    { label: "Hiệu suất vận hành", value: "98.5%", icon: <FiTrendingUp />, color: "text-warning", bg: "bg-warning/10", trend: "+1.2%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-1 uppercase tracking-widest">Báo cáo</Badge>
          <h1 className="heading-1">Thống kê hệ thống</h1>
          <p className="subheading">Phân tích dữ liệu vận hành thời gian thực</p>
        </div>
        <div className="flex bg-bg-subtle/50 dark:bg-white/5 p-1 rounded-2xl border border-border/40 dark:border-dark-border/40 backdrop-blur-sm overflow-x-auto max-w-full">
          {[
            { id: 'sales', label: 'Doanh số', icon: <FiDollarSign /> },
            { id: 'inventory', label: 'Tồn kho', icon: <FiBox /> },
            { id: 'customers', label: 'Khách hàng', icon: <FiUsers /> },
            { id: 'abc', label: 'Phân loại ABC & Tối ưu', icon: <FiTrendingUp /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shrink-0",
                activeTab === tab.id 
                  ? "bg-white dark:bg-dark-card text-primary shadow-soft-md scale-[1.05]" 
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab !== "abc" ? (
        <>
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-border/40 dark:border-dark-border/40 shadow-soft-xl group hover:shadow-soft-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                    {stat.icon}
                  </div>
                  <Badge variant="success" className="bg-success/5 text-success border-success/10">{stat.trend}</Badge>
                </div>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-text-primary tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2">
              <Card title="Biểu đồ tăng trưởng" extra={<FiCalendar className="text-primary" />}>
                <div className="h-[400px] w-full pt-4">
                  {activeTab === 'sales' ? (
                    <Line data={salesData} options={chartOptions} />
                  ) : activeTab === 'inventory' ? (
                    <Bar data={salesData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-30">
                      <p className="text-xs font-black uppercase tracking-widest text-center">Dữ liệu khách hàng đang được xử lý...</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Side Chart / Legend */}
            <div className="relative h-full">
              <Card title="Cơ cấu hàng hóa" className="h-full">
                <div className="h-[280px] w-full flex items-center justify-center py-6 relative">
                  <Doughnut 
                    data={inventoryData} 
                    options={{
                      ...chartOptions,
                      cutout: '75%',
                      plugins: { legend: { display: false } }
                    }} 
                  />
                  <div className="absolute flex flex-col items-center pointer-events-none">
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Tổng kho</span>
                    <span className="text-2xl font-black text-text-primary tracking-tighter">{totalStock.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  {inventoryData.labels.map((label, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-subtle/30 dark:bg-white/[0.02] border border-border/20 dark:border-dark-border/20 group hover:bg-white dark:hover:bg-dark-card transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: inventoryData.datasets[0].backgroundColor[i] }} />
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">{label}</span>
                      </div>
                      <span className="text-xs font-black text-text-secondary">
                        {totalStock > 0 ? Math.round((inventoryData.datasets[0].data[i] / totalStock) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* ABC Analysis View */
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Timeline & Summary Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-subtle/20 dark:bg-white/[0.01] p-4 rounded-3xl border border-border/40">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-primary" />
              <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest font-bold">Chu kỳ phân tích</span>
            </div>
            <div className="flex bg-white dark:bg-dark-card p-1 rounded-xl border border-border/30 gap-1">
              {[30, 90, 180, 365].map((d) => (
                <button
                  key={d}
                  onClick={() => setAbcDays(d)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    abcDays === d ? "bg-primary text-white" : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  {d} Ngày
                </button>
              ))}
            </div>
          </div>

          {/* Abc summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="p-5 border-border/40 shadow-soft-xl flex flex-col justify-between h-28">
              <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Giá trị xuất kho</p>
              <p className="text-lg font-black text-text-primary truncate tracking-tight">{(abcData.summary?.totalValue || 0).toLocaleString()}đ</p>
              <div className="w-full bg-border/20 h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-full"></div>
              </div>
            </Card>
            <Card className="p-5 border-border/40 shadow-soft-xl flex flex-col justify-between h-28">
              <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Lượng xuất kho</p>
              <p className="text-lg font-black text-text-primary tracking-tight">{(abcData.summary?.totalQty || 0).toLocaleString()}</p>
              <div className="w-full bg-border/20 h-1 rounded-full overflow-hidden">
                <div className="bg-success h-full w-full"></div>
              </div>
            </Card>
            <Card className="p-5 border-border/40 shadow-soft-xl flex flex-col justify-between h-28 border-l-4 border-l-error">
              <p className="text-[9px] font-black text-error uppercase tracking-widest">Nhóm A (Bán chạy)</p>
              <p className="text-lg font-black text-text-primary tracking-tight">{abcData.summary?.countA || 0} hàng hóa</p>
              <p className="text-[8px] text-text-tertiary font-bold uppercase tracking-widest">Chiếm ~80% giá trị</p>
            </Card>
            <Card className="p-5 border-border/40 shadow-soft-xl flex flex-col justify-between h-28 border-l-4 border-l-primary">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">Nhóm B (Trung bình)</p>
              <p className="text-lg font-black text-text-primary tracking-tight">{abcData.summary?.countB || 0} hàng hóa</p>
              <p className="text-[8px] text-text-tertiary font-bold uppercase tracking-widest">Chiếm ~15% giá trị</p>
            </Card>
            <Card className="p-5 border-border/40 shadow-soft-xl flex flex-col justify-between h-28 border-l-4 border-l-text-tertiary">
              <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest font-bold">Nhóm C (Bán chậm)</p>
              <p className="text-lg font-black text-text-primary tracking-tight">{abcData.summary?.countC || 0} hàng hóa</p>
              <p className="text-[8px] text-text-tertiary font-bold uppercase tracking-widest">Chiếm ~5% giá trị</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pareto Chart */}
            <div className="lg:col-span-2">
              <Card title="Biểu đồ phân loại Pareto ABC (Top 15)" extra={<FiTrendingUp className="text-primary" />}>
                <div className="h-[380px] w-full pt-4">
                  {abcLoading ? (
                    <div className="h-full flex items-center justify-center py-20 gap-3">
                      <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : abcData.products?.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-30">
                      <p className="text-xs font-black uppercase tracking-widest text-center">Không có dữ liệu giao dịch trong chu kỳ chọn</p>
                    </div>
                  ) : (
                    <Bar data={abcChartData} options={abcChartOptions} />
                  )}
                </div>
              </Card>
            </div>

            {/* Smart Recommendations */}
            <div className="lg:col-span-1">
              <Card title="Gợi ý tối ưu vị trí lưu kho" extra={<FiSettings className="text-primary" />} className="h-full">
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {locationWarnings.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-warning/5 border border-warning/20 space-y-2 animate-in fade-in slide-in-from-right-2">
                      <div className="flex items-center gap-2 text-warning">
                        <FiAlertCircle size={16} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Cảnh báo sắp xếp sai khu vực</span>
                      </div>
                      <p className="text-xs font-bold text-text-primary uppercase tracking-tight">{p.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-text-secondary font-semibold">
                        <span>Nhóm: <span className="text-error font-black">{p.category}</span></span>
                        <span className="flex items-center gap-1">Vị trí hiện tại: <span className="bg-warning/20 px-1.5 py-0.5 rounded text-warning font-black uppercase">Khu {p.location.aisle}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-primary font-black uppercase mt-2 pt-2 border-t border-border/30">
                        <span>Khuyến nghị:</span>
                        <span>Khu {p.category === 'A' ? 'A' : 'C/D'}</span>
                        <FiArrowRight />
                        <span className="underline">Chuyển sang Khu {p.category === 'A' ? 'A' : 'C/D'}</span>
                      </div>
                    </div>
                  ))}

                  {locationWarnings.length === 0 && (
                    <div className="text-center py-20 opacity-30 flex flex-col items-center gap-2">
                      <FiGrid size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Bố trí kho hàng tối ưu</p>
                      <p className="text-[8px] font-bold uppercase tracking-wider">Không phát hiện sai lệch sắp xếp vị trí kệ hàng.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Classified Products Grid Table */}
          <Card title="Danh sách phân loại chi tiết" noPadding className="shadow-soft-xl border-border/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-subtle/10 dark:bg-white/[0.005] border-b border-border/30 text-[9px] text-text-tertiary font-black uppercase tracking-wider">
                    <th className="py-4 px-6 w-24 text-center">Nhóm</th>
                    <th className="py-4 px-6">Sản phẩm</th>
                    <th className="py-4 px-6 text-center">Vị trí hiện tại</th>
                    <th className="py-4 px-6 text-center">Lượng xuất</th>
                    <th className="py-4 px-6 text-center">Giá trị xuất</th>
                    <th className="py-4 px-6 text-center">Tỷ lệ đóng góp</th>
                    <th className="py-4 px-6 text-center">Tỷ lệ tích lũy</th>
                    <th className="py-4 px-6 text-center">Vòng quay kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-text-primary">
                  {abcLoading ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center font-bold text-text-tertiary">Đang tải dữ liệu báo cáo...</td>
                    </tr>
                  ) : abcData.products?.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center font-bold text-text-tertiary">Hệ thống chưa ghi nhận giao dịch nào phù hợp</td>
                    </tr>
                  ) : (
                    abcData.products.map((p) => (
                      <tr key={p.id} className="hover:bg-bg-subtle/5 dark:hover:bg-white/[0.005] transition-all">
                        <td className="py-4 px-6 text-center">
                          <Badge
                            variant={p.category === 'A' ? 'error' : p.category === 'B' ? 'primary' : 'neutral'}
                            className="font-bold text-[9px] uppercase"
                          >
                            Nhóm {p.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 font-bold uppercase tracking-tight">
                          {p.name}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {p.location ? (
                            <span className="text-[10px] font-black bg-bg-subtle/50 px-2 py-0.5 rounded border border-border/40 uppercase">
                              Khu {p.location.aisle} - Kệ {p.location.rack}
                            </span>
                          ) : (
                            <span className="text-[9px] text-text-tertiary">Chưa gán</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center font-bold">
                          {p.totalQty.toLocaleString()} {p.unit}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-primary">
                          {p.exportValue.toLocaleString()}đ
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-text-secondary">
                          {p.share}%
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-text-secondary">
                          {p.cumulativeShare}%
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge
                            variant={p.turnover > 1.5 ? 'success' : p.turnover > 0.5 ? 'warning' : 'neutral'}
                            className="font-black text-[9px]"
                          >
                            {p.turnover}x
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Statistics;
