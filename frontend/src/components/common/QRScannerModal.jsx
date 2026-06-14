import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Modal from "./Modal";
import Button from "./Button";
import { FiCamera, FiAlertTriangle } from "react-icons/fi";

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setScanning(false);

    // Get cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Find back camera if possible
          const backCam = devices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("environment"),
          );
          setActiveCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setError("Không tìm thấy camera nào trên thiết bị.");
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách camera:", err);
        setError(
          "Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt.",
        );
      });

    return () => {
      // Clean up scanning if any
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current
          .stop()
          .catch((e) => console.error("Error stopping scanner on unmount:", e));
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !activeCameraId) return;

    const startScanner = async () => {
      try {
        if (qrCodeRef.current && qrCodeRef.current.isScanning) {
          await qrCodeRef.current.stop();
        }

        const html5QrCode = new Html5Qrcode("qr-reader-container");
        qrCodeRef.current = html5QrCode;

        setError("");
        setScanning(true);

        await html5QrCode.start(
          activeCameraId,
          {
            fps: 10,
            qrbox: (width, height) => {
              const minSize = Math.min(width, height);
              const boxSize = Math.floor(minSize * 0.7);
              return { width: boxSize, height: boxSize };
            },
          },
          (decodedText) => {
            // On success
            onScanSuccess(decodedText);
            onClose();
          },
          (errorMessage) => {
            // Silent failure for matching frames
          },
        );
      } catch (err) {
        console.error("Không thể khởi động camera:", err);
        setError(
          "Lỗi khi kết nối với camera hoặc camera đang bị ứng dụng khác sử dụng.",
        );
        setScanning(false);
      }
    };

    // Delay initialization slightly to ensure element is rendered in DOM
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current
          .stop()
          .catch((e) => console.error("Error stopping scanner:", e));
      }
    };
  }, [isOpen, activeCameraId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quét mã QR / Barcode"
      size="sm"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Camera selection dropdown */}
        {cameras.length > 1 && (
          <div className="w-full space-y-1">
            <label className="text-[9px] font-black text-text-tertiary uppercase tracking-wider ml-1">
              Chọn camera
            </label>
            <select
              value={activeCameraId}
              onChange={(e) => setActiveCameraId(e.target.value)}
              className="w-full bg-bg-subtle dark:bg-white/5 border border-border/50 dark:border-dark-border/40 text-text-primary text-xs rounded-xl h-10 px-4 outline-none font-bold transition-all"
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Video wrapper */}
        <div className="relative w-full aspect-square max-w-[280px] rounded-[1.5rem] overflow-hidden bg-black flex items-center justify-center border border-border/40 dark:border-dark-border/40 shadow-inner-sm">
          {error ? (
            <div className="p-6 text-center text-error space-y-2">
              <FiAlertTriangle className="size-8 mx-auto" />
              <p className="text-[11px] font-bold">{error}</p>
            </div>
          ) : (
            <div id="qr-reader-container" className="w-full h-full" />
          )}

          {scanning && !error && (
            <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-primary animate-pulse opacity-40 rounded-[1.5rem]" />
          )}
        </div>

        <p className="text-[9px] text-text-tertiary font-bold text-center uppercase tracking-widest leading-normal">
          Đặt mã QR hoặc mã vạch vào vùng tiêu cự camera để quét tự động
        </p>

        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full h-10 rounded-xl"
        >
          Đóng
        </Button>
      </div>
    </Modal>
  );
}
