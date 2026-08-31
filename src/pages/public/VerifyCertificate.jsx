import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicVerificationService } from "../../services/publicVerificationService";
import { evidenceChainService } from "../../services/evidenceChainService";
import CertificatePreview from "../../components/common/CertificatePreview";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { getPublicVerificationUrl } from "../../config/appConfig";
import QRCode from "qrcode";
import {
  Search,
  BadgeCheck,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  QrCode,
  Download,
  Copy,
  CheckCircle2,
  RefreshCw,
  Clock,
  Link,
  FileCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/helpers";

export function VerifyCertificate() {
  const { certificateId: paramId } = useParams();
  const navigate = useNavigate();

  const [certId, setCertId] = useState(paramId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrDownloadDataUrl, setQrDownloadDataUrl] = useState("");

  const handleVerify = async (idToVerify) => {
    const targetId = idToVerify !== undefined ? idToVerify : certId;
    if (!targetId || !targetId.trim()) {
      toast.error("Please enter a Certificate ID.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await publicVerificationService.verifyCertificate(targetId.trim());
      setResult(data);
    } catch (err) {
      toast.error(err.message || "Verification query failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) {
      setCertId(paramId);
      handleVerify(paramId);
    }
  }, [paramId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  // Build the public verification URL
  const publicId = result?.certificate?.id || certId || "CERT-2026-000007";
  const verificationUrl = getPublicVerificationUrl(publicId);

  // Generate offline QR code Data URL for the download action
  useEffect(() => {
    if (verificationUrl) {
      QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 320,
        color: { dark: "#0f172a", light: "#ffffff" }
      })
        .then(url => setQrDownloadDataUrl(url))
        .catch(e => console.warn("Failed to generate QR download URL", e));
    }
  }, [verificationUrl]);

  const copyVerificationLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // SIH Demonstration Trigger Handlers
  const handleQuickDemo = (id) => {
    setCertId(id);
    handleVerify(id);
  };

  const handleSimulateTamper = async () => {
    if (!result?.certificate?.evidenceChainId) return;
    try {
      await evidenceChainService.simulateTampering(result.certificate.evidenceChainId, "measurements", "Tampered observed calibration value");
      toast.error("Simulated evidence tampering on active chain.", { icon: "⚠️" });
      handleVerify(result.certificate.id);
    } catch (e) {
      toast.error("Failed to simulate tampering.");
    }
  };

  const handleRestoreEvidence = async () => {
    if (!result?.certificate?.evidenceChainId) return;
    try {
      await evidenceChainService.restoreOriginalEvidence(result.certificate.evidenceChainId);
      toast.success("Original evidence chain restored.");
      handleVerify(result.certificate.id);
    } catch (e) {
      toast.error("Failed to restore evidence.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 page-enter">
      {/* Official Government Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 dark:bg-slate-800 dark:border-slate-700">
          <ShieldCheck size={28} className="text-blue-700 dark:text-blue-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
          Public Certificate Authenticity Gateway
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Official verification portal for Legal Metrology certificates, cryptographic evidence chains, and immutable ledger proofs
        </p>
      </div>

      {/* Manual lookup input */}
      <Card noPadding className="p-4 sm:p-5">
        <div className="space-y-3">
          <Input
            label="Certificate Identification Number"
            placeholder="e.g. CERT-2026-000007"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            onKeyDown={handleKeyDown}
            helperText="Scan the QR code on a verification certificate or type the certificate number above."
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="flex-1 text-xs sm:text-sm h-10 cursor-pointer"
              leftIcon={<Search size={14} />}
              loading={loading}
              onClick={() => handleVerify()}
            >
              Verify Authenticity
            </Button>
          </div>
        </div>

        {/* SIH Demonstration Quick Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Demo Scenarios:</span>
          <button
            type="button"
            onClick={() => handleQuickDemo("CERT-2026-000007")}
            className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-medium transition dark:bg-slate-800 dark:text-slate-300"
          >
            ✓ Active Scale
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("CERT-2025-000021")}
            className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-[11px] font-medium transition dark:bg-amber-950/40 dark:text-amber-300"
          >
            ⚠ Expired Certificate
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("CERT-2025-000019")}
            className="px-2 py-1 rounded bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 text-[11px] font-medium transition dark:bg-red-950/40 dark:text-red-300"
          >
            ✕ Revoked Certificate
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("CERT-NONEXISTENT-999")}
            className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] transition dark:bg-slate-800 dark:text-slate-400"
          >
            ✕ Invalid / Non-Existent
          </button>
        </div>
      </Card>

      {/* Query Result View */}
      {result && (
        <div className="space-y-6">
          {/* ── 1. NOT FOUND ────────────────────────────────────────────── */}
          {result.status === "NOT_FOUND" && (
            <Card noPadding className="p-5 border-l-4 border-l-red-500 bg-red-50/40 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <XCircle size={26} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h3 className="font-bold text-red-800 dark:text-red-300 text-sm">✕ Certificate Not Found</h3>
                  <p className="text-red-700 dark:text-red-400 leading-relaxed">
                    No official certificate matching <strong>"{certId}"</strong> was found in the Legal Metrology database.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    If this is a physical paper certificate or sticker, it may be an unverified or counterfeit copy. Please check the spelling or contact your regional metrology inspectorate.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* ── 2. CERTIFICATE FOUND (AUTHENTIC RECORD) ─────────────────── */}
          {result.status === "VERIFIED" && result.certificate && (
            <div className="space-y-6">
              {/* Multi-Factor Trust Badge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Authenticity */}
                <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Record Authenticity</span>
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs mt-1">
                    <CheckCircle2 size={14} />
                    <span>AUTHENTIC</span>
                  </div>
                </div>

                {/* 2. Validity */}
                <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validity Status</span>
                  <div className="mt-1">
                    {result.certificate.status.toLowerCase() === "valid" && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                        <CheckCircle2 size={14} /> VALID
                      </span>
                    )}
                    {result.certificate.status.toLowerCase() === "expired" && (
                      <span className="text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
                        <AlertTriangle size={14} /> EXPIRED
                      </span>
                    )}
                    {result.certificate.status.toLowerCase() === "revoked" && (
                      <span className="text-red-700 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1">
                        <XCircle size={14} /> REVOKED
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Evidence Integrity */}
                <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Evidence Chain</span>
                  <div className="mt-1">
                    {result.integrity?.status === "VERIFIED" && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                        <CheckCircle2 size={14} /> VERIFIED
                      </span>
                    )}
                    {result.integrity?.status === "MISMATCH" && (
                      <span className="text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
                        <AlertTriangle size={14} /> MISMATCH
                      </span>
                    )}
                    {result.integrity?.status === "UNAVAILABLE" && (
                      <span className="text-slate-500 font-bold text-xs">UNAVAILABLE</span>
                    )}
                  </div>
                </div>

                {/* 4. Ledger Status */}
                <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Immutable Ledger</span>
                  <div className="mt-1">
                    {result.blockchain?.status === "VERIFIED" && (
                      <span className="text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1 truncate" title={result.blockchain.txReference}>
                        <CheckCircle2 size={14} /> ANCHORED
                      </span>
                    )}
                    {result.blockchain?.status === "NOT_ANCHORED" && (
                      <span className="text-slate-500 font-bold text-xs">NOT ANCHORED</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Specific Alerts */}
              {result.certificate.status.toLowerCase() === "expired" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-3 dark:bg-amber-950/30 dark:border-amber-800">
                  <AlertTriangle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300">Validity Term Has Expired</h4>
                    <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                      This certificate was verified authentically on <strong>{formatDate(result.certificate.issuedDate)}</strong>, but its legal validity lapsed on <strong>{formatDate(result.certificate.expiryDate)}</strong>. Commercial use requires annual re-verification.
                    </p>
                  </div>
                </div>
              )}

              {result.certificate.status.toLowerCase() === "revoked" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs flex items-start gap-3 dark:bg-red-950/30 dark:border-red-800">
                  <XCircle size={22} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-red-800 dark:text-red-300">Certificate Has Been Revoked</h4>
                    <p className="text-red-700 dark:text-red-400 leading-relaxed">
                      This certificate was officially revoked by the Department of Legal Metrology and is no longer valid for commercial use.
                    </p>
                  </div>
                </div>
              )}

              {/* Neutral Non-Accusatory Integrity Mismatch Alert */}
              {result.integrity?.status === "MISMATCH" && (
                <div className="p-4 bg-amber-50 border-l-4 border-l-amber-500 rounded-xl text-xs flex items-start gap-3 dark:bg-amber-950/40 dark:border-amber-700">
                  <AlertTriangle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-800 dark:text-amber-200">
                      ⚠ INTEGRITY WARNING
                    </h4>
                    <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                      The certificate or associated evidence may have been modified after issuance. Please contact the Department of Legal Metrology for further verification.
                    </p>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={handleRestoreEvidence} leftIcon={<RefreshCw size={12} />}>
                        Restore Original Verified State (Demo)
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Public URL:</span>
                  <code className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-mono text-slate-700 max-w-xs truncate dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                    {verificationUrl}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyVerificationLink} leftIcon={copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}>
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                  {qrDownloadDataUrl && (
                    <a
                      href={qrDownloadDataUrl}
                      download={"QR_" + result.certificate.id + ".png"}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    >
                      <Download size={12} /> Download QR PNG
                    </a>
                  )}
                  {result.integrity?.status === "VERIFIED" && (
                    <Button variant="outline" size="sm" onClick={handleSimulateTamper} className="text-amber-700 border-amber-200 hover:bg-amber-50 dark:border-amber-800">
                      Simulate Tampering (Demo)
                    </Button>
                  )}
                </div>
              </div>

              {/* Official Certificate Preview Component */}
              <CertificatePreview cert={result.certificate} qrUrl={verificationUrl} />

              {/* Cryptographic & Ledger Audit Footer */}
              <Card noPadding className="p-4 space-y-3 bg-slate-50/60 dark:bg-slate-900/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileCheck size={14} className="text-blue-700 dark:text-blue-400" />
                  Public Verification Audit Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Evidence Chain Reference</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{result.integrity?.chainId || "CHAIN-2026-000001"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ledger Verification Timestamp</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{result.verifiedAt ? new Date(result.verifiedAt).toLocaleString() : "Live"}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 dark:border-slate-800">
                  🔐 Privacy Notice: This gateway displays publicly authorized certificate specifications only. Private business identifiers, contact numbers, and internal inspection files are protected and never disclosed.
                </p>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyCertificate;
