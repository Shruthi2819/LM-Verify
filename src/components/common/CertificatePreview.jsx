import { formatDate } from "../../utils/helpers";
import StatusBadge from "../feedback/StatusBadge";
import { formatCertHash, formatTxHash } from "../../utils/blockchain";
import { Award, CheckCircle, FileText } from "lucide-react";

export default function CertificatePreview({ cert, qrUrl }) {
  if (!cert) return null;

  // Google Charts QR Generator API - highly reliable, zero NPM package size.
  const chartQrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(qrUrl)}`;

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-10 relative overflow-hidden shadow-sm font-sans select-text print:border-0 print:shadow-none">
      {/* Printable certificate frames */}
      <div className="absolute inset-2 border border-slate-200 pointer-events-none print:hidden" />
      
      {/* Header government branding */}
      <div className="text-center space-y-2 border-b-2 border-double border-slate-300 pb-6 mb-6">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Government of Maharashtra</h2>
        <h3 className="text-sm font-bold text-slate-700 uppercase">Department of Legal Metrology</h3>
        <h4 className="text-md font-bold text-blue-800 mt-1 uppercase flex items-center justify-center gap-1.5">
          <Award size={18} className="text-blue-700" /> Certificate of Verification
        </h4>
        <p className="text-[10px] text-slate-500">Issued under Section 24 of the Legal Metrology Act, 2009</p>
      </div>

      {/* Main declaration */}
      <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
        <p>
          This is to certify that the weighing / measuring instrument described below has been verified and stamped
          according to the requirements of the Legal Metrology rules and is legally fit for commercial transactions.
        </p>

        {/* Certificate ID / Status */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-4 font-medium print:bg-white print:border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Certificate ID</span>
            <span className="font-mono text-slate-900 text-sm font-bold">{cert.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Validity Status</span>
            <StatusBadge status={cert.status} />
          </div>
        </div>

        {/* Technical specs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <DetailRow label="Instrument Category" value={cert.instrumentType} />
          <DetailRow label="Serial Number" value={cert.serialNumber} />
          <DetailRow label="Capacity Limit" value={cert.capacity} />
          <DetailRow label="Registered Business Name" value={cert.businessName} />
        </div>

        <div className="pt-2">
          <DetailRow label="Installation Address" value={cert.address} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <DetailRow label="Issued On" value={formatDate(cert.issuedDate)} />
          <DetailRow label="Valid Until" value={formatDate(cert.expiryDate)} />
        </div>

        {/* QR & Cryptographic signatures */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 mt-4 border-t border-slate-100">
          {/* Left side hash info */}
          <div className="space-y-3 w-full sm:w-auto">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Integrity Fingerprint (SHA-256)</span>
              <p className="font-mono text-[10px] text-slate-700 font-bold bg-slate-50 border border-slate-100 px-2 py-1 rounded max-w-xs truncate print:bg-white print:border-slate-200" title={cert.blockchainHash}>
                {cert.blockchainHash}
              </p>
            </div>
            {cert.txId && (
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Blockchain Registry Entry</span>
                <p className="font-mono text-[9px] text-slate-500 max-w-xs truncate" title={cert.txId}>
                  Tx: {cert.txId}
                </p>
              </div>
            )}
          </div>

          {/* Right side signatures / QR */}
          <div className="flex items-center gap-6 self-end sm:self-center">
            {/* Visual QR Code Display */}
            <div className="text-center print:block">
              <div className="w-24 h-24 bg-white border border-slate-200 rounded p-1 mx-auto flex items-center justify-center">
                <img
                  src={chartQrSrc}
                  alt={`Scan to verify certificate ${cert.id}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[8px] text-slate-400 mt-1">Scan to Verify Official Record</p>
            </div>

            <div className="text-right space-y-1.5 pt-4">
              <div className="h-6 w-32 border-b border-dashed border-slate-300 ml-auto" />
              <p className="font-bold text-slate-800 text-[11px]">{cert.issuingOfficer}</p>
              <p className="text-[9px] text-slate-500">{cert.designation}</p>
            </div>
          </div>
        </div>

        {cert.revocationReason && cert.status.toLowerCase() === "revoked" && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-[10px] mt-4 print:hidden">
            ⚠️ **Certificate Revoked:** This document has been revoked by administration. Reason: {cert.revocationReason}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">{label}</span>
      <span className="font-bold text-slate-800 text-xs">{value || "—"}</span>
    </div>
  );
}
