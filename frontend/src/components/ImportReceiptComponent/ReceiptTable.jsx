import React from "react";
import { useSelector } from "react-redux";
import Table from "../common/Table";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { FiTrash2 } from "react-icons/fi";

export default function ReceiptTable({
  receipts,
  handleEdit,
  handleDelete,
  loading,
}) {
  const userRole = useSelector((state) => state.user.role || state.user.currentUser?.role);
  const isAccountant = userRole === "accountant";

  const columns = [
    {
      title: 'Mã',
      key: 'id',
      className: 'w-16 text-center font-bold text-primary',
    },
    {
      title: 'Ngày nhập',
      key: 'import_date',
      render: (date) => <span className="text-text-secondary">{new Date(date).toLocaleDateString("vi-VN")}</span>
    },
    {
      title: 'Người nhập',
      key: 'userData',
      render: (user, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">
            {user ? `${user.firstName} ${user.lastName}`.trim() || user.email : `ID ${row.userId}`}
          </span>
          <span className="text-[10px] text-text-tertiary font-bold uppercase">{user?.role}</span>
        </div>
      )
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplierData',
      render: (sup) => <span className="font-medium text-text-primary truncate max-w-[120px] inline-block">{sup?.name || "N/A"}</span>
    },
    {
      title: 'Sản phẩm',
      key: 'importDetailData',
      render: (details) => (
        <div className="flex flex-wrap gap-1">
          {details?.slice(0, 2).map((d, i) => (
            <Badge key={i} variant="info" size="sm">
              {d.StockProductData?.name} (x{d.quantity})
            </Badge>
          ))}
          {details?.length > 2 && <Badge variant="neutral" size="sm">+{details.length - 2}</Badge>}
        </div>
      )
    },
    {
      title: 'Tổng giá',
      key: 'total',
      render: (_, row) => {
        const total = row.importDetailData?.reduce((sum, d) => sum + d.quantity * d.price, 0) || 0;
        return <span className="font-black text-primary">{total.toLocaleString("vi-VN")}đ</span>
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      className: 'text-right',
      render: (_, r) => (
        <div className="flex justify-end space-x-1 scale-90 origin-right">
          <Button 
            variant="ghost" size="icon" className="text-primary hover:bg-primary/10"
            onClick={() => handleEdit(r)}
            title={isAccountant ? "Xem chi tiết" : "Chỉnh sửa"}
          >
            {isAccountant ? (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            )}
          </Button>
          {!isAccountant && (
            <Button 
              variant="ghost" size="icon" className="text-error hover:bg-error/10"
              onClick={() => handleDelete(r.id)}
              title="Xóa"
            >
              <FiTrash2 className="size-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      data={receipts} 
      loading={loading} 
      emptyMessage="Không tìm thấy phiếu nhập nào"
    />
  );
}
