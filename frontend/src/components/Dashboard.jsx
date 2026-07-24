import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RevenueChart from "./RevenueChart";
import TopProducts from "./TopProducts";
import LowStockAlert from "./LowStockAlert";
import ExpiryAlert from "./ExpiryAlert";
import DeadstockReport from "./DeadstockReport";
import {
  fetchTotalRevenue,
  fetchAllOrders,
  fetchAllStock,
  fetchAllCustomers,
} from "../API/statistics/statisticsAPI";

// Common Components
import Card from './common/Card';
import Badge from './common/Badge';
import Button from './common/Button';
import { cn } from '../utils/cn';
import { FiPlus, FiBox, FiShoppingCart, FiUsers, FiTrendingUp, FiArrowUpRight, FiZap } from 'react-icons/fi';

function Dashboard() {
  const navigate = useNavigate();
  const userRole = useSelector((state) => state.user.role);
  const isAdminOrDev = userRole === "admin" || userRole === "dev";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Hero Header Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                <FiZap className="mr-1 text-emerald-400" /> Executive Dashboard
              </Badge>
              <span className="text-xs font-bold text-slate-400">V3.6 Pro</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Hệ Thống Quản Lý Kho Thông Minh
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Theo dõi biến động tồn kho, báo cáo doanh thu thực tế và điều hành kho vận chính xác thời gian thực.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="gradient" 
              size="sm"
              leftIcon={<FiPlus />}
              onClick={() => navigate('/WarehouseManagement')}
            >
              Nhập Hóa Đơn
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              leftIcon={<FiShoppingCart />}
              onClick={() => navigate('/orders')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Xem Đơn Hàng
            </Button>
          </div>
        </div>
      </div>

      {/* Low Stock & Expiry Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LowStockAlert />
        <ExpiryAlert />
      </div>

      {/* KPI Cards */}
      <DashboardCards />
      
      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isAdminOrDev && (
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
        )}
        <div className={cn("space-y-6", !isAdminOrDev && "lg:col-span-3")}>
           <TopProducts />
        </div>
      </div>

      {/* Deadstock Report */}
      <div className="grid grid-cols-1 gap-6">
        <DeadstockReport />
      </div>
    </div>
  );
}

function DashboardCards() {
  const navigate = useNavigate();
  const userRole = useSelector((state) => state.user.role);
  const isAdminOrDev = userRole === "admin" || userRole === "dev";

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [allOrders, setAllOrders] = useState(0);
  const [allStock, setAllStock] = useState(0);
  const [allCustomers, setAllCustomers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rev, ord, stoc, cust] = await Promise.all([
          fetchTotalRevenue(),
          fetchAllOrders(),
          fetchAllStock(),
          fetchAllCustomers()
        ]);
        setTotalRevenue(rev.totalRevenue || 0);
        setAllOrders(ord || 0);
        setAllStock(stoc || 0);
        setAllCustomers(cust || 0);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchData();
  }, []);

  const stats = [
    isAdminOrDev && {
      title: "Tổng doanh thu",
      value: totalRevenue.toLocaleString("vi-VN") + "đ",
      change: "+12.5%",
      isPositive: true,
      variant: "primary",
      gradient: "from-sky-500 to-blue-600",
      icon: <FiTrendingUp className="w-6 h-6 text-white" />,
      path: "/stats",
    },
    {
      title: "Đơn hàng",
      value: allOrders,
      change: "+8.2%",
      isPositive: true,
      variant: "success",
      gradient: "from-emerald-500 to-teal-600",
      icon: <FiShoppingCart className="w-6 h-6 text-white" />,
      path: "/orders",
    },
    {
      title: "Tồn kho tổng",
      value: allStock,
      change: "-2.4%",
      isPositive: false,
      variant: "warning",
      gradient: "from-amber-500 to-orange-600",
      icon: <FiBox className="w-6 h-6 text-white" />,
      path: "/inventory",
    },
    {
      title: "Khách hàng",
      value: allCustomers,
      change: "+15.3%",
      isPositive: true,
      variant: "accent",
      gradient: "from-indigo-500 to-purple-600",
      icon: <FiUsers className="w-6 h-6 text-white" />,
      path: "/customer",
    },
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          onClick={() => navigate(stat.path)}
          className="group cursor-pointer relative rounded-2xl sm:rounded-3xl bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 p-5 sm:p-6 shadow-soft-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          {/* Subtle Ambient Background Accent */}
          <div className={cn(
            "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-25 pointer-events-none",
            stat.gradient
          )} />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
              stat.gradient
            )}>
              {stat.icon}
            </div>
            
            <div className="flex items-center gap-1 text-xs font-black">
              <Badge variant={stat.isPositive ? "success" : "error"} size="sm">
                {stat.change}
              </Badge>
              <FiArrowUpRight className="text-text-tertiary group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="relative z-10 space-y-1">
            <p className="text-xs font-extrabold text-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
              {stat.title}
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-text-primary dark:text-dark-text-primary tracking-tight truncate">
              {stat.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
