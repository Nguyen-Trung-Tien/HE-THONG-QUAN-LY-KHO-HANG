import React, { useState, useEffect, useCallback } from "react";
import ShipperMap from "./ShipperMap";
import ShipperList from "./ShipperList";
import AddShipperForm from "./AddShipperForm";
import EditShipperForm from "./EditShipperForm";
import {
  getAllShippers,
  addNewShipper,
  deleteShipper,
  updateShipper,
  updateShipperStatus,
} from "../../API/shipper/shipperApi";
import { getAllOrders } from "../../API/orders/ordersApi";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import ExportExcel from "../common/ExportExcel";
import ExportPDF from "../common/ExportPDF";

import Badge from "../common/Badge";

function Shippers() {
  const [shippers, setShippers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingShipper, setEditingShipper] = useState(null);
  const [shipperToDelete, setShipperToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [focusInfo, setFocusInfo] = useState(null);

  const fetchShippers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllShippers();
      setShippers(data);
    } catch {
      toast.error("Không thể tải danh sách shipper");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch {
      // Silence fetch orders error
    }
  }, []);

  useEffect(() => {
    fetchShippers();
    fetchOrders();
  }, [fetchShippers, fetchOrders]);

  const handleAdd = async (data) => {
    try {
      await addNewShipper(data);
      toast.success("Thêm shipper mới thành công");
      setShowAdd(false);
      fetchShippers();
    } catch {
      toast.error("Không thể thêm shipper");
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateShipper(editingShipper.id, data);
      toast.success("Cập nhật shipper thành công");
      setEditingShipper(null);
      fetchShippers();
    } catch {
      toast.error("Không thể cập nhật shipper");
    }
  };

  const handleDeleteShipper = async () => {
    try {
      await deleteShipper(shipperToDelete);
      toast.success("Xóa shipper thành công");
      setIsDeleteModalOpen(false);
      fetchShippers();
    } catch {
      toast.error("Không thể xóa shipper");
    }
  };

  const handleUpdateStatus = async (shipperId, statusData) => {
    try {
      await updateShipperStatus(shipperId, statusData);
      toast.success("Cập nhật trạng thái thành công");
      fetchShippers();
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  return (
    <div className='space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500'>
      <div>
        <Badge variant="primary" className="mb-1">Vận chuyển</Badge>
        <h1 className='heading-1'>
          Quản lý shipper
        </h1>
        <p className="subheading">Đội ngũ giao hàng và vị trí trực tuyến</p>
      </div>

      <div className="flex justify-end gap-2">
          <ExportPDF
            data={shippers}
            allData={shippers}
            fileName="Danh_sach_shipper"
            title="Danh sách đội ngũ shipper"
            columns={[
              { key: 'id', header: 'Ma Shipper' },
              { key: 'name', header: 'Ho va ten' },
              { key: 'phoneNumber', header: 'So dien thoai' },
              { key: 'status', header: 'Trang thai' },
              { key: 'address', header: 'Dia chi' },
            ]}
          />
          <ExportExcel 
            data={shippers}
            allData={shippers}
            fileName="Danh_sach_shipper"
            sheetName="Shipper"
            columns={[
              { key: 'id', header: 'Mã Shipper' },
              { key: 'name', header: 'Họ và tên' },
              { key: 'phoneNumber', header: 'Số điện thoại' },
              { key: 'status', header: 'Trạng thái' },
              { key: 'address', header: 'Địa chỉ' },
            ]}
          />
      </div>

      <div className="rounded-xl overflow-hidden shadow-soft-xl border border-border/50">
        <ShipperMap shippers={shippers} focusId={focusInfo} />
      </div>

      <ShipperList
        shippers={shippers}
        orders={orders}
        onAddShipper={() => setShowAdd(true)}
        onDeleteShipper={(id) => {
          setShipperToDelete(id);
          setIsDeleteModalOpen(true);
        }}
        onFocusShipper={(id) => setFocusInfo({ id, timestamp: Date.now() })}
        onEditShipper={(shipper) => setEditingShipper(shipper)}
        onUpdateStatus={handleUpdateStatus}
        loading={loading}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteShipper}
        title="Xác nhận xóa shipper"
        message="Bạn có chắc chắn muốn xóa shipper này? Hành động này không thể hoàn tác."
      />

      {showAdd && (
        <AddShipperForm
          shipper={editingShipper}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editingShipper && (
        <EditShipperForm
          shipper={editingShipper}
          onSubmit={handleEdit}
          onClose={() => setEditingShipper(null)}
        />
      )}
    </div>
  );
}

export default Shippers;
