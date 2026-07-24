import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import Badge from './common/Badge';
import { 
  FiSettings, 
  FiBell, 
  FiLock, 
  FiDatabase, 
  FiGlobe, 
  FiEye, 
  FiMoon, 
  FiSun,
  FiSave,
  FiShield,
  FiKey,
  FiSmartphone,
  FiDownload,
  FiRefreshCw,
  FiArrowLeft,
  FiLogOut,
  FiActivity
} from 'react-icons/fi';
import { cn } from '../utils/cn';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChangePassword, GetDetailUser, UpdatePreferences } from '../API/user/userApi';
import TwoFactorSetupModal from './Admin/TwoFactorSetupModal';
import PinSetupModal from './Admin/PinSetupModal';
import axiosInstance from '../API/utils/axiosInstance';
import { login } from '../redux/slice/userSlice';

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const userRole = useSelector((state) => state.user.role);
  const currentUser = useSelector((state) => state.user.currentUser);

  // Security & Advanced state
  const [is2FAShowing, setIs2FAShowing] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(currentUser?.is2FAEnabled || false);
  const [isPinShowing, setIsPinShowing] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(currentUser?.isPinEnabled || false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Database state
  const [dbStatus, setDbStatus] = useState({ loading: true, success: false, message: "", details: null });

  const [settings, setSettings] = useState({
    systemName: currentUser?.systemName || "Smart WMS Pro",
    theme: currentUser?.preferredTheme || "light",
    notifications: {
      email: currentUser?.notifEmail !== undefined ? currentUser.notifEmail : true,
      browser: currentUser?.notifBrowser !== undefined ? currentUser.notifBrowser : true,
      stockAlert: currentUser?.notifStockAlert !== undefined ? currentUser.notifStockAlert : true,
    },
    backup: {
      autoBackup: true,
      frequency: "daily"
    }
  });

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSessions();
    }
    if (activeTab === 'database') {
      checkDBConnection();
    }
  }, [activeTab]);

  useEffect(() => {
    const currentTheme = currentUser?.preferredTheme || localStorage.getItem("theme") || "light";
    setSettings((prev) => (prev.theme !== currentTheme ? { ...prev, theme: currentTheme } : prev));
  }, [currentUser?.preferredTheme]);

  useEffect(() => {
    // Apply theme on component load or setting change
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleThemeChange = (newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("theme", newTheme);
    if (currentUser) {
      const updatedUser = { ...currentUser, preferredTheme: newTheme };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(login(updatedUser));
    }
  };

  const checkDBConnection = async () => {
    setDbStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await axiosInstance.get('/backup/check-connection');
      if (res.data.success) {
        setDbStatus({ loading: false, success: true, message: res.data.message, details: res.data });
      }
    } catch (err) {
      setDbStatus({ loading: false, success: false, message: "Không thể kết nối cơ sở dữ liệu", details: null });
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await axiosInstance.get('/user/sessions');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'general', label: 'Chung', icon: <FiSettings /> },
    { id: 'notifications', label: 'Thông báo', icon: <FiBell /> },
    { id: 'security', label: 'Bảo mật', icon: <FiLock /> },
    { id: 'database', label: 'Dữ liệu', icon: <FiDatabase /> },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Persist to Backend
      const res = await UpdatePreferences({
        notifEmail: settings.notifications.email,
        notifBrowser: settings.notifications.browser,
        notifStockAlert: settings.notifications.stockAlert,
        preferredTheme: settings.theme,
        systemName: settings.systemName,
      });

      if (res.errCode === 0) {
        // 2. Update Local Store & Redux
        const updatedUser = { 
          ...currentUser,
          notifEmail: settings.notifications.email,
          notifBrowser: settings.notifications.browser,
          notifStockAlert: settings.notifications.stockAlert,
          preferredTheme: settings.theme,
          systemName: settings.systemName,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("theme", settings.theme);
        dispatch(login(updatedUser));
        
        toast.success("Lưu thay đổi thành công!");
      } else {
        toast.error(res.message || "Lỗi khi lưu cấu hình");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống khi lưu cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSQL = async () => {
    toast.info("Đang chuẩn bị dữ liệu SQL...");
    try {
        const response = await axiosInstance.get('/backup/export-sql', {
            responseType: 'blob',
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `smart_wms_backup_${new Date().toLocaleDateString()}.sql`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Đã xuất file SQL thành công!");
    } catch (error) {
        toast.error("Lỗi khi xuất SQL");
    }
  };

  const handleBackup = async () => {
    toast.info("Đang thực hiện sao lưu toàn bộ hệ thống...");
    try {
        const res = await axiosInstance.post('/backup/create');
        if (res.data.success) {
            toast.success(`${res.data.message} (${res.data.size})`);
        }
    } catch (error) {
        toast.error("Lỗi khi tạo bản sao lưu");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await ChangePassword({
        id: currentUser?.id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.errCode === 0) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.errMessage || "Lỗi đổi mật khẩu!");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi đổi mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
       setLoading(true);
       try {
         const res = await axiosInstance.post('/2fa/disable');
         if (res.data.success) {
           toast.success("Đã vô hiệu hóa bảo mật 2 lớp");
           setIs2FAEnabled(false);
           updateUserSync();
         }
       } catch (err) {
         toast.error("Lỗi khi vô hiệu hóa 2FA");
       } finally {
         setLoading(false);
       }
    } else {
      setIs2FAShowing(true);
    }
  };

  const handleTogglePin = async () => {
    if (isPinEnabled) {
      setLoading(true);
      try {
        const res = await axiosInstance.post('/pin/disable');
        if (res.data.success) {
          toast.success("Đã hủy kích hoạt mã PIN");
          setIsPinEnabled(false);
          updateUserSync();
        }
      } catch (err) {
        toast.error("Lỗi khi hủy kích hoạt PIN");
      } finally {
        setLoading(false);
      }
    } else {
      setIsPinShowing(true);
    }
  };

  const updateUserSync = async () => {
    try {
      const res = await GetDetailUser(currentUser.id);
      if (res.errCode === 0 && res.users.length > 0) {
        const data = res.users[0];
        const updatedLocal = { 
            ...currentUser, 
            is2FAEnabled: data.is2FAEnabled,
            isPinEnabled: data.isPinEnabled,
            notifEmail: data.notifEmail,
            notifBrowser: data.notifBrowser,
            notifStockAlert: data.notifStockAlert,
            preferredTheme: data.preferredTheme,
            systemName: data.systemName
        };
        localStorage.setItem("user", JSON.stringify(updatedLocal));
        dispatch(login(updatedLocal));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutSession = async (id) => {
    try {
        const res = await axiosInstance.delete(`/user/sessions/${id}`);
        if (res.data.success) {
          toast.success("Đã đăng xuất thiết bị từ xa");
          fetchSessions();
        }
    } catch (err) {
        toast.error("Lỗi khi đăng xuất thiết bị");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Badge variant="primary" className="mb-1">Hệ thống</Badge>
          <h1 className="heading-1">
            Cài đặt
          </h1>
          <p className="subheading">
            Smart Warehouse Management System
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate(-1)}
          leftIcon={<FiArrowLeft />}
          className="rounded-2xl"
        >
          Quay lại
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-white dark:bg-dark-card text-text-tertiary hover:bg-primary/5 hover:text-primary border border-border/40 dark:border-dark-border/40"
              )}
            >
              <span className={cn("size-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-white" : "text-primary/60")}>
                {tab.icon}
              </span>
              <span className="text-xs font-black uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card className="shadow-soft-2xl border-white/40 dark:border-dark-border/40">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/40 dark:border-dark-border/40">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FiGlobe className="size-4" />
                  </div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Tổng quan</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Tên hệ thống" 
                    value={settings.systemName}
                    onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                  />
                  <div className="space-y-4">
                   <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center space-x-1">
                      <span>Giao diện</span>
                      <div className="w-1 h-1 rounded-full bg-primary/40" />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                        onClick={() => handleThemeChange('light')}
                        className={cn(
                          "flex items-center justify-center space-x-2.5 p-4 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden",
                          settings.theme === 'light' 
                            ? "border-primary bg-primary/5 shadow-soft-md scale-[1.02]" 
                            : "border-border/40 dark:border-dark-border/40 bg-white dark:bg-dark-card hover:border-primary/30 hover:bg-bg-subtle dark:hover:bg-white/5"
                        )}
                       >
                          <FiSun className={cn("size-5 transition-all duration-500", settings.theme === 'light' ? "text-amber-500 rotate-0 scale-110" : "text-text-tertiary -rotate-45")} />
                          <span className={cn("font-black text-[10px] uppercase tracking-widest transition-colors", settings.theme === 'light' ? "text-primary" : "text-text-tertiary")}>Chế độ sáng</span>
                          {settings.theme === 'light' && <div className="absolute top-2 right-2 size-1.5 bg-primary rounded-full animate-pulse" />}
                       </button>
                       <button 
                        onClick={() => handleThemeChange('dark')}
                        className={cn(
                          "flex items-center justify-center space-x-2.5 p-4 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden",
                          settings.theme === 'dark' 
                            ? "border-primary bg-primary/5 shadow-soft-md scale-[1.02]" 
                            : "border-border/40 dark:border-dark-border/40 bg-white dark:bg-dark-card hover:border-primary/30 hover:bg-bg-subtle dark:hover:bg-white/5"
                        )}
                       >
                          <FiMoon className={cn("size-5 transition-all duration-500", settings.theme === 'dark' ? "text-blue-400 rotate-0 scale-110" : "text-text-tertiary 45deg")} />
                          <span className={cn("font-black text-[10px] uppercase tracking-widest transition-colors", settings.theme === 'dark' ? "text-primary" : "text-text-tertiary")}>Chế độ tối</span>
                          {settings.theme === 'dark' && <div className="absolute top-2 right-2 size-1.5 bg-primary rounded-full animate-pulse" />}
                       </button>
                    </div>                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/40 dark:border-dark-border/40">
                  <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center text-success">
                    <FiBell className="size-4" />
                  </div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Thông báo</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Thông báo qua Email', desc: 'Nhận báo cáo tổng hợp và cảnh báo qua hòm thư.' },
                    { id: 'browser', label: 'Thông báo trình duyệt', desc: 'Hiển thị popup thông báo trực tiếp khi đang sử dụng.' },
                    { id: 'stockAlert', label: 'Cảnh báo tồn kho thấp', desc: 'Tự động gửi cảnh báo khi hàng hóa dưới mức tối thiểu.' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-bg-subtle/20 dark:bg-white/[0.02] border border-border/30 dark:border-dark-border/40 hover:border-primary/20 transition-all">
                      <div>
                        <h4 className="text-xs font-black text-text-primary uppercase tracking-tight mb-1">{item.label}</h4>
                        <p className="text-[10px] text-text-tertiary font-medium">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.notifications[item.id]}
                          onChange={(e) => setSettings({
                            ...settings, 
                            notifications: {...settings.notifications, [item.id]: e.target.checked}
                          })}
                        />
                        <div className="w-11 h-6 bg-border/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner-sm"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/40 dark:border-dark-border/40">
                  <div className="w-8 h-8 rounded-xl bg-error/10 flex items-center justify-center text-error">
                    <FiShield className="size-4" />
                  </div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Bảo mật</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-5 rounded-2xl bg-bg-subtle/40 dark:bg-white/[0.02] border border-border/40 dark:border-dark-border/40 flex items-center justify-between group hover:border-primary/30 transition-all">
                      <div className="flex items-center space-x-4">
                         <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            is2FAEnabled ? "bg-success text-white shadow-lg shadow-success/20" : "bg-primary/10 text-primary"
                         )}>
                            <FiSmartphone size={18} />
                         </div>
                         <div>
                            <h4 className="text-[11px] font-black uppercase tracking-tighter">Xác thực 2 lớp</h4>
                            <p className="text-[9px] text-text-tertiary font-bold">{is2FAEnabled ? "Đã kích hoạt" : "Chưa kích hoạt"}</p>
                         </div>
                      </div>
                      <Button 
                        variant={is2FAEnabled ? "outline" : "primary"} 
                        className="h-8 px-4 text-[9px] rounded-lg"
                        onClick={handleToggle2FA}
                        disabled={loading}
                      >
                        {is2FAEnabled ? "Vô hiệu hóa" : "Kích hoạt"}
                      </Button>
                   </div>
                   <div className="p-5 rounded-2xl bg-bg-subtle/40 dark:bg-white/[0.02] border border-border/40 dark:border-dark-border/40 flex items-center justify-between group hover:border-primary/30 transition-all shadow-inner-sm">
                      <div className="flex items-center space-x-4">
                         <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isPinEnabled ? "bg-success text-white shadow-lg shadow-success/20" : "bg-primary/10 text-primary"
                         )}>
                            <FiKey size={18} />
                         </div>
                         <div>
                            <h4 className="text-[11px] font-black uppercase tracking-tighter">Mã PIN bảo mật</h4>
                            <p className="text-[9px] text-text-tertiary font-bold">{isPinEnabled ? "Đã thiết lập" : "Chưa thiết lập"}</p>
                         </div>
                      </div>
                      <Button 
                        variant={isPinEnabled ? "outline" : "primary"} 
                        className="h-8 px-4 text-[9px] rounded-lg"
                        onClick={handleTogglePin}
                        disabled={loading}
                      >
                        {isPinEnabled ? "Hủy bỏ" : "Thiết lập"}
                      </Button>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex items-center space-x-2 ml-2 mb-2">
                      <FiLock className="text-primary size-3" />
                      <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">Thay đổi mật khẩu</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input 
                        type="password" 
                        placeholder="Mật khẩu cũ" 
                        className="h-10" 
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      />
                      <Input 
                        type="password" 
                        placeholder="Mật khẩu mới" 
                        className="h-10" 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                      <Input 
                        type="password" 
                        placeholder="Xác nhận mật khẩu" 
                        className="h-10" 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                   </div>
                   <div className="flex justify-end mt-2">
                      <Button 
                        onClick={handleChangePassword} 
                        isLoading={loading}
                        className="h-10 text-[10px] rounded-xl px-8"
                      >
                        Cập nhật mật khẩu
                      </Button>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] ml-2">Các phiên đăng nhập gần đây</h4>
                   <div className="space-y-2">
                      {sessions.length === 0 ? (
                        <div className="p-10 text-center text-text-tertiary opacity-30">
                           <FiRefreshCw size={24} className="animate-spin mx-auto mb-2" />
                           <p className="text-[9px] font-black uppercase">Đang tải dữ liệu phiên...</p>
                        </div>
                      ) : sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-border/30 dark:border-dark-border/40 bg-white dark:bg-dark-card shadow-sm hover:shadow-md transition-shadow group">
                           <div className="flex items-center space-x-3">
                              <div className={cn("size-2 rounded-full", session.current ? "bg-success animate-pulse" : "bg-text-tertiary")} />
                              <div>
                                 <p className="text-xs font-black text-text-primary uppercase tracking-tighter">{session.device}</p>
                                 <p className="text-[9px] text-text-tertiary font-bold">{session.location} • {session.ipAddress} • {new Date(session.time).toLocaleString("vi-VN")}</p>
                              </div>
                           </div>
                           {!session.current && (
                            <button 
                              onClick={() => handleLogoutSession(session.id)}
                              className="text-[9px] font-black text-error uppercase hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Đăng xuất thiết bị
                            </button>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/40 dark:border-dark-border/40">
                  <div className="w-8 h-8 rounded-xl bg-info/10 flex items-center justify-center text-info">
                    <FiDatabase className="size-4" />
                  </div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Dữ liệu</h3>
                </div>

                <div className={cn(
                    "p-6 rounded-2xl flex items-start space-x-4 border transition-all duration-500",
                    dbStatus.loading ? "bg-bg-subtle/50 dark:bg-white/[0.02] border-border/40 dark:border-dark-border/40" :
                    dbStatus.success ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"
                )}>
                  <div className={cn(
                      "p-2 rounded-lg mt-1 transition-colors",
                      dbStatus.loading ? "bg-bg-subtle dark:bg-white/[0.05] text-text-tertiary" :
                      dbStatus.success ? "bg-success/10 text-success" : "bg-error/10 text-error"
                  )}>
                    {dbStatus.loading ? <FiRefreshCw className="animate-spin" /> : <FiActivity />}
                  </div>
                  <div>
                    <h4 className={cn(
                        "text-xs font-black uppercase tracking-tight mb-1",
                        dbStatus.success ? "text-success" : "text-error"
                    )}>
                        {dbStatus.loading ? "Đang kiểm tra..." : dbStatus.message}
                    </h4>
                    {!dbStatus.loading && dbStatus.success && (
                        <p className="text-[10px] text-text-secondary font-medium leading-relaxed">
                            Hệ thống: <span className="font-bold text-text-primary uppercase">{dbStatus.details?.dialect}</span> | 
                            Database: <span className="font-bold text-text-primary uppercase">{dbStatus.details?.database}</span>
                        </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                   <button 
                    onClick={handleExportSQL}
                    className="flex flex-col items-center justify-center space-y-3 p-8 rounded-[2rem] border-2 border-dashed border-border/60 dark:border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                   >
                      <div className="w-12 h-12 rounded-2xl bg-bg-subtle dark:bg-white/[0.05] flex items-center justify-center text-text-tertiary group-hover:scale-110 group-hover:text-primary transition-all shadow-inner-sm">
                        <FiDownload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-tighter">Xuất toàn bộ SQL</p>
                        <p className="text-[9px] text-text-tertiary font-bold mt-1">Tải xuống cấu trúc và dữ liệu (.sql)</p>
                      </div>
                   </button>
                   <button 
                    onClick={handleBackup}
                    className="flex flex-col items-center justify-center space-y-3 p-8 rounded-[2rem] border-2 border-dashed border-border/60 dark:border-white/10 hover:border-success/40 hover:bg-success/5 transition-all group"
                   >
                      <div className="w-12 h-12 rounded-2xl bg-bg-subtle dark:bg-white/[0.05] flex items-center justify-center text-text-tertiary group-hover:scale-110 group-hover:text-success transition-all shadow-inner-sm">
                        <FiRefreshCw size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-tighter">Sao lưu tức thời</p>
                        <p className="text-[9px] text-text-tertiary font-bold mt-1">Tạo điểm khôi phục JSON ngay bây giờ</p>
                      </div>
                   </button>
                </div>
              </div>
            )}

            {activeTab !== 'security' && activeTab !== 'database' && (
              <div className="mt-10 pt-6 border-t border-border/40 dark:border-dark-border/40 flex justify-end">
                <Button 
                  onClick={handleSave}
                  isLoading={loading}
                  className="h-12 px-10 shadow-primary/30"
                  leftIcon={<FiSave />}
                >
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <TwoFactorSetupModal 
        isOpen={is2FAShowing} 
        onClose={() => setIs2FAShowing(false)}
        onSuccess={() => {
          setIs2FAEnabled(true);
          updateUserSync();
        }}
      />

      <PinSetupModal
        isOpen={isPinShowing}
        onClose={() => setIsPinShowing(false)}
        onSuccess={() => {
          setIsPinEnabled(true);
          updateUserSync();
        }}
      />
    </div>
  );
};

export default Settings;
