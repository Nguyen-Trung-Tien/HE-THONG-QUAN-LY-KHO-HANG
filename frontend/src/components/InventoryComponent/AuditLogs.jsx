import React, { useEffect, useState, useCallback } from "react";
import { getInventoryLogs } from "../../API/inventory/inventoryAPI";
import Badge from "../common/Badge";
import Card from "../common/Card";
import { FiRefreshCw, FiClock, FiActivity } from "react-icons/fi";
import { cn } from "../../utils/cn";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventoryLogs(filterType ? { type: filterType } : {});
      setLogs(data || []);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử hoạt động:", error);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getTypeBadge = (type) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "IMPORT": return <Badge variant="success" size="sm">Nhập kho</Badge>;
      case "EXPORT": return <Badge variant="error" size="sm">Xuất kho</Badge>;
      case "ADJUST": return <Badge variant="warning" size="sm">Điều chỉnh</Badge>;
      case "CREATE": return <Badge variant="info" size="sm">Tạo mới</Badge>;
      case "UPDATE": return <Badge variant="primary" size="sm">Cập nhật</Badge>;
      default: return <Badge variant="neutral" size="sm">{type}</Badge>;
    }
  };

  return (
    <Card 
      title="Lịch sử hoạt động hệ thống" 
      extra={
        <div className="flex items-center space-x-3 scale-90 sm:scale-100">
            <select
              className="bg-bg-subtle dark:bg-white/5 border border-border/40 dark:border-dark-border/40 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-inner-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="" className="dark:bg-dark-card">Tất cả thao tác</option>
              <option value="IMPORT" className="dark:bg-dark-card">Nhập kho</option>
              <option value="EXPORT" className="dark:bg-dark-card">Xuất kho</option>
              <option value="ADJUST" className="dark:bg-dark-card">Điều chỉnh</option>
            </select>
            <button
              onClick={fetchLogs}
              className="p-2.5 bg-bg-subtle dark:bg-white/5 text-text-tertiary hover:text-primary rounded-xl border border-border/40 dark:border-dark-border/40 transition-all active:scale-90"
              title="Làm mới"
            >
              <FiRefreshCw className={cn(loading && "animate-spin")} size={16} />
            </button>
        </div>
      }
      className="mt-8 shadow-soft-xl"
      noPadding
    >
      <div className="p-0">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-bg-subtle/50 dark:from-white/[0.01] to-white dark:to-dark-card">
                {["Thời gian", "Thao tác", "Mã SP", "Số lượng", "Người thực hiện", "Ghi chú"].map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[10px] font-black text-text-tertiary uppercase tracking-widest border-b border-border/30 dark:border-dark-border/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 dark:divide-dark-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={`cell-${j}`} className="px-8 py-6">
                        <div className="h-3 bg-bg-subtle dark:bg-white/[0.03] rounded-full w-full opacity-50" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-y-3 opacity-40">
                      <FiActivity size={48} />
                      <p className="text-xs font-black uppercase tracking-widest">Không có dữ liệu lịch sử</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-primary/[0.02] dark:hover:bg-white/[0.01] transition-all duration-300">
                    <td className="px-8 py-6 whitespace-nowrap">
                       <div className="flex items-center space-x-2 text-text-tertiary">
                          <FiClock size={12} />
                          <span className="text-[11px] font-bold">{new Date(log.createdAt).toLocaleString("vi-VN")}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {getTypeBadge(log.change_type)}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-text-primary uppercase tracking-tighter">
                        {log.stock?.productId || log.stockId}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-sm font-black tracking-tighter",
                        log.quantity > 0 ? "text-success" : log.quantity < 0 ? "text-error" : "text-text-tertiary"
                      )}>
                        {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="size-6 rounded-full bg-bg-subtle dark:bg-white/5 flex items-center justify-center border border-border/40">
                           <span className="text-[8px] font-black text-text-tertiary uppercase">US</span>
                        </div>
                        <span className="text-[11px] font-bold text-text-secondary">ID: {log.userId || "Hệ thống"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs truncate">
                      <p className="text-[11px] font-medium text-text-tertiary italic leading-relaxed" title={log.note}>
                        {log.note || "N/A"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

export default AuditLogs;
