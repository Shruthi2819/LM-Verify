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
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { ShieldCheck, Download, Printer, Copy, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

function CertificateDetail() {
  const { certificateId } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

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
    const link = `${window.location.origin}/verify/${cert.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Verification link copied to clipboard.");
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(cert.blockchainHash);
    toast.success("SHA-256 integrity fingerprint copied.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revocationReason.trim()) {
      toast.error("Please enter a revocation reason.");
      return;
    }
    setRevokeLoading(true);
    try {
      await certificateService.revokeCertificate(cert.id, revocationReason);
      toast.success("Certificate revoked successfully.");
      setRevokeOpen(false);
      loadCertificate();
    } catch (err) {
      toast.error(err.message || "Failed to revoke certificate.");
    } finally {
      setRevokeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard" },
            { label: "Certificates" },
            { label: "Details" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  // Set role-based pathing in breadcrumbs
  const getDashboardPath = () => {
    if (role === "admin") return ROUTES.ADMIN_DASHBOARD;
    if (role === "lmo") return ROUTES.LMO_DASHBOARD;
    if (role === "gatc") return ROUTES.GATC_DASHBOARD;
    return ROUTES.BUSINESS_DASHBOARD;
  };

  const getCertificatesPath = () => {
    if (role === "admin") return ROUTES.ADMIN_CERTIFICATES;
    if (role === "lmo") return ROUTES.LMO_CERTIFICATES;
    if (role === "gatc") return ROUTES.GATC_CERTIFICATES;
    return ROUTES.BUSINESS_CERTIFICATES;
  };

  const verificationUrl = `${window.location.origin}/verify/${cert.id}`;

  return (
    <div className="space-y-6 page-enter max-w-5xl mx-auto print:p-0">
      {/* Scope print-only styles dynamically */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-cert-area, #printable-cert-area * {
            visibility: visible;
          }
          #printable-cert-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="print:hidden">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: getDashboardPath() },
            { label: "Certificates", path: getCertificatesPath() },
            { label: cert.id }
          ]}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Verification Certificate details</h1>
          <p className="text-sm text-slate-500 mt-0.5">Validate and audit digitally stamped metrology parameters</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {role === "admin" && cert.status.toLowerCase() === "valid" && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle size={14} />}
              onClick={() => setRevokeOpen(true)}
            >
              Revoke Certificate
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer size={14} />}
            onClick={handlePrint}
          >
            Print Sheet
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Copy size={14} />}
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
          <Button
            variant="primary"
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
          {/* Blockchain Integrity */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-700" />
                <h3 className="text-xs font-bold text-slate-800">Ledger Integrity Status</h3>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4 pt-3">
              {!verifyResult && !verifying && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-500 leading-relaxed">
                    This certificate is anchored on the blockchain ledger network. Audit the cryptographic fingerprint.
                  </p>
                  <Button variant="outline" size="sm" className="w-full cursor-pointer" onClick={handleVerify}>
                    Verify On-chain Record
                  </Button>
                </div>
              )}

              {verifying && (
                <div className="text-center py-4 space-y-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mx-auto" />
                  <p className="text-[10px] text-slate-400 font-medium">Querying ledger node hash reference...</p>
                </div>
              )}

              {verifyResult && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-150 text-green-700">
                    <CheckCircle size={14} />
                    <span className="font-semibold">Integrity Match Confirmed</span>
                  </div>

                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[10px] text-slate-650">
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-slate-400">Fingerprint Hash</span>
                        <button type="button" onClick={handleCopyHash} className="text-blue-700 hover:underline text-[9px] cursor-pointer">Copy</button>
                      </div>
                      <p className="truncate text-slate-700" title={cert.blockchainHash}>{cert.blockchainHash}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Transaction reference</span>
                      <p className="truncate text-slate-700" title={cert.txId}>{cert.txId}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Ledger Network</span>
                      <p className="text-slate-700">{cert.network}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Copyable verification links */}
          <Card className="text-xs space-y-3">
            <h3 className="font-bold text-slate-800">Public Verification</h3>
            <p className="text-slate-500 leading-relaxed">
              Copy this link to email clients or share for instant public compliance scans.
            </p>
            <input
              type="text"
              readOnly
              value={verificationUrl}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-600 focus:outline-none"
            />
            <Button variant="outline" size="sm" className="w-full cursor-pointer" onClick={handleCopyLink}>
              Copy Link URL
            </Button>
          </Card>
        </div>
      </div>

      {/* Admin Revoke Modal */}
      <Modal open={revokeOpen} onClose={() => setRevokeOpen(false)} title="Revoke Verification Certificate">
        <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs">
          <p className="text-slate-650 leading-relaxed">
            ⚠️ **Warning:** You are revoking certificate **{cert.id}**. This action is permanent, and will mark the certificate as inactive in all public verification searches.
          </p>
          <Textarea
            label="Revocation Reason"
            required
            placeholder="Provide official non-compliance details..."
            value={revocationReason}
            onChange={(e) => setRevocationReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRevokeOpen(false)} disabled={revokeLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={revokeLoading}>
              Confirm Revocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CertificateDetail;
