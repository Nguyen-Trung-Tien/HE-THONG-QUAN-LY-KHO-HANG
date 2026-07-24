import React from "react";
import AddressAutocomplete from "../AddressAutocomplete";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

export default function CustomerModal({
  isOpen,
  isEditing,
  form,
  onChange,
  onClose,
  onSubmit,
}) {
  const handleSelect = (suggest) => {
    if (suggest?.lat && suggest?.lon) {
      onChange({
        target: { name: "address", value: suggest.display_name },
      });
      onChange({
        target: { name: "lat", value: parseFloat(suggest.lat) },
      });
      onChange({
        target: { name: "lng", value: parseFloat(suggest.lon) },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => onSubmit({ ...form })}
          >
            {isEditing ? "Lưu thay đổi" : "Thêm khách hàng"}
          </Button>
        </div>
      }
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            ...form,
            lat: form.lat,
            lng: form.lng,
          });
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Tên khách hàng"
            name="name"
            placeholder="Ví dụ: Công ty ABC"
            value={form.name}
            onChange={onChange}
            required
            containerClassName="col-span-2"
          />

          <Input
            label="Email liên hệ"
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={onChange}
            required
          />

          <Input
            label="Số điện thoại"
            name="phoneNumber"
            placeholder="09xx xxx xxx"
            value={form.phoneNumber}
            onChange={onChange}
          />

          <div className="col-span-2 space-y-2">
            <label className="text-[10px] font-black text-text-tertiary ml-2 uppercase tracking-widest flex items-center space-x-1.5">
              <span>Địa chỉ trụ sở</span>
              <div className="w-1 h-1 rounded-full bg-primary/40" />
            </label>
            <AddressAutocomplete
              value={form.address}
              onChange={(value) =>
                onChange({ target: { name: "address", value } })
              }
              onSelect={handleSelect}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
