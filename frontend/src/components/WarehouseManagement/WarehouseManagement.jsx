import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import ImportReceipts from "../ImportReceiptComponent/ImportReceipt";
import ImportDetails from "../ImportDetailComponent/ImportDetails";
import ExportReceipts from "../ExportReceiptsComponent/ExportReceipts";
import ExportDetails from "../ExportDetailsComponent/ExportDetails";
import InventoryCount from "./InventoryCount";
import WarehouseMap from "./WarehouseMap";
import ReorderSuggestions from "./ReorderSuggestions";

// Common Components
import Badge from "../common/Badge";
import { cn } from "../../utils/cn";

export default function WarehouseManagement() {
  const location = useLocation();
  const stateTab = location.state?.tab;

  const [activeTab, setActiveTab] = useState(() => {
    return (
      stateTab || localStorage.getItem("activeWarehouseTab") || "importReceipts"
    );
  });

  useEffect(() => {
    localStorage.setItem("activeWarehouseTab", activeTab);
  }, [activeTab]);

  const menuItems = [
    {
      id: "importReceipts",
      label: "Phiếu nhập",
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H4a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2M4 13H6m8 0v4m-4-4v4" />
        </svg>
      ),
    },
    {
      id: "importDetails",
      label: "Chi tiết nhập",
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: "exportReceipts",
      label: "Phiếu xuất",
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6" />
        </svg>
      ),
    },
    {
      id: "exportDetails",
      label: "Chi tiết xuất",
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 11l-2 2-2-2" />
        </svg>
      ),
    },
    {
      id: "inventoryCount",
      label: "Kiểm kê kho",
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "warehouseMap",
      label: "Sơ đồ kho",
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      id: "reorderSuggestions",
      label: "Đề xuất đặt hàng",
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <Badge variant="primary" className="mb-1">Hóa đơn</Badge>
          <h1 className="text-xl font-black text-text-primary tracking-tighter">
            Quản Lý Hóa Đơn
          </h1>
          <p className="text-[10px] text-text-secondary font-semibold">Nhập xuất kho và chứng từ</p>
        </div>
        
        <div className="flex bg-bg-subtle dark:bg-white/5 p-1 rounded-2xl border border-border/40 dark:border-dark-border/40 backdrop-blur-sm shadow-sm">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300",
                activeTab === item.id
                  ? "bg-white dark:bg-dark-card text-primary shadow-soft-md scale-[1.05]"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              <span className="scale-110">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-top-1 duration-400">
        {activeTab === "importReceipts" && <ImportReceipts />}
        {activeTab === "importDetails" && <ImportDetails />}
        {activeTab === "exportReceipts" && <ExportReceipts />}
        {activeTab === "exportDetails" && <ExportDetails />}
        {activeTab === "inventoryCount" && <InventoryCount />}
        {activeTab === "warehouseMap" && <WarehouseMap />}
        {activeTab === "reorderSuggestions" && (
          <ReorderSuggestions onImportReceiptCreated={() => setActiveTab("importReceipts")} />
        )}
      </div>
    </div>
  );
}
