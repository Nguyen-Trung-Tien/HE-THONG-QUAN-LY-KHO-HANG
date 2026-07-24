import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getAllNotifications, markAsRead, deleteNotification } from '../API/notificationApi';
import Card from './common/Card';
import Badge from './common/Badge';
import Button from './common/Button';
import Modal from './common/Modal';
import { FiBell, FiPackage, FiInfo, FiAlertCircle, FiCheckCircle, FiTrash2, FiEye, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { cn } from '../utils/cn';
import { toast } from 'react-toastify';
import ConfirmModal from './common/ConfirmModal';
import CreateNotificationForm from './Admin/CreateNotification';
import { useNavigate, useLocation } from 'react-router-dom';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('inbox');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [viewingNoti, setViewingNoti] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userRole = useSelector((state) => state.user.role);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const res = await getAllNotifications(currentUser.id);
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    if (tab === 'create' && (userRole === 'admin' || userRole === 'dev')) {
      setActiveTab('create');
    } else {
      setActiveTab('inbox');
    }
  }, [location.search, userRole]);

  useEffect(() => {
    if (activeTab === 'inbox') {
      fetchNotifications();
    }
  }, [fetchNotifications, activeTab]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleViewDetails = (notification) => {
    setViewingNoti(notification);
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteNotification(deleteId);
      setNotifications(prev => prev.filter(n => n.id !== deleteId));
      if (viewingNoti?.id === deleteId) setViewingNoti(null);
      toast.success("Đã xóa thông báo");
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Lỗi khi xóa thông báo");
    } finally {
      setDeleteId(null);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stock': return <FiPackage size={18} />;
      case 'order': return <FiCheckCircle size={18} />;
      case 'alert': return <FiAlertCircle size={18} />;
      default: return <FiInfo size={18} />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'stock': return "bg-warning/10 text-warning";
      case 'order': return "bg-success/10 text-success";
      case 'alert': return "bg-error/10 text-error";
      default: return "bg-info/10 text-info";
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'stock': return "Kho hàng";
      case 'order': return "Đơn hàng";
      case 'alert': return "Cảnh báo";
      default: return "Hệ thống";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Badge variant="primary" className="mb-1">Hộp thư</Badge>
          <h1 className="heading-1">
            Quản lý thông báo
          </h1>
          <p className="subheading">Xem và quản lý các thông báo từ hệ thống</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-2xl"
            onClick={() => navigate(-1)}
            leftIcon={<FiArrowLeft />}
          >
            Quay lại
          </Button>
          <div className="bg-bg-subtle/50 p-1 rounded-2xl border border-border/40 flex flex-1 sm:flex-initial">
             <button 
              onClick={() => setActiveTab('inbox')}
              className={cn(
                "flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                activeTab === 'inbox' ? "bg-white text-primary shadow-sm" : "text-text-tertiary hover:text-primary"
              )}
             >
               Hộp thư ({notifications.filter(n => !n.read).length})
             </button>
             {(userRole === 'admin' || userRole === 'dev') && (
               <button 
                onClick={() => setActiveTab('create')}
                className={cn(
                  "flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  activeTab === 'create' ? "bg-white text-primary shadow-sm" : "text-text-tertiary hover:text-primary"
                )}
               >
                 Tạo thông báo
               </button>
             )}
          </div>
          {activeTab === 'inbox' && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-2xl"
              onClick={fetchNotifications} 
              leftIcon={<FiRefreshCw className={cn(loading && "animate-spin")} />}
            >
              Làm mới
            </Button>
          )}
        </div>
      </div>

      <Card className="min-h-[500px]">
        {activeTab === 'inbox' ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
              <FiRefreshCw size={40} className="animate-spin mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">Đang tải dữ liệu...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <FiBell size={60} className="mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Bạn không có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30 -mx-5 sm:-mx-8">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-6 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300 hover:bg-bg-subtle/30 cursor-pointer",
                    !notification.read && "bg-primary/[0.01] border-l-4 border-l-primary"
                  )}
                  onClick={() => handleViewDetails(notification)}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    getTypeStyles(notification.type)
                  )}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <h4 className={cn(
                          "text-sm uppercase tracking-tight",
                          notification.read ? "font-bold text-text-secondary" : "font-black text-text-primary"
                        )}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter whitespace-nowrap bg-bg-subtle px-2 py-1 rounded-lg">
                        {new Date(notification.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "text-xs leading-relaxed line-clamp-2",
                      notification.read ? "text-text-tertiary font-medium" : "text-text-secondary font-semibold"
                    )}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-3 pt-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => handleViewDetails(notification)}
                        className="flex items-center space-x-1.5 text-[10px] font-black text-primary uppercase hover:underline"
                      >
                        <FiEye size={12} />
                        <span>Xem chi tiết</span>
                      </button>
                      {(userRole === 'admin' || userRole === 'dev') && (
                        <button 
                          onClick={() => setDeleteId(notification.id)}
                          className="flex items-center space-x-1.5 text-[10px] font-black text-error uppercase hover:underline"
                        >
                          <FiTrash2 size={12} />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <CreateNotificationForm onSuccess={() => setActiveTab('inbox')} />
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={!!viewingNoti}
        onClose={() => setViewingNoti(null)}
        title="Chi tiết thông báo"
        size="md"
        footer={
          <div className="flex justify-between items-center w-full">
            <Badge variant={viewingNoti?.type || 'info'} className="px-3">
              {getTypeText(viewingNoti?.type)}
            </Badge>
            {(userRole === 'admin' || userRole === 'dev') && viewingNoti && (
              <Button 
                variant="danger" 
                size="sm" 
                leftIcon={<FiTrash2 />}
                onClick={() => {
                  setDeleteId(viewingNoti.id);
                }}
              >
                Xóa thông báo
              </Button>
            )}
          </div>
        }
      >
        {viewingNoti && (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
               <div className={cn(
                  "w-14 h-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-lg",
                  getTypeStyles(viewingNoti.type)
                )}>
                  {React.cloneElement(getTypeIcon(viewingNoti.type), { size: 24 })}
                </div>
                <div className="space-y-1">
                   <h2 className="text-xl font-black text-text-primary tracking-tighter uppercase leading-tight">
                     {viewingNoti.title}
                   </h2>
                   <p className="text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                     Đã nhận: {new Date(viewingNoti.createdAt).toLocaleString("vi-VN")}
                   </p>
                </div>
            </div>
            
            <div className="p-6 rounded-[2rem] bg-bg-subtle/30 border border-border/40 shadow-inner-sm">
               <p className="text-sm text-text-secondary font-semibold leading-relaxed whitespace-pre-wrap">
                 {viewingNoti.message}
               </p>
            </div>

            {viewingNoti.type === 'stock' && (
              <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20 flex items-center space-x-3">
                <FiAlertCircle className="text-warning" />
                <p className="text-[10px] text-warning font-bold uppercase tracking-tight">Vui lòng kiểm tra lại kho hàng sớm nhất có thể.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa thông báo này không? Thao tác này không thể hoàn tác."
        confirmText="Xóa vĩnh viễn"
        variant="danger"
      />
    </div>
  );
};

export default NotificationsPage;
