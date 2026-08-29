import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { lmoService } from "../../services/lmoService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import DocumentList from "../../components/common/DocumentList";
import ApplicationTimeline from "../../components/common/ApplicationTimeline";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Modal from "../../components/common/Modal";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Scale, Calendar, User, FileText, FileClock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal triggers
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Form states inside modals
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00 AM");
  const [scheduleRemarks, setScheduleRemarks] = useState("");
  const [actionRemarks, setActionRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Loading states
  const [modalLoading, setModalLoading] = useState(false);

  const loadApplication = async () => {
    try {
      const data = await lmoService.getApplication(applicationId);
      setApp(data);
    } catch (err) {
      toast.error("Failed to load application.");
      navigate(ROUTES.LMO_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduledDate) {
      toast.error("Please pick a schedule date.");
      return;
    }
    setModalLoading(true);
    try {
      await lmoService.scheduleInspection(app.id, scheduledDate, scheduledTime);
      toast.success("Inspection scheduled successfully!");
      setScheduleModalOpen(false);
      loadApplication();
    } catch (err) {
      toast.error(err.message || "Failed to schedule inspection.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = async () => {
    setModalLoading(true);
    try {
      await lmoService.approveApplication(app.id, actionRemarks);
      toast.success("Application approved! Digital certificate is being generated.");
      setApproveModalOpen(false);
      loadApplication();
    } catch (err) {
      toast.error(err.message || "Approval failed.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    setModalLoading(true);
    try {
      await lmoService.rejectApplication(app.id, rejectReason);
      toast.success("Application rejected.");
      setRejectModalOpen(false);
      loadApplication();
    } catch (err) {
      toast.error(err.message || "Rejection failed.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleStartInspection = async () => {
    try {
      const inspections = await lmoService.getInspections();
      const matched = inspections.find((ins) => ins.applicationId === app.id);
      if (matched) {
        navigate(buildPath(ROUTES.LMO_INSPECTION_DETAIL, { inspectionId: matched.id }));
      } else {
        navigate(buildPath(ROUTES.LMO_INSPECTION_DETAIL, { inspectionId: "INS-2026-000321" }));
      }
    } catch (err) {
      toast.error("Failed to find scheduled inspection.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.LMO_DASHBOARD },
            { label: "Applications", path: ROUTES.LMO_APPLICATIONS },
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
          { label: "Dashboard", path: ROUTES.LMO_DASHBOARD },
          { label: "Applications", path: ROUTES.LMO_APPLICATIONS },
          { label: app.id }
        ]}
      />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <FileClock size={24} className="text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-800">Verification Review</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Application ID: {app.id}</p>
          </div>
        </div>

        {/* Workflow actions dashboard card */}
        <div className="flex gap-2 flex-wrap">
          {app.status === "UNDER_REVIEW" && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Calendar size={14} />}
              onClick={() => setScheduleModalOpen(true)}
            >
              Schedule Inspection
            </Button>
          )}

          {app.status === "SCHEDULED" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartInspection}
            >
              Start Inspection
            </Button>
          )}

          {app.status === "INSPECTION_COMPLETED" && (
            <>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle size={14} />}
                onClick={() => setRejectModalOpen(true)}
              >
                Reject Application
              </Button>
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle size={14} />}
                onClick={() => setApproveModalOpen(true)}
              >
                Approve Verification
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specifications detail cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Business Information</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <DetailField icon={<User size={13} />} label="Company Name" value={app.businessName} />
              <DetailField icon={<User size={13} />} label="Contact Person" value={app.assignedOfficer} />
              <DetailField icon={<FileText size={13} />} label="Email" value={app.businessEmail} />
              <DetailField icon={<FileText size={13} />} label="Phone" value={app.businessPhone} />
              <div className="sm:col-span-2">
                <DetailField icon={<FileText size={13} />} label="Address Location" value={app.businessAddress} />
              </div>
            </Card.Body>
          </Card>

          {/* Device details */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Instrument Specifications</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <DetailField icon={<Scale size={13} />} label="Instrument Type" value={app.instrumentName} />
              <DetailField icon={<FileText size={13} />} label="Serial Number" value={app.instrumentSerial} />
              <DetailField icon={<Scale size={13} />} label="Capacity" value={`${app.capacity} ${app.unit}`} />
              <DetailField icon={<Scale size={13} />} label="Accuracy Class" value={app.accuracyClass} />
              <DetailField icon={<FileText size={13} />} label="Manufacturer" value={app.instrumentManufacturer} />
              <DetailField icon={<FileText size={13} />} label="Model Number" value={app.instrumentModel} />
            </Card.Body>
          </Card>

          {/* Attachments */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Supporting Attachments</h2>
            </Card.Header>
            <Card.Body>
              <DocumentList documents={app.documents} readOnly={true} />
            </Card.Body>
          </Card>
        </div>

        {/* Timeline tracking side card */}
        <div>
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Workflow Progress</h2>
            </Card.Header>
            <Card.Body className="pt-2">
              <ApplicationTimeline timeline={app.timeline} />
            </Card.Body>
          </Card>

          {app.rejectionReason && (
            <Card className="mt-4 border-red-200 bg-red-50/20">
              <Card.Header className="pb-1">
                <h3 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                  <XCircle size={14} /> Rejection Details
                </h3>
              </Card.Header>
              <Card.Body className="text-xs text-red-700 leading-relaxed pt-1">
                {app.rejectionReason}
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* 1. Schedule Inspection Modal */}
      <Modal open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Schedule Field Inspection">
        <form onSubmit={handleSchedule} className="space-y-4 text-xs">
          <Input
            label="Schedule Date"
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
          <Input
            label="Preferred Slot / Time"
            required
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            placeholder="e.g. 10:30 AM"
          />
          <Textarea
            label="Schedule remarks"
            placeholder="Add location directives or appointment notifications..."
            value={scheduleRemarks}
            onChange={(e) => setScheduleRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={modalLoading}>
              Confirm Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Approve Modal */}
      <Modal open={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="Approve Verification Certificate">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to approve this verification application? Stamping logs and digital certificate generation will be initialized on the backend.
          </p>
          <Textarea
            label="Verification Stamping Notes / Remarks"
            placeholder="Add comments about compliance parameters or seal numbers..."
            value={actionRemarks}
            onChange={(e) => setActionRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setApproveModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleApprove} loading={modalLoading}>
              Approve Verification
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Reject Modal */}
      <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Verification Application">
        <form onSubmit={handleReject} className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to reject this verification application? Please specify the non-compliance reasons clearly.
          </p>
          <Textarea
            label="Rejection Reason"
            required
            placeholder="Specify reason for non-compliance..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={modalLoading}>
              Confirm Rejection
            </Button>
          </div>
        </form>
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

export default ApplicationDetail;
