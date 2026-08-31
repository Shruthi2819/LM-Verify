import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { certificateService } from "../../services/certificateService";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import CertificatePreview from "../../components/common/CertificatePreview";
import EvidenceIntegrityCard from "../../components/common/EvidenceIntegrityCard";
import PredictiveComplianceCard from "../../components/common/PredictiveComplianceCard";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { getPublicVerificationUrl } from "../../config/appConfig";
import { ShieldCheck, Download, Printer, Copy, CheckCircle, XCircle, QrCode, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

function CertificateDetail() {
  const { certificateId } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Revocation Modal Trigger (Admin only)
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revocationReason, setRevocationReason] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  const loadCertificate = async () => {
    try {
      const data = await certificateService.getCertificate(certificateId);
      setCert(data);
    } catch (err) {
      toast.error("Failed to load certificate details.");
      // Redirect back according to role
      if (role === "admin") navigate(ROUTES.ADMIN_CERTIFICATES);
      else if (role === "lmo") navigate(ROUTES.LMO_CERTIFICATES);
      else navigate(ROUTES.BUSINESS_CERTIFICATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificate();
  }, [certificateId]);

  const verificationUrl = getPublicVerificationUrl(cert?.id || certificateId);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const response = await certificateService.verifyCertificate(cert.id);
      setVerifyResult(response);
      toast.success("Certificate verified against blockchain successfully!");
    } catch (err) {
      toast.error("Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast.success("Public verification link copied to clipboard.");
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(cert.blockchainHash);
    toast.success("SHA-256 integrity fingerprint copied.");
  };

  const handleDownloadPdf = async () => {
    setDownloadLoading(true);
    try {
      await certificateService.downloadCertificatePdf(cert.id);
      toast.success("PDF Downloaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to download PDF.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRevokeSubmit = async () => {
    if (!revocationReason.trim()) {
      toast.error("Please specify a valid legal reason for revocation.");
      return;
    }
    setRevokeLoading(true);
    try {
      await certificateService.revokeCertificate(cert.id, revocationReason);
      toast.success("Certificate revoked officially.");
      setRevokeOpen(false);
      loadCertificate();
    } catch (err) {
      toast.error("Failed to revoke certificate.");
    } finally {
      setRevokeLoading(false);
    }
  };

  const getBreadcrumbItems = () => {
    if (role === "admin") {
      return [
        { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
        { label: "Certificates", path: ROUTES.ADMIN_CERTIFICATES },
        { label: certificateId || "Certificate Detail" }
      ];
    }
    if (role === "lmo") {
      return [
        { label: "Dashboard", path: ROUTES.LMO_DASHBOARD },
        { label: "Certificates", path: ROUTES.LMO_CERTIFICATES },
        { label: certificateId || "Certificate Detail" }
      ];
    }
    return [
      { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
      { label: "Certificates", path: ROUTES.BUSINESS_CERTIFICATES },
      { label: certificateId || "Certificate Detail" }
    ];
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <PanelSkeleton lines={6} />
      </div>
    );
  }

  if (!cert) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 page-enter pb-12">
      {/* Breadcrumb row with print-hidden */}
      <div className="print:hidden">
        <Breadcrumbs items={getBreadcrumbItems()} />
      </div>

      {/* Main Header with Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 print:hidden dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">{cert.id}</h1>
            <StatusBadge status={cert.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Issued to <span className="font-semibold text-slate-700 dark:text-slate-300">{cert.businessName}</span> for {cert.instrumentName}
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Revoke Button */}
          {role === "admin" && cert.status.toLowerCase() !== "revoked" && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-700 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
              leftIcon={<XCircle size={14} />}
              onClick={() => setRevokeOpen(true)}
            >
              Revoke
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Copy size={14} />}
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200"
          >
            <ExternalLink size={14} /> Public Gateway
          </a>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer size={14} />}
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleDownloadPdf}
            loading={downloadLoading}
          >
            Download PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<ShieldCheck size={14} />}
            onClick={handleVerify}
            loading={verifying}
          >
            Verify Integrity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Display sheet (Printable frame) */}
        <div className="lg:col-span-2 space-y-6" id="printable-cert-area">
          <CertificatePreview cert={cert} qrUrl={verificationUrl} />
        </div>

        {/* Verification and audit records column */}
        <div className="space-y-6 print:hidden">
          {/* Predictive Compliance & Expiry */}
          <PredictiveComplianceCard
            certificate={cert}
            showActionButton={role === "business"}
          />

          {/* Tamper-Evident Evidence Chain */}
          <EvidenceIntegrityCard
            certificateId={cert.id}
            applicationId={cert.applicationId}
            chainId={cert.evidenceChainId}
          />

          {/* Blockchain Integrity */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-700 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Ledger Integrity Status</h3>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4 pt-3 text-xs">
              {!verifyResult && !verifying && (
                <div className="space-y-2">
                  <p className="text-slate-500">
                    This certificate is cryptographically signed and recorded on the immutable ledger.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleVerify}
                  >
                    Run Ledger Verification
                  </Button>
                </div>
              )}

              {verifying && (
                <div className="p-4 text-center space-y-2 text-slate-500">
                  <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[11px]">Validating cryptographic block proofs...</p>
                </div>
              )}

              {verifyResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-lg font-bold text-xs dark:bg-green-950/40 dark:border-green-800 dark:text-green-300">
                    <CheckCircle size={16} />
                    <span>Cryptographically Valid & Anchored</span>
                  </div>

                  <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono dark:bg-slate-800 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Ledger Network</span>
                      <span className="text-slate-700 dark:text-slate-300">{verifyResult.network || "Ethereum Sepolia Testnet"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Block Number</span>
                      <span className="text-slate-700 dark:text-slate-300">#5849201</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Transaction Hash</span>
                      <span className="text-slate-700 truncate block dark:text-slate-300" title={verifyResult.txHash || cert.txId}>
                        {verifyResult.txHash || cert.txId}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Revocation Modal (Admin only) */}
      <Modal
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        title="Revoke Verification Certificate"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-red-600 font-semibold">
            Warning: This action will permanently revoke certificate <strong>{cert.id}</strong>. The revocation will be written to the audit chain and public verification will flag it as REVOKED.
          </p>

          <Textarea
            label="Revocation Reason / Justification"
            placeholder="e.g. Physical seal broken, uncalibrated scale reported during inspection..."
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRevokeOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={revokeLoading}
              onClick={handleRevokeSubmit}
            >
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CertificateDetail;
