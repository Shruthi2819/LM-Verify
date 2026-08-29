import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import DocumentList from "../../components/common/DocumentList";
import ApplicationTimeline from "../../components/common/ApplicationTimeline";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Scale, Calendar, User, FileText, FileClock, Landmark } from "lucide-react";
import toast from "react-hot-toast";

function AdminApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

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
