import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicVerificationService } from "../../services/publicVerificationService";
import CertificatePreview from "../../components/common/CertificatePreview";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { Search, BadgeCheck, XCircle, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

function VerifyCertificate() {
  const { certificateId: paramId } = useParams();
  const navigate = useNavigate();

  const [certId, setCertId] = useState(paramId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | { valid, status, certificate }

  const handleVerify = async (idToVerify) => {
    const targetId = idToVerify || certId;
    if (!targetId.trim()) {
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

  // Build the public verification URL for the QR code representation
  const verificationUrl = `${window.location.origin}/verify/${result?.certificate?.id || certId}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 page-enter">
      {/* Brand Header */}
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={26} className="text-blue-700" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Public Verification Gateway</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verify the validity and cryptographic integrity of Legal Metrology certificates
        </p>
      </div>

      {/* Manual lookup input */}
      <Card className="p-5">
        <div className="space-y-4">
          <Input
            label="Certificate Identifier"
            placeholder="e.g. CERT-2026-000007"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            onKeyDown={handleKeyDown}
            helperText="Enter the unique ID found on the certificate sheet."
          />
          <Button
            variant="primary"
            className="w-full text-xs sm:text-sm h-10 cursor-pointer"
            leftIcon={<Search size={14} />}
            loading={loading}
            onClick={() => handleVerify()}
          >
            Verify Certificate
          </Button>
        </div>
      </Card>

      {/* Query Result View */}
      {result && (
        <div className="space-y-6">
          {/* 1. NOT FOUND */}
          {result.status === "NOT_FOUND" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-xs">
              <XCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-bold text-red-800 text-sm">Certificate Not Found</h3>
                <p className="text-red-700 leading-relaxed">
                  The certificate ID could not be verified against the official digital records.
                </p>
                <div className="bg-red-100/50 rounded border border-red-200 p-2.5 mt-2 space-y-1 text-[11px] text-red-700">
                  <p className="font-semibold">Verification advice:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Check if the certificate ID spelling is correct</li>
                    <li>Ensure you are querying the correct regional division portal</li>
                    <li>If this is a physical paper certificate, it may be a forged copy</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. VERIFIED - ACTIVE */}
          {result.status === "VERIFIED" && result.certificate?.status.toLowerCase() === "valid" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-xs">
                <BadgeCheck size={26} className="text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-800 text-sm">✓ Certificate Verified</h3>
                  <p className="text-green-600 mt-0.5">This document is valid and matches the anchored ledger records.</p>
                </div>
              </div>
              
              {/* Premium Preview Component */}
              <CertificatePreview cert={result.certificate} qrUrl={verificationUrl} />
            </div>
          )}

          {/* 3. EXPIRED */}
          {result.status === "VERIFIED" && result.certificate?.status.toLowerCase() === "expired" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
                <AlertTriangle size={26} className="text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-800 text-sm">⚠ Validity Expired</h3>
                  <p className="text-amber-600 mt-0.5">The certificate matches the records but the validation term has ended.</p>
                </div>
              </div>

              <CertificatePreview cert={result.certificate} qrUrl={verificationUrl} />
            </div>
          )}

          {/* 4. REVOKED */}
          {result.status === "VERIFIED" && result.certificate?.status.toLowerCase() === "revoked" && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-xs">
                <XCircle size={26} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-800 text-sm">✕ Certificate Revoked</h3>
                  <p className="text-red-700 mt-0.5">This certificate has been revoked by administration and is no longer valid.</p>
                </div>
              </div>

              <CertificatePreview cert={result.certificate} qrUrl={verificationUrl} />
            </div>
          )}

          {/* Anti-spoofing disclaimer card */}
          {result.status !== "NOT_FOUND" && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-[11px] text-slate-500 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-700">🔐 Online Verification Notice:</p>
              <p>
                Physical printouts or PDF screenshots can be altered. Verify the certificate status by scan-auditing the QR code to resolve the live record on this official department gateway.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyCertificate;
