import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FiDownload, FiChevronDown } from "react-icons/fi";
import Button from "./Button";
import { cn } from "../../utils/cn";

/**
 * Reusable ExportExcel component
 * @param {Array} data - The array of objects to export (current page)
 * @param {Array} allData - All data across all pages
 * @param {string} fileName - Name of the file to save
 * @param {string} sheetName - Name of the worksheet
 * @param {Array} columns - Optional array of column mappings [{ key: 'id', header: 'ID' }]
 */
const ExportExcel = ({ 
  data, 
  allData = [], 
  fileName = "export", 
  sheetName = "Data", 
  columns = [] 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = (exportData, suffix = "") => {
    if (!exportData || exportData.length === 0) return;
    setLoading(true);

    try {
      // Map data to custom headers if columns are provided
      const mappedData = exportData.map((item) => {
        if (columns.length > 0) {
          const mappedItem = {};
          columns.forEach((col) => {
            const value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
            mappedItem[col.header] = value || "";
          });
          return mappedItem;
        }
        return item;
      });

      const worksheet = XLSX.utils.json_to_sheet(mappedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Auto-size columns
      const maxWidths = {};
      mappedData.forEach(row => {
        Object.keys(row).forEach((key) => {
          const val = row[key] ? row[key].toString() : "";
          maxWidths[key] = Math.max(maxWidths[key] || 10, val.length + 2);
        });
      });
      worksheet["!cols"] = Object.values(maxWidths).map(w => ({ wch: w }));

      XLSX.writeFile(workbook, `${fileName}${suffix}.xlsx`);
    } catch (err) {
      console.error("Excel Export error:", err);
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  };

  return (
    <div className="relative inline-block text-left z-[60]">
      <div className="flex">
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleExport(data)}
          leftIcon={<FiDownload className="stroke-[3px]" />}
          isLoading={loading}
          className="bg-white dark:bg-dark-card hover:bg-success/5 dark:hover:bg-success/10 hover:text-success hover:border-success/30 rounded-l-xl border-r-0 h-10 px-4 transition-all"
        >
          Xuất Excel
        </Button>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-2 border border-border/60 dark:border-dark-border/60 border-l-0 rounded-r-xl hover:bg-bg-subtle dark:hover:bg-white/5 transition-all text-text-tertiary h-10"
        >
          <FiChevronDown className={cn("transition-transform duration-300", showOptions && "rotate-180")} />
        </button>
      </div>

      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-card shadow-soft-2xl border border-border/40 dark:border-dark-border/60 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleExport(data, "_trang_hien_tai")}
                className="w-full text-left px-4 py-2.5 text-[10px] font-black text-text-primary uppercase tracking-widest hover:bg-success/5 dark:hover:bg-white/5 hover:text-success rounded-xl transition-all flex items-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-success/40 mr-2.5" />
                Trang hiện tại ({data.length})
              </button>
              {allData && allData.length > 0 && (
                <button
                  onClick={() => handleExport(allData, "_tat_ca")}
                  className="w-full text-left px-4 py-2.5 text-[10px] font-black text-text-primary uppercase tracking-widest hover:bg-success/5 dark:hover:bg-white/5 hover:text-success rounded-xl transition-all flex items-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-success/60 mr-2.5" />
                  Tất cả các trang ({allData.length})
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportExcel;
