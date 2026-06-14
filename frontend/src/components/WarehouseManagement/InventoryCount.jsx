import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getAllInventoryCounts,
  approveInventoryCount,
  cancelInventoryCount,
} from "../../API/inventoryCountApi/inventoryCountApi";

// Common Components
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";
import Table from "../common/Table";
import Badge from "../common/Badge";
import Pagination from "../common/Pagination";
import Modal from "../common/Modal";
import ConfirmModal from "../common/ConfirmModal";
import InventoryCountFormModal from "./InventoryCountFormModal";

import { FiPlusCircle, FiSearch, FiFileText, FiCalendar, FiUser, FiInfo, FiCheck, FiXCircle } from "react-icons/fi";
import { cn } from "../../utils/cn";

export default function InventoryCount() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userRole = currentUser?.role || "user";
  const isAdminOrDev = userRole === "admin" || userRole === "dev";
  const isKeeper = userRole === "keeper";

  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCount, setSelectedCount] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Confirm states
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCounts = useCallback(
    async (page = currentPage, search = searchQuery) => {
      setLoading(true);
      try {
        const res = await getAllInventoryCounts({
          page,
          limit: itemsPerPage,
          search,
        });
        if (res.success) {
          setCounts(res.counts || []);
          setTotalPages(res.totalPages || 1);
          setCurrentPage(res.currentPage || 1);
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải dữ liệu phiếu kiểm kê");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchQuery]
  );

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const openDetail = (countRecord) => {
    setSelectedCount(countRecord);
    setShowDetailModal(true);
  };

  const handleApprove = async () => {
    if (!selectedCount) return;
    setActionLoading(true);
    try {
      const res = await approveInventoryCount(selectedCount.id);
      if (res.success) {
        toast.success("Duyệt phiếu kiểm kê và đồng bộ tồn kho thành công!");
        setShowDetailModal(false);
        fetchCounts();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Duyệt phiếu kiểm kê thất bại");
    } finally {
      setActionLoading(false);
      setConfirmApproveOpen(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedCount) return;
    setActionLoading(true);
    try {
      const res = await cancelInventoryCount(selectedCount.id);
      if (res.success) {
        toast.success("Hủy phiếu kiểm kê thành công!");
        setShowDetailModal(false);
        fetchCounts();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Hủy phiếu thất bại");
    } finally {
      setActionLoading(false);
      setConfirmCancelOpen(false);
    }
  };

  const columns = [
    {
      title: "Mã phiếu",
      key: "id",
      className: "w-24 text-center font-black text-primary uppercase tracking-tighter",
      render: (id) => <span>#{id}</span>,
    },
    {
      title: "Ngày kiểm kê",
      key: "countDate",
      render: (date) => (
        <span className="text-xs font-bold text-text-secondary">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Người thực hiện",
      key: "userData",
      render: (user) => (
        <div className="flex items-center gap-x-2">
          <div className="size-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
            <FiUser size={14} />
          </div>
          <span className="font-bold text-text-primary truncate max-w-[150px]">
            {user ? `${user.firstName} ${user.lastName}` : "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Số mặt hàng",
      key: "details",
      render: (details) => (
        <span className="text-[10px] font-black bg-bg-subtle/50 dark:bg-white/5 px-2 py-1 rounded-lg border border-border/50 dark:border-dark-border/40">
          {details?.length || 0} mục
        </span>
      ),
    },
    {
      title: "Ghi chú",
      key: "note",
      render: (note) => (
        <span className="text-xs text-text-tertiary truncate max-w-[200px] block">
          {note || "—"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (status) => {
        const variants = {
          pending: "warning",
          approved: "success",
          cancelled: "error",
        };
        const labels = {
          pending: "Chờ duyệt",
          approved: "Đã duyệt",
          cancelled: "Đã hủy",
        };
        return (
          <Badge variant={variants[status] || "neutral"} size="sm">
            {labels[status] || status}
          </Badge>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      className: "text-right",
      render: (_, r) => (
        <div className="flex justify-end gap-x-1 scale-90 origin-right">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/10 rounded-xl flex items-center gap-1.5 px-3 py-1.5"
            onClick={() => openDetail(r)}
          >
            <FiInfo className="size-4" /> Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-1 uppercase tracking-widest">Nghiệp vụ</Badge>
          <h2 className="text-xl font-black text-text-primary tracking-tighter uppercase leading-none">
            Kiểm Kê Kho Định Kỳ
          </h2>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-1">
            Đối soát hàng tồn thực tế và cân bằng chênh lệch hệ thống
          </p>
        </div>
        <div className="flex flex-wrap gap-2 scale-90 sm:scale-100 origin-right relative z-50">
          {!isKeeper && (
            <Button
              onClick={() => setShowFormModal(true)}
              variant="primary"
              className="rounded-xl shadow-primary/30 h-10 px-6 flex items-center gap-2"
              leftIcon={<FiPlusCircle className="size-5" />}
            >
              Lập phiếu kiểm kê
            </Button>
          )}
        </div>
      </div>

      <Card noPadding className="shadow-soft-xl border-border/50 dark:border-dark-border/40">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-border/40 dark:border-dark-border/40">
          <div>
            <Badge variant="neutral" size="sm" className="bg-bg-subtle/50 dark:bg-dark-card/40 uppercase font-black tracking-widest">
              Tổng số: {counts.length} phiếu
            </Badge>
          </div>
          <div className="w-full md:w-80">
            <Input
              placeholder="Tìm theo ghi chú, trạng thái..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10"
              leftIcon={<FiSearch size={18} />}
            />
          </div>
        </div>

        <div className="overflow-hidden">
          <Table
            columns={columns}
            data={counts}
            loading={loading}
            emptyMessage="Không tìm thấy phiếu kiểm kê nào"
          />
        </div>

        <div className="p-6 border-t border-border/40 dark:border-dark-border/40 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Card>

      {/* Form Modal */}
      <InventoryCountFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={() => {
          setShowFormModal(false);
          fetchCounts();
        }}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedCount ? `Phiếu kiểm kê #${selectedCount.id}` : "Chi tiết kiểm kê"}
        size="lg"
        footer={
          selectedCount && selectedCount.status === "pending" && isAdminOrDev ? (
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-bold text-warning-dark uppercase tracking-widest">
                * Cần phê duyệt để cập nhật tồn kho hệ thống
              </span>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-error text-error hover:bg-error/10 h-10 px-6 rounded-xl"
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  Hủy phiếu
                </Button>
                <Button
                  variant="primary"
                  className="bg-success hover:bg-success-dark text-white h-10 px-6 rounded-xl shadow-success/30"
                  onClick={() => setConfirmApproveOpen(true)}
                >
                  Phê duyệt cân kho
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end w-full">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)} className="h-10 px-6 rounded-xl">
                Đóng
              </Button>
            </div>
          )
        }
      >
        {selectedCount && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-bg-subtle/30 dark:bg-white/5 p-4 rounded-2xl border border-border/40 dark:border-dark-border/40">
              <div>
                <span className="block text-[8px] font-black text-text-tertiary uppercase tracking-widest">Ngày lập</span>
                <span className="text-xs font-bold text-text-primary">
                  {new Date(selectedCount.countDate).toLocaleString("vi-VN")}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-black text-text-tertiary uppercase tracking-widest">Người lập</span>
                <span className="text-xs font-bold text-text-primary">
                  {selectedCount.userData ? `${selectedCount.userData.firstName} ${selectedCount.userData.lastName}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-black text-text-tertiary uppercase tracking-widest">Trạng thái</span>
                <Badge
                  variant={
                    selectedCount.status === "approved"
                      ? "success"
                      : selectedCount.status === "cancelled"
                      ? "error"
                      : "warning"
                  }
                  size="sm"
                >
                  {selectedCount.status === "approved"
                    ? "Đã duyệt cân kho"
                    : selectedCount.status === "cancelled"
                    ? "Đã hủy"
                    : "Chờ phê duyệt"}
                </Badge>
              </div>
            </div>

            {selectedCount.note && (
              <div className="p-3 bg-bg-subtle/10 border-l-4 border-primary rounded-r-lg">
                <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest block">Ghi chú phiếu</span>
                <span className="text-xs text-text-secondary">{selectedCount.note}</span>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-text-primary">Chi tiết mặt hàng kiểm đếm</h4>
              <div className="border border-border/40 dark:border-dark-border/40 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-dark-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-subtle/50 dark:bg-white/5 border-b border-border/40 dark:border-dark-border/40 text-[9px] font-black uppercase tracking-wider text-text-tertiary">
                      <th className="p-4">Sản phẩm</th>
                      <th className="p-4">Số lô</th>
                      <th className="p-4 text-center">Tồn hệ thống</th>
                      <th className="p-4 text-center">Đếm thực tế</th>
                      <th className="p-4 text-center">Chênh lệch</th>
                      <th className="p-4">Lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCount.details?.map((detail, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/40 dark:border-dark-border/40 last:border-none text-xs text-text-primary hover:bg-bg-subtle/20 dark:hover:bg-white/[0.01]"
                      >
                        <td className="p-4 font-bold uppercase tracking-tight">
                          {detail.StockProductData?.name || `Sản phẩm #${detail.productId}`}
                        </td>
                        <td className="p-4 font-medium text-text-tertiary">
                          {detail.batchNumber ? (
                            <Badge variant="neutral" size="sm">{detail.batchNumber}</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4 text-center font-bold text-text-secondary">{detail.systemQty}</td>
                        <td className="p-4 text-center font-black text-text-primary">{detail.actualQty}</td>
                        <td className="p-4 text-center font-black">
                          {detail.discrepancy === 0 ? (
                            <span className="text-text-tertiary">0</span>
                          ) : detail.discrepancy > 0 ? (
                            <span className="text-success">+{detail.discrepancy}</span>
                          ) : (
                            <span className="text-error">{detail.discrepancy}</span>
                          )}
                        </td>
                        <td className="p-4 text-text-tertiary italic">{detail.reason || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Approve */}
      <ConfirmModal
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={handleApprove}
        title="Xác nhận phê duyệt cân kho"
        message="Hệ thống sẽ tự động cập nhật số lượng tồn kho của các sản phẩm và lô hàng tương ứng bằng số lượng đếm thực tế. Hành động này không thể hoàn tác và sẽ ghi log điều chỉnh."
        confirmText="Xác nhận duyệt"
        isLoading={actionLoading}
        variant="success"
      />

      {/* Confirm Cancel */}
      <ConfirmModal
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancel}
        title="Xác nhận hủy phiếu kiểm kê"
        message="Phiếu kiểm kê này sẽ bị hủy bỏ và không thể tiến hành phê duyệt cân kho được nữa. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xác nhận hủy"
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
}
