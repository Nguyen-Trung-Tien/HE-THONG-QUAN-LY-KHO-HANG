import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, resetUser } from "../redux/slice/userSlice";
import { UserLogout, UpdatePreferences } from "../API/user/userApi";
import { toast } from "react-toastify";
import NotificationDropdown from "./common/NotificationDropdown";
import { getAllNotifications, markAsRead } from "../API/notificationApi";
import { RiMenu2Fill } from "react-icons/ri";
import {
  FiPlus,
  FiLogOut,
  FiUser,
  FiBell,
  FiMoon,
  FiSun,
  FiSearch,
  FiSettings,
  FiCommand,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiCheckSquare,
  FiTrendingUp
} from "react-icons/fi";
import Badge from "./common/Badge";
import ConfirmModal from "./common/ConfirmModal";
import Modal from "./common/Modal";
import { cn } from "../utils/cn";

function Header({ onOpenSidebar }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Command Palette & Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notiRef = useRef(null);

  const currentTheme = currentUser?.preferredTheme || localStorage.getItem("theme") || "light";
  const isDark = currentTheme === "dark";

  // System Search shortcuts list
  const systemNavigation = [
    { title: "Tổng quan Dashboard", path: "/", icon: <FiTrendingUp />, category: "Trang" },
    { title: "Thống kê báo cáo", path: "/stats", icon: <FiTrendingUp />, category: "Trang" },
    { title: "Danh sách sản phẩm", path: "/products", icon: <FiBox />, category: "Trang" },
    { title: "Báo cáo tồn kho", path: "/inventory", icon: <FiBox />, category: "Trang" },
    { title: "Quản lý đơn hàng", path: "/orders", icon: <FiShoppingCart />, category: "Trang" },
    { title: "Quản lý khách hàng", path: "/customer", icon: <FiUsers />, category: "Trang" },
    { title: "Quản lý nhà cung cấp", path: "/suppliers", icon: <FiUsers />, category: "Trang" },
    { title: "Quản lý hóa đơn kho", path: "/WarehouseManagement", icon: <FiCheckSquare />, category: "Trang" },
    { title: "Quản lý nhân viên", path: "/users", icon: <FiUsers />, category: "Trang" },
    { title: "Thông tin cá nhân Profile", path: "/profile", icon: <FiUser />, category: "Cài đặt" },
    { title: "Cài đặt hệ thống", path: "/settings", icon: <FiSettings />, category: "Cài đặt" },
  ];

  const filteredSearchResults = searchQuery.trim() === "" 
    ? systemNavigation 
    : systemNavigation.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Keyboard shortcut Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = async () => {
    const newTheme = isDark ? "light" : "dark";

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);

    if (currentUser) {
      const updatedUser = { ...currentUser, preferredTheme: newTheme };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(login(updatedUser));
    }

    try {
      await UpdatePreferences({ preferredTheme: newTheme });
    } catch (err) {
      console.error("Failed to save theme preference:", err);
    }
  };

  const fetchNotis = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await getAllNotifications(currentUser.id);
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchNotis();
    window.addEventListener("focus", fetchNotis);
    const interval = setInterval(fetchNotis, 30000);
    return () => {
      window.removeEventListener("focus", fetchNotis);
      clearInterval(interval);
    };
  }, [fetchNotis]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await UserLogout();
      dispatch(resetUser());
      toast.success("Đăng xuất thành công!");
      navigate("/sign-in");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-b border-border/50 dark:border-dark-border/40 h-16 sm:h-20 shadow-sm transition-all duration-300 px-3 sm:px-8">
        <div className="h-full flex items-center justify-between gap-x-3">
          {/* Left section: Sidebar toggle & Title */}
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-xl bg-bg-subtle dark:bg-white/5 text-text-secondary hover:text-primary transition-all active:scale-95 touch-target flex items-center justify-center"
              aria-label="Open Navigation"
            >
              <RiMenu2Fill size={22} />
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.3em] leading-none mb-1">
                Trạng thái hệ thống
              </h2>
              <div className="flex items-center gap-x-2">
                <span className="size-2 rounded-full bg-success animate-ping" />
                <span className="text-xs font-black text-text-primary dark:text-dark-text-primary uppercase tracking-tight">
                  Hoạt động bình thường
                </span>
              </div>
            </div>
            
            {/* Mobile Title */}
            <div className="block lg:hidden">
              <span className="text-xs font-black text-text-primary dark:text-dark-text-primary tracking-tight">
                Smart WMS
              </span>
            </div>
          </div>

          {/* Center Section: Global Command Search Trigger Bar */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-2 hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 sm:py-2.5 rounded-xl bg-bg-subtle/70 dark:bg-white/5 border border-border/60 dark:border-dark-border/40 text-text-tertiary hover:border-primary/40 hover:bg-white dark:hover:bg-dark-card transition-all duration-200 shadow-sm group"
            >
              <div className="flex items-center gap-2 text-xs font-medium truncate">
                <FiSearch className="size-4 text-text-tertiary group-hover:text-primary transition-colors flex-shrink-0" />
                <span className="truncate">Tìm nhanh sản phẩm, đơn hàng, trang…</span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-dark-card border border-border/40 dark:border-dark-border/40 px-2 py-0.5 rounded-lg text-[10px] font-black text-text-tertiary shadow-sm flex-shrink-0">
                <FiCommand className="size-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right Section: Action Controls */}
          <div className="flex items-center gap-x-2 sm:gap-x-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 sm:p-2.5 rounded-xl bg-bg-subtle dark:bg-white/5 text-text-secondary hover:text-primary transition-all active:scale-95"
              title="Tìm kiếm toàn hệ thống"
            >
              <FiSearch size={18} />
            </button>

            {/* Quick Action Shortcut Menu Button */}
            {(currentUser?.role === "admin" || currentUser?.role === "dev") && (
              <button
                onClick={() => navigate("/notifications?tab=create")}
                className="hidden sm:flex p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 items-center justify-center border border-primary/20 bg-primary/5 active:scale-90"
                title="Tạo thông báo mới"
              >
                <FiPlus size={18} />
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl bg-bg-subtle dark:bg-white/5 text-text-secondary hover:text-primary transition-all duration-300 relative overflow-hidden group border border-border/40 dark:border-dark-border/40 active:scale-95"
              title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              <div className="relative size-4 sm:size-5">
                <FiSun
                  className={cn(
                    "absolute inset-0 transition-all duration-500 transform",
                    isDark ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100 text-amber-500",
                  )}
                  size={18}
                />
                <FiMoon
                  className={cn(
                    "absolute inset-0 transition-all duration-500 transform",
                    isDark ? "rotate-0 opacity-100 scale-100 text-blue-400" : "-rotate-90 opacity-0 scale-0",
                  )}
                  size={18}
                />
              </div>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notiRef}>
              <button
                onClick={() => setNotiOpen((prev) => !prev)}
                className={cn(
                  "p-2 sm:p-2.5 rounded-xl transition-all duration-300 relative group active:scale-95",
                  notiOpen
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-bg-subtle dark:bg-white/5 text-text-secondary hover:bg-primary/5 hover:text-primary border border-border/40 dark:border-dark-border/40",
                )}
              >
                <FiBell
                  size={18}
                  className={cn(
                    "group-hover:rotate-12 transition-transform sm:w-5 sm:h-5",
                    !notiOpen && notifications.some((n) => !n.read) && "animate-wiggle",
                  )}
                />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-error rounded-full border-2 border-white dark:border-dark-card animate-pulse" />
                )}
              </button>

              <NotificationDropdown
                isOpen={notiOpen}
                onClose={() => setNotiOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onRefresh={fetchNotis}
              />
            </div>

            <div className="h-5 sm:h-6 w-px bg-border/40 dark:bg-dark-border/40" />

            {/* Settings Quick Access Link */}
            <button
              onClick={() => navigate("/settings")}
              className="p-2 sm:p-2.5 rounded-xl bg-bg-subtle dark:bg-white/5 text-text-secondary hover:text-primary transition-all duration-300 border border-border/40 dark:border-dark-border/40 active:scale-95 hidden sm:flex"
              title="Cài đặt hệ thống"
            >
              <FiSettings size={18} />
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-x-2 sm:gap-x-3">
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-x-2 sm:gap-x-3 cursor-pointer group"
                title="Thông tin cá nhân"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-text-primary dark:text-dark-text-primary group-hover:text-primary transition-colors tracking-tight leading-none mb-1">
                    {currentUser?.lastName} {currentUser?.firstName}
                  </p>
                  <Badge variant="primary" size="xs" className="uppercase font-black text-[8px] py-0 px-1">
                    {currentUser?.role}
                  </Badge>
                </div>
                <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-bg-subtle dark:bg-white/5 border border-border/50 dark:border-dark-border/40 p-0.5 group-hover:border-primary transition-all shadow-inner-sm overflow-hidden">
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt="Avatar"
                      className="size-full object-cover rounded-lg sm:rounded-xl"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-text-tertiary">
                      <FiUser size={18} />
                    </div>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 sm:p-2.5 rounded-xl bg-bg-subtle dark:bg-white/5 text-text-tertiary hover:text-error hover:bg-error/5 transition-all duration-300 border border-border/40 dark:border-dark-border/40 active:scale-95"
                title="Đăng xuất"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette / Fast Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Tìm Kiếm Nhanh Toàn Hệ Thống"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên trang, chức năng hoặc từ khóa…"
              className="w-full bg-bg-subtle/50 dark:bg-dark-card/60 border border-border/60 dark:border-dark-border/60 text-text-primary dark:text-dark-text-primary text-sm rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-semibold"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pt-2">
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider px-1">
              Gợi ý điều hướng nhanh
            </p>
            {filteredSearchResults.length === 0 ? (
              <div className="py-8 text-center opacity-40">
                <FiSearch className="size-8 mx-auto mb-2 text-text-tertiary" />
                <p className="text-xs font-bold uppercase">Không tìm thấy kết quả phù hợp</p>
              </div>
            ) : (
              filteredSearchResults.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 dark:hover:bg-white/5 cursor-pointer transition-all duration-200 group border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-bg-subtle dark:bg-white/5 text-text-secondary group-hover:text-primary group-hover:bg-white dark:group-hover:bg-dark-card transition-all">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-text-primary dark:text-dark-text-primary group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {item.category}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn rời khỏi hệ thống quản lý kho không? Phiên làm việc của bạn sẽ được kết thúc."
        confirmText="Đăng xuất"
        cancelText="Quay lại"
        variant="danger"
      />
    </>
  );
}

export default Header;
