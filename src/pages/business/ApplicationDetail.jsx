import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationService } from "../../services/applicationService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import DocumentList from "../../components/common/DocumentList";
import ApplicationTimeline from "../../components/common/ApplicationTimeline";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Scale, Calendar, User, FileText, FileClock, ShieldAlert, Award, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplication() {
      try {
        const data = await applicationService.getApplication(applicationId);
        setApp(data);
      } catch (err) {
        toast.error("Failed to load application details.");
        navigate(ROUTES.BUSINESS_APPLICATIONS);
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
            { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
            { label: "Applications", path: ROUTES.BUSINESS_APPLICATIONS },
            { label: "Details" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  const getNextActionMessage = (status) => {
    switch (status) {
      case "DRAFT":
        return "Please review the instrument specifications and submit the application.";
      case "SUBMITTED":
        return "Your application has been received and is currently in the initial validation queue.";
      case "UNDER_REVIEW":
        return "Verification documents are being reviewed. No action required from your end.";
      case "ASSIGNED":
        return "An officer or laboratory has been assigned. Awaiting inspection schedule confirmation.";
      case "SCHEDULED":
        return `Verification is scheduled for ${app.scheduledDate ? formatDate(app.scheduledDate) : "the selected date"}. Please ensure access to the device.`;
      case "INSPECTION_COMPLETED":
        return "Calibration checks have finished. The supervisor is validating the stamping report.";
      case "APPROVED":
        return " stencils verified! The system is signing the digital certificate key.";
      case "CERTIFICATE_GENERATED":
        return "Verification certificate generated and anchored to the ledger. Download is available.";
      case "REJECTED":
        return "Verification rejected due to non-compliance. Please check reasons and apply again.";
      default:
        return "Pending verification workflow progression.";
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
          { label: "Applications", path: ROUTES.BUSINESS_APPLICATIONS },
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
              <h1 className="text-lg font-bold text-slate-800">Application Tracking</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Application ID: {app.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.BUSINESS_APPLICATIONS)}
          >
            Back to List
          </Button>
        </div>
      </div>

      {/* Contextual Next Step Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
        <ArrowRight size={18} className="text-blue-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-700">
          <p className="font-semibold text-slate-800">Status Update Details</p>
          <p className="mt-1 leading-relaxed text-slate-600">{getNextActionMessage(app.status)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rejection Alert */}
          {app.status === "REJECTED" && (
            <Card className="border-red-200 bg-red-50/20">
              <Card.Header className="border-b border-red-100 pb-3 mb-4 flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-700" />
                <h2 className="text-sm font-bold text-red-800">Application Rejection Details</h2>
              </Card.Header>
              <Card.Body className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Rejection Reason:</span>
                  <p className="text-red-700 mt-1 font-medium bg-red-50 border border-red-100 rounded p-2.5">
                    {app.rejectionReason || "Non-compliance with required metrology standard specifications."}
                  </p>
                </div>
                {app.rejectionRemarks && (
                  <div>
                    <span className="font-semibold text-slate-700">Official Inspector Remarks:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 rounded p-2 border border-slate-100">
                      {app.rejectionRemarks}
                    </p>
                  </div>
                )}
                {app.completedDate && (
                  <div>
                    <span className="font-semibold text-slate-700">Rejected On:</span>
                    <p className="text-slate-500 mt-0.5">{formatDate(app.completedDate)}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Certificate Action Box */}
          {app.status === "CERTIFICATE_GENERATED" && app.certificateId && (
            <Card className="border-green-200 bg-green-50/15">
              <Card.Header className="border-b border-green-150 pb-3 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-green-700" />
                  <h2 className="text-sm font-bold text-green-800">Generated Calibration Certificate</h2>
                </div>
                <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
                  VALID & SIGNED
                </span>
              </Card.Header>
              <Card.Body className="space-y-4 text-xs">
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
                    onClick={() => navigate(buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: app.certificateId }))}
                  >
                    View Calibration Certificate
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Instrument Specifications</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <DetailField icon={<Scale size={13} />} label="Instrument ID" value={app.instrumentId} />
              <DetailField icon={<Scale size={13} />} label="Instrument Name" value={app.instrumentName} />
              <DetailField icon={<FileText size={13} />} label="Serial Number" value={app.instrumentSerial} />
              <DetailField icon={<FileText size={13} />} label="Assigned Officer / lab" value={app.assignedOfficer || "Awaiting assignment"} />
              <DetailField icon={<Calendar size={13} />} label="Scheduled Inspection" value={app.scheduledDate ? formatDate(app.scheduledDate) : "Not scheduled"} />
              <DetailField icon={<Calendar size={13} />} label="Submission Date" value={formatDate(app.submittedDate)} />
            </Card.Body>
          </Card>

          {app.notes && (
            <Card>
              <Card.Header className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-800">Submission Notes</h2>
              </Card.Header>
              <Card.Body className="text-xs text-slate-600 leading-relaxed">
                {app.notes}
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Attached Documents</h2>
            </Card.Header>
            <Card.Body>
              <DocumentList documents={app.documents} readOnly={true} />
            </Card.Body>
          </Card>
        </div>

        {/* Timeline Sidebar */}
        <div>
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Workflow Progress</h2>
            </Card.Header>
            <Card.Body className="pt-2">
              <ApplicationTimeline timeline={app.timeline} />
            </Card.Body>
          </Card>
        </div>
      </div>
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

export default ApplicationDetail;
