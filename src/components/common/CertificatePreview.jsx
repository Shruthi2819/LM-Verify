import { formatDate } from "../../utils/helpers";
import StatusBadge from "../feedback/StatusBadge";
import { Award, CheckCircle, FileText } from "lucide-react";
import QRCodeCanvas from "./QRCodeCanvas";
import { getPublicVerificationUrl } from "../../config/appConfig";

export default function CertificatePreview({ cert, qrUrl }) {
  if (!cert) return null;

  // Determine authoritative verification URL if not explicitly provided
  const targetVerificationUrl = qrUrl || getPublicVerificationUrl(cert.id);

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-10 relative overflow-hidden shadow-sm font-sans select-text print:border-0 print:shadow-none dark:bg-slate-900 dark:border-slate-700">
      {/* Printable certificate frames */}
      <div className="absolute inset-2 border border-slate-200 pointer-events-none print:hidden dark:border-slate-800" />
      
      {/* Header government branding */}
      <div className="text-center space-y-2 border-b-2 border-double border-slate-300 pb-6 mb-6 dark:border-slate-700">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Government of Maharashtra</h2>
        <h3 className="text-sm font-bold text-slate-700 uppercase dark:text-slate-200">Department of Legal Metrology</h3>
        <h4 className="text-md font-bold text-blue-800 mt-1 uppercase flex items-center justify-center gap-1.5 dark:text-blue-400">
          <Award size={18} className="text-blue-700 dark:text-blue-400" /> Certificate of Verification
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Issued under Section 24 of the Legal Metrology Act, 2009</p>
      </div>

      {/* Main declaration */}
      <div className="space-y-5 text-xs text-slate-700 leading-relaxed dark:text-slate-300">
        <p>
          This is to certify that the weighing / measuring instrument described below has been verified and stamped
          according to the statutory requirements of the Legal Metrology rules and is legally fit for commercial transactions.
        </p>

        {/* Certificate ID / Status */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-4 font-medium print:bg-white print:border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Certificate ID</span>
            <span className="font-mono text-slate-900 text-sm font-bold dark:text-slate-100">{cert.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Validity Status</span>
            <StatusBadge status={cert.status} />
          </div>
        </div>

        {/* Technical specs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <DetailRow label="Instrument Category" value={cert.instrumentType || cert.instrumentName} />
          <DetailRow label="Serial Number" value={cert.serialNumber} />
          <DetailRow label="Capacity Limit" value={cert.capacity} />
          <DetailRow label="Registered Business Name" value={cert.businessName} />
        </div>

        {cert.address && (
          <div className="pt-2">
            <DetailRow label="Installation Location" value={cert.address} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <DetailRow label="Issued On" value={formatDate(cert.issuedDate)} />
          <DetailRow label="Valid Until" value={formatDate(cert.expiryDate)} />
        </div>

        {/* QR & Cryptographic signatures */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 mt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Left side hash info */}
          <div className="space-y-3 w-full sm:w-auto">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Integrity Fingerprint (SHA-256)</span>
              <p className="font-mono text-[10px] text-slate-700 font-bold bg-slate-50 border border-slate-100 px-2 py-1 rounded max-w-xs truncate print:bg-white print:border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" title={cert.blockchainHash}>
                {cert.blockchainHash}
              </p>
            </div>
            {cert.txId && (
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Blockchain Registry Entry</span>
                <p className="font-mono text-[9px] text-slate-500 max-w-xs truncate dark:text-slate-400" title={cert.txId}>
                  Tx: {cert.txId}
                </p>
              </div>
            )}
          </div>

          {/* Right side signatures / QR */}
          <div className="flex items-center gap-6 self-end sm:self-center">
            {/* Functional Machine-Readable QR Code */}
            <div className="text-center print:block">
              <QRCodeCanvas
                value={targetVerificationUrl}
                size={96}
                certificateId={cert.id}
                showLabel={true}
                alt={`Scan to verify certificate ${cert.id}`}
              />
            </div>

            <div className="text-right space-y-1.5 pt-4">
              <div className="h-6 w-32 border-b border-dashed border-slate-300 ml-auto dark:border-slate-600" />
              <p className="font-bold text-slate-800 text-[11px] dark:text-slate-200">{cert.issuingOfficer}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">{cert.designation || "Legal Metrology Officer"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{label}</span>
      <p className="font-semibold text-slate-800 dark:text-slate-100">{value || "—"}</p>
    </div>
  );
}
