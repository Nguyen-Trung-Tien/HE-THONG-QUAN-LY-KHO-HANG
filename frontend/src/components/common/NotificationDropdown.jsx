import React, { useState } from 'react';
import { FiBell, FiPackage, FiInfo, FiAlertCircle, FiCheckCircle, FiTrash2, FiArrowLeft, FiEye, FiPlus } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import Badge from './Badge';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { deleteNotification as deleteNotiApi } from '../../API/notificationApi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const NotificationDropdown = ({ isOpen, onClose, notifications, onMarkAsRead, onRefresh }) => {
  const navigate = useNavigate();
  const userRole = useSelector((state) => state.user.role);
  const [viewingNoti, setViewingNoti] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotiApi(id);
      toast.success("Đã xóa thông báo");
      if (viewingNoti?.id === id) setViewingNoti(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa");
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  const handleOpenDetail = (notification) => {
    setViewingNoti(notification);
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleCloseDetail = (e) => {
    e?.stopPropagation();
    setViewingNoti(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none" onClick={() => { setViewingNoti(null); onClose(); }} />
      <div className="fixed sm:absolute inset-x-3 sm:inset-auto sm:right-0 top-16 sm:top-full mt-2 w-auto sm:w-96 rounded-2xl sm:rounded-3xl shadow-2xl bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 dark:border-dark-border/40 bg-gradient-to-r from-bg-subtle/50 dark:from-white/[0.02] to-white dark:to-dark-card flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {viewingNoti ? (
              <button 
                onClick={handleCloseDetail}
                className="p-1.5 rounded-xl hover:bg-bg-subtle dark:hover:bg-white/5 text-text-tertiary hover:text-primary transition-all mr-1"
              >
                <FiArrowLeft size={16} />
              </button>
            ) : (
              <FiBell className="text-primary mr-1" size={16} />
            )}
            <h3 className="text-xs font-black text-text-primary dark:text-dark-text-primary uppercase tracking-widest">
              {viewingNoti ? "Chi tiết" : "Thông báo"}
            </h3>
            {!viewingNoti && (
              <Badge variant="primary" size="sm" className="rounded-lg">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
            {!viewingNoti && (userRole === 'admin' || userRole === 'dev') && (
              <button 
                onClick={() => { navigate('/notifications?tab=create'); onClose(); }}
                className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all ml-1.5 flex items-center justify-center"
                title="Tạo thông báo mới"
              >
                <FiPlus size={14} />
              </button>
            )}
          </div>
          {!viewingNoti ? (
            <button 
              onClick={() => notifications.forEach(n => !n.read && onMarkAsRead(n.id))}
              className="text-[10px] font-black text-primary uppercase hover:underline"
            >
              Đọc tất cả
            </button>
          ) : (
            (userRole === 'admin' || userRole === 'dev') && (
              <button 
                onClick={(e) => handleDelete(e, viewingNoti.id)}
                className="p-1.5 rounded-xl hover:bg-error/10 text-text-tertiary hover:text-error transition-all"
              >
                <FiTrash2 size={16} />
              </button>
            )
          )}
        </div>

        {/* List or Detail View */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {viewingNoti ? (
            <div className="p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    viewingNoti.type === 'stock' ? "bg-warning/10 text-warning" :
                    viewingNoti.type === 'order' ? "bg-success/10 text-success" :
                    viewingNoti.type === 'alert' ? "bg-error/10 text-error" : "bg-info/10 text-info"
                  )}>
                    {viewingNoti.type === 'stock' && <FiPackage size={18} />}
                    {viewingNoti.type === 'order' && <FiCheckCircle size={18} />}
                    {viewingNoti.type === 'alert' && <FiAlertCircle size={18} />}
                    {viewingNoti.type === 'info' && <FiInfo size={18} />}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-text-primary dark:text-dark-text-primary uppercase tracking-tight leading-tight">
                      {viewingNoti.title}
                    </h4>
                    <p className="text-[9px] text-text-tertiary dark:text-dark-text-tertiary font-bold uppercase tracking-tighter">
                      {new Date(viewingNoti.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
               </div>
               
               <div className="p-4 rounded-2xl bg-bg-subtle/50 dark:bg-white/[0.02] border border-border/30 dark:border-dark-border/40">
                  <p className="text-xs text-text-secondary font-semibold leading-relaxed whitespace-pre-wrap">
                    {viewingNoti.message}
                  </p>
               </div>
               
               <Button 
                variant="outline" 
                size="sm" 
                className="w-full dark:border-white/10 dark:text-dark-text-primary"
                onClick={handleCloseDetail}
               >
                Quay lại danh sách
               </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
              <FiBell size={40} className="mb-3" />
              <p className="text-xs font-black uppercase tracking-widest">Không có thông báo mới</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30 dark:divide-dark-border/40">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleOpenDetail(notification)}
                  className={cn(
                    "p-5 flex items-start space-x-4 cursor-pointer transition-all duration-300 hover:bg-bg-subtle/50 dark:hover:bg-white/5 group/item",
                    !notification.read && "bg-primary/[0.02] dark:bg-primary/[0.05]"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    notification.type === 'stock' ? "bg-warning/10 text-warning" :
                    notification.type === 'order' ? "bg-success/10 text-success" :
                    notification.type === 'alert' ? "bg-error/10 text-error" : "bg-info/10 text-info"
                  )}>
                    {notification.type === 'stock' && <FiPackage size={18} />}
                    {notification.type === 'order' && <FiCheckCircle size={18} />}
                    {notification.type === 'alert' && <FiAlertCircle size={18} />}
                    {notification.type === 'info' && <FiInfo size={18} />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-text-primary dark:text-dark-text-primary uppercase tracking-tight">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                        {(userRole === 'admin' || userRole === 'dev') && (
                          <button 
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="opacity-0 group-hover/item:opacity-100 p-1 text-text-tertiary hover:text-error transition-all"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-text-secondary dark:text-dark-text-secondary font-medium leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                       <p className="text-[9px] text-text-tertiary dark:text-dark-text-tertiary font-bold uppercase tracking-tighter">
                        {new Date(notification.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                      {notification.message.length > 60 && (
                        <span className="text-[9px] font-black text-primary uppercase tracking-tighter flex items-center">
                          <FiEye className="mr-1" /> Chi tiết
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!viewingNoti && (
          <div className="p-3 border-t border-border/50 dark:border-dark-border/40 bg-bg-subtle/20 dark:bg-white/[0.02] text-center">
            <button 
              onClick={handleViewAll}
              className="text-[10px] font-black text-text-tertiary uppercase tracking-widest hover:text-primary transition-colors"
            >
              Xem tất cả thông báo
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;


