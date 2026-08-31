import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { AlertCircle, QrCode as QrIcon, RefreshCw, Download } from "lucide-react";

export function QRCodeCanvas({
  value,
  size = 180,
  errorCorrectionLevel = "M",
  className = "",
  certificateId = "",
  showLabel = true,
  showDownload = false,
  alt = "Scan to verify certificate authenticity"
}) {
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateQR = async () => {
    if (!value || !value.trim()) {
      setDataUrl("");
      setError("No verification URL provided.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const url = await QRCode.toDataURL(value.trim(), {
        errorCorrectionLevel,
        margin: 1,
        width: Math.max(size * 2, 256),
        color: {
          dark: "#0f172a", // Slate-900 high contrast dark
          light: "#ffffff"  // Pure white quiet zone
        }
      });
      setDataUrl(url);
    } catch (err) {
      console.error("QR Code generation error:", err);
      setError("QR verification code could not be generated.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, [value, size, errorCorrectionLevel]);

  if (error) {
    return (
      <div className={`p-3 bg-red-50 border border-red-200 rounded-lg text-center text-xs text-red-700 space-y-1.5 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 ${className}`}>
        <div className="flex items-center justify-center gap-1 font-semibold text-[11px]">
          <AlertCircle size={14} className="text-red-600" />
          <span>QR Generation Failed</span>
        </div>
        <p className="text-[10px] text-red-600 dark:text-red-400">{error}</p>
        <button
          type="button"
          onClick={generateQR}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-red-200 rounded text-[10px] hover:bg-red-50 text-red-700 transition cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
        >
          <RefreshCw size={10} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* High-Contrast Container with Quiet-Zone */}
      <div
        className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-xs inline-flex items-center justify-center print:border-slate-300 print:shadow-none"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={alt}
            style={{ width: size - 12, height: size - 12 }}
            className="object-contain block mx-auto select-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] space-y-1 animate-pulse">
            <QrIcon size={24} className="text-slate-300" />
            <span>Generating QR...</span>
          </div>
        )}
      </div>

      {/* Label and Certificate ID */}
      {showLabel && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">
            Scan to Verify Official Certificate
          </p>
          {certificateId && (
            <p className="text-[8px] font-mono text-slate-500 dark:text-slate-400">
              ID: {certificateId}
            </p>
          )}
        </div>
      )}

      {/* Optional Download QR button */}
      {showDownload && dataUrl && (
        <a
          href={dataUrl}
          download={`QR_${certificateId || "certificate"}.png`}
          className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition print:hidden dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200"
        >
          <Download size={10} /> Download QR PNG
        </a>
      )}
    </div>
  );
}

export default QRCodeCanvas;
