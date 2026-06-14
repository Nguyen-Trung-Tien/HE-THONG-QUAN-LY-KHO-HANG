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
  FiSettings,
  FiUser,
  FiBell,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import Badge from "./common/Badge";
import ConfirmModal from "./common/ConfirmModal";
import { cn } from "../utils/cn";

function Header({ onOpenSidebar }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const notiRef = useRef(null);

  const toggleTheme = async () => {
    const newTheme = currentUser?.preferredTheme === "dark" ? "light" : "dark";

    // Update Local and Redux first for instant feel
    const updatedUser = { ...currentUser, preferredTheme: newTheme };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("theme", newTheme);
    dispatch(login(updatedUser));

    // Persist to DB
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        // Handled by NotificationDropdown's own click away
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    try {
      await UserLogout();
      dispatch(resetUser());
      toast.success("Đăng xuất thành công!");
      navigate("/sign-in");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-border/50 dark:border-dark-border/40 h-20 shadow-sm transition-all duration-500 px-4 sm:px-10">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-xl bg-bg-subtle text-text-secondary hover:text-primary transition-all"
            >
              <RiMenu2Fill size={20} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.3em] leading-none mb-1">
                System Platform
              </h2>
              <p className="text-xs font-black text-text-primary uppercase tracking-tighter">
                Control Panel <span className="text-primary">v3.6</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-bg-subtle dark:bg-white/5 text-text-secondary hover:text-primary transition-all duration-300 relative overflow-hidden group border border-border/40 dark:border-dark-border/40"
              title={
                currentUser?.preferredTheme === "dark"
                  ? "Chuyển sang chế độ sáng"
                  : "Chuyển sang chế độ tối"
              }
            >
              <div className="relative size-4">
                <FiSun
                  className={cn(
                    "absolute inset-0 transition-all duration-500 transform",
                    currentUser?.preferredTheme === "dark"
                      ? "rotate-90 opacity-0 scale-0"
                      : "rotate-0 opacity-100 scale-100 text-amber-500",
                  )}
                  size={16}
                />
                <FiMoon
                  className={cn(
                    "absolute inset-0 transition-all duration-500 transform",
                    currentUser?.preferredTheme === "dark"
                      ? "rotate-0 opacity-100 scale-100 text-blue-400"
                      : "-rotate-90 opacity-0 scale-0",
                  )}
                  size={16}
                />
              </div>
            </button>

            {(currentUser?.role === "admin" || currentUser?.role === "dev") && (
              <button
                onClick={() => navigate("/notifications?tab=create")}
                className="hidden sm:flex p-2 text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 items-center justify-center border border-primary/20 bg-primary/5 active:scale-90"
                title="Tạo thông báo mới"
              >
                <FiPlus size={18} />
              </button>
            )}

            <div className="relative" ref={notiRef}>
              <button
                onClick={() => setNotiOpen((prev) => !prev)}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 relative group",
                  notiOpen
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-bg-subtle dark:bg-white/5 text-text-secondary hover:bg-primary/5 hover:text-primary border border-border/40 dark:border-dark-border/40",
                )}
              >
                <FiBell
                  size={20}
                  className={cn(
                    "group-hover:rotate-12 transition-transform",
                    !notiOpen &&
                      notifications.some((n) => !n.read) &&
                      "animate-wiggle",
                  )}
                />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-2 right-2 size-2 bg-error rounded-full border-2 border-white dark:border-dark-card animate-pulse" />
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

            <div className="w-px h-8 bg-border/40 dark:border-dark-border/40 hidden sm:block" />

            <div className="flex items-center gap-x-3 sm:gap-x-5">
              <div
                className="flex items-center gap-x-1.5 sm:gap-x-3 group cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[11px] font-black text-text-primary uppercase tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">
                    {currentUser?.lastName} {currentUser?.firstName}
                  </span>
                  <Badge
                    variant="primary"
                    size="sm"
                    className="px-2 py-0.5 rounded-lg text-[9px] font-black border-none shadow-none group-hover:bg-primary group-hover:text-white transition-all"
                  >
                    {currentUser?.role}
                  </Badge>
                </div>
                <div className="size-10 rounded-2xl bg-bg-subtle dark:bg-white/5 border border-border/50 dark:border-dark-border/40 p-0.5 group-hover:border-primary transition-all shadow-inner-sm overflow-hidden">
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt="Avatar"
                      className="size-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-text-tertiary">
                      <FiUser size={20} />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-bg-subtle dark:bg-white/5 text-text-tertiary hover:text-error hover:bg-error/5 transition-all duration-300 border border-border/40 dark:border-dark-border/40"
                title="Đăng xuất"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
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
