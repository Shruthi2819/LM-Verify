import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { certificateService } from "../../services/certificateService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import DocumentList from "../../components/common/DocumentList";
import ApplicationTimeline from "../../components/common/ApplicationTimeline";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Scale, Calendar, User, FileText, FileClock, Landmark, Award } from "lucide-react";
import toast from "react-hot-toast";

function AdminApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const handleGenerateCertificate = async () => {
    setGenLoading(true);
    try {
      await certificateService.generateCertificate(app.id);
      toast.success("Certificate generated successfully and registered on the blockchain!");
      setGenModalOpen(false);
      
      // Reload application
      const data = await adminService.getApplication(applicationId);
      setApp(data);
    } catch (err) {
      toast.error(err.message || "Failed to generate certificate.");
    } finally {
      setGenLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadLoading(true);
    try {
      await certificateService.downloadCertificatePdf(app.certificateId);
      toast.success("PDF Downloaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to download PDF.");
    } finally {
      setDownloadLoading(false);
    }
  };

  useEffect(() => {
    async function loadApplication() {
      try {
        const data = await adminService.getApplication(applicationId);
        setApp(data);
      } catch (err) {
        toast.error("Failed to load application details.");
        navigate(ROUTES.ADMIN_APPLICATIONS);
      } finally {
        setLoading(false);
      }
    }
    loadApplication();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
            { label: "Applications", path: ROUTES.ADMIN_APPLICATIONS },
            { label: "Details" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
          { label: "Applications", path: ROUTES.ADMIN_APPLICATIONS },
          { label: app.id }
        ]}
      />

      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <FileClock size={24} className="text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-800">Verification Record</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Application ID: {app.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {app.status === "UNDER_REVIEW" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.ADMIN_ASSIGNMENTS, { state: { assignAppId: app.id } })}
            >
              Assign Handler
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN_APPLICATIONS)}
          >
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Certificate Action Card */}
          {(app.status === "APPROVED" || app.status === "CERTIFICATE_GENERATED") && (
            <Card className={app.status === "CERTIFICATE_GENERATED" ? "border-green-200 bg-green-50/15" : "border-blue-200 bg-blue-50/15"}>
              <Card.Header className={`border-b ${app.status === "CERTIFICATE_GENERATED" ? "border-green-150" : "border-blue-150"} pb-3 mb-4 flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <Award size={16} className={app.status === "CERTIFICATE_GENERATED" ? "text-green-700" : "text-blue-700"} />
                  <h2 className="text-sm font-bold text-slate-800">Compliance Verification Certificate</h2>
                </div>
                <span className={`text-[10px] ${app.status === "CERTIFICATE_GENERATED" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"} px-2 py-0.5 rounded font-bold`}>
                  {app.status === "CERTIFICATE_GENERATED" ? "VALID & SIGNED" : "AWAITING ISSUANCE"}
                </span>
              </Card.Header>
              <Card.Body className="space-y-4 text-xs">
                {app.status === "CERTIFICATE_GENERATED" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">Certificate ID</span>
                        <p className="font-mono font-semibold text-slate-800 mt-0.5">{app.certificateId}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">Expiration Date</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{app.certificateExpiry ? formatDate(app.certificateExpiry) : "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-green-100">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(buildPath(ROUTES.ADMIN_CERTIFICATE_DETAIL, { certificateId: app.certificateId }))}
                      >
                        View Certificate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPdf}
                        loading={downloadLoading}
                      >
                        Download PDF
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Certificate Status:</span>
                        <span className="font-semibold text-red-600">NOT GENERATED</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        This application has been approved. Generate the official digital compliance certificate to anchor the verification details on the ledger and issue it to the business.
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-blue-100">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setGenModalOpen(true)}
                      >
                        Generate Certificate
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Business Details */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Business Information</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <DetailField icon={<User size={13} />} label="Company Name" value={app.businessName} />
              <DetailField icon={<User size={13} />} label="Contact Email" value={app.businessEmail} />
              <DetailField icon={<FileText size={13} />} label="Phone" value={app.businessPhone} />
              <div className="sm:col-span-2">
                <DetailField icon={<Landmark size={13} />} label="Installation Address" value={app.businessAddress} />
              </div>
            </Card.Body>
          </Card>

          {/* Instrument Specs */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Instrument Specifications</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <DetailField icon={<Scale size={13} />} label="Device Category" value={app.category} />
              <DetailField icon={<Scale size={13} />} label="Device Type" value={app.instrumentName} />
              <DetailField icon={<FileText size={13} />} label="Serial Number" value={app.instrumentSerial} />
              <DetailField icon={<Scale size={13} />} label="Capacity" value={`${app.capacity} ${app.unit}`} />
              <DetailField icon={<Scale size={13} />} label="Accuracy Class" value={app.accuracyClass} />
              <DetailField icon={<FileText size={13} />} label="Model Number" value={app.instrumentModel} />
            </Card.Body>
          </Card>

          {/* Documents */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Uploaded Documents</h2>
            </Card.Header>
            <Card.Body>
              <DocumentList documents={app.documents} readOnly={true} />
            </Card.Body>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Workflow Progress</h2>
            </Card.Header>
            <Card.Body className="pt-2">
              <ApplicationTimeline timeline={app.timeline} />
            </Card.Body>
          </Card>

          {app.assignedOfficer && (
            <Card className="mt-4">
              <Card.Header className="pb-1">
                <h3 className="text-xs font-bold text-slate-700">Handler Allocation</h3>
              </Card.Header>
              <Card.Body className="text-xs space-y-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Handler:</span>
                  <span className="font-semibold text-slate-800">{app.assignedOfficer}</span>
                </div>
                {app.scheduledDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled Date:</span>
                    <span className="font-semibold text-slate-800">{formatDate(app.scheduledDate)}</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* Certificate Generation Confirmation Modal */}
      <Modal open={genModalOpen} onClose={() => setGenModalOpen(false)} title="Generate Digital Certificate">
        <div className="space-y-4 text-xs select-none">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to generate this compliance metrology certificate? Once generated, the record is finalized and cannot be modified.
          </p>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 p-3 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Application:</span>
              <span className="font-mono font-semibold text-slate-800">{app.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Instrument:</span>
              <span className="font-semibold text-slate-800">{app.instrumentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Serial Number:</span>
              <span className="font-mono font-semibold text-slate-800">{app.instrumentSerial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Verification Result:</span>
              <span className="font-bold text-green-700 flex items-center gap-1">PASS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authorized Officer:</span>
              <span className="font-semibold text-slate-800">{app.assignedOfficer || "Priya Sharma"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Issue Date:</span>
              <span className="font-semibold text-slate-800">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expiry Date:</span>
              <span className="font-semibold text-slate-800">{new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setGenModalOpen(false)} disabled={genLoading}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleGenerateCertificate} loading={genLoading}>
              Generate Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DetailField({ icon, label, value }) {
  return (
    <div className="flex gap-2">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-slate-800 font-semibold mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

export default AdminApplicationDetail;
