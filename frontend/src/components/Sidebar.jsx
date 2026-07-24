import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function Sidebar({ onClose }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const menuItems = [
    {
      id: "dashboard",
      path: "/",
      name: "Tổng quan",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          ></path>
        </svg>
      ),
    },
    (currentUser?.role === "admin" || currentUser?.role === "dev" || currentUser?.role === "accountant") && {
      id: "stats",
      path: "/stats",
      name: "Thống kê",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    (currentUser?.role === "admin" || currentUser?.role === "dev") && {
      id: "users",
      path: "/users",
      name: "Nhân viên",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "products",
      path: "/products",
      name: "Sản phẩm",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          ></path>
        </svg>
      ),
    },
    {
      id: "inventory",
      path: "/inventory",
      name: "Tồn kho",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          ></path>
        </svg>
      ),
    },
    {
      id: "customer",
      path: "/customer",
      name: "Khách hàng",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          ></path>
        </svg>
      ),
    },
    {
      id: "suppliers",
      path: "/suppliers",
      name: "Nhà cung cấp",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "orders",
      path: "/orders",
      name: "Đơn hàng",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          ></path>
        </svg>
      ),
    },
    {
      id: "shippers",
      path: "/shippers",
      name: "Shipper",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          ></path>
        </svg>
      ),
    },
    {
      id: "WarehouseManagement",
      path: "/WarehouseManagement",
      name: "Nhập hóa đơn",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col size-full py-4 sm:py-5 bg-gradient-to-b from-white dark:from-dark-card to-bg-subtle/20 dark:to-dark-bg/20">
      {/* Sidebar Header with Mobile Close button */}
      <div className="px-4 sm:px-5 mb-4 sm:mb-6 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="w-1.5 h-4 bg-primary rounded-full" />
          <h2 className="text-xs font-bold text-text-tertiary dark:text-dark-text-tertiary uppercase tracking-[0.15em]">
            Danh mục
          </h2>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-text-tertiary hover:text-error hover:bg-error/10 transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-y-1 sm:gap-y-0.5 overflow-y-auto no-scrollbar scroll-smooth">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => window.innerWidth < 1024 && onClose?.()}
            className={({ isActive }) =>
              `flex items-center px-3.5 py-2.5 sm:py-2 text-xs font-extrabold rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.01] sm:scale-[1.02] z-10 active"
                  : "text-text-secondary dark:text-dark-text-secondary hover:bg-white dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary hover:shadow-sm hover:translate-x-0.5"
              }`
            }
          >
            <span className="mr-3 transition-all duration-300 group-hover:scale-110 scale-100 sm:scale-90">
              {item.icon}
            </span>
            <span className="tracking-tight uppercase">{item.name}</span>
            {/* Active Indicator Dot */}
            <div className="absolute right-3 size-1.5 rounded-full bg-white opacity-0 transition-opacity duration-300 group-[.active]:opacity-100 shadow-sm" />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 pt-4 border-t border-border/40 dark:border-dark-border/40">
        <div className="bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl p-3.5 border border-border/50 dark:border-dark-border/40 relative overflow-hidden group hover:shadow-md transition-all duration-500">
          <p className="text-xs font-black text-primary uppercase tracking-wider mb-1 relative z-10 truncate">
            {currentUser?.systemName || "Smart WMS"}
          </p>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-extrabold text-text-tertiary dark:text-dark-text-tertiary tracking-widest">
              V3.6.0
            </span>
            <div className="size-2 rounded-full bg-success animate-pulse shadow-sm shadow-success/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
