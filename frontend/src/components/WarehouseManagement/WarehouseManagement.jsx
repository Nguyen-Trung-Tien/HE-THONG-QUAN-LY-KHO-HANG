import React, { useState, useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

// Common Components
import Badge from "../common/Badge";
import { cn } from "../../utils/cn";
import PageSkeleton from "../common/PageSkeleton";
import { FiInbox, FiList, FiSend, FiCheckSquare, FiMap, FiRefreshCw } from "react-icons/fi";

// Lazy-loaded tab components
const ImportReceipts = lazy(() => import("../ImportReceiptComponent/ImportReceipt"));
const ImportDetails = lazy(() => import("../ImportDetailComponent/ImportDetails"));
const ExportReceipts = lazy(() => import("../ExportReceiptsComponent/ExportReceipts"));
const ExportDetails = lazy(() => import("../ExportDetailsComponent/ExportDetails"));
const InventoryCount = lazy(() => import("./InventoryCount"));
const WarehouseMap = lazy(() => import("./WarehouseMap"));
const ReorderSuggestions = lazy(() => import("./ReorderSuggestions"));

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
    { id: "importReceipts", label: "Phiếu nhập", icon: <FiInbox className="size-4" /> },
    { id: "importDetails", label: "Chi tiết nhập", icon: <FiList className="size-4" /> },
    { id: "exportReceipts", label: "Phiếu xuất", icon: <FiSend className="size-4" /> },
    { id: "exportDetails", label: "Chi tiết xuất", icon: <FiList className="size-4" /> },
    { id: "inventoryCount", label: "Kiểm kê kho", icon: <FiCheckSquare className="size-4" /> },
    { id: "warehouseMap", label: "Sơ đồ kho", icon: <FiMap className="size-4" /> },
    { id: "reorderSuggestions", label: "Đề xuất đặt hàng", icon: <FiRefreshCw className="size-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* Header Banner */}
      <div className="bg-white dark:bg-dark-card p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-border/50 dark:border-dark-border/40 shadow-soft-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <Badge variant="primary" className="mb-2">Nghiệp Vụ Kho Vận</Badge>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary dark:text-dark-text-primary tracking-tight">
              Quản Lý Hóa Đơn & Chứng Từ Kho
            </h1>
            <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mt-0.5">
              Quy trình nhập xuất kho, kiểm kê và bản đồ vị trí chứng từ hàng hóa
            </p>
          </div>
        </div>

        {/* Scrollable Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-bg-subtle/60 dark:bg-white/5 rounded-2xl border border-border/50 dark:border-dark-border/60">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-200 whitespace-nowrap touch-target select-none",
                activeTab === item.id
                  ? "bg-white dark:bg-dark-card text-primary shadow-md scale-[1.02] border border-border/40 dark:border-dark-border/40"
                  : "text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <span className={cn("transition-transform", activeTab === item.id && "scale-110 text-primary")}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<PageSkeleton />}>
        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
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
      </Suspense>
    </div>
  );
}
