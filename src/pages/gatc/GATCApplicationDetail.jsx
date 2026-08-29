import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gatcService } from "../../services/gatcService";
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
import { Scale, Calendar, User, FileText, FileClock, Clock } from "lucide-react";
import toast from "react-hot-toast";

function GATCApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scheduling Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("11:00 AM");
  const [modalLoading, setModalLoading] = useState(false);

  const loadApplication = async () => {
    try {
      const data = await gatcService.getApplication(applicationId);
      setApp(data);
    } catch (err) {
      toast.error("Failed to load application.");
      navigate(ROUTES.GATC_APPLICATIONS);
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
      await gatcService.scheduleInspection(app.id, scheduledDate, scheduledTime);
      toast.success("Calibration test scheduled successfully!");
      setScheduleModalOpen(false);
      loadApplication();
    } catch (err) {
      toast.error(err.message || "Failed to schedule test.");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.GATC_DASHBOARD },
            { label: "Applications", path: ROUTES.GATC_APPLICATIONS },
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
          { label: "Dashboard", path: ROUTES.GATC_DASHBOARD },
          { label: "Applications", path: ROUTES.GATC_APPLICATIONS },
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
              <h1 className="text-lg font-bold text-slate-800">Calibration Task details</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Application ID: {app.id}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {app.status === "UNDER_REVIEW" && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Calendar size={14} />}
              onClick={() => setScheduleModalOpen(true)}
            >
              Schedule Calibration
            </Button>
          )}

          {app.status === "SCHEDULED" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                navigate(buildPath(ROUTES.GATC_INSPECTION_DETAIL, { inspectionId: "TEST-2026-000109" }));
              }}
            >
              Perform Test
            </Button>
          )}
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
              <DetailField icon={<User size={13} />} label="Assigned Manager" value={app.assignedOfficer} />
              <DetailField icon={<FileText size={13} />} label="Email" value={app.businessEmail} />
              <DetailField icon={<FileText size={13} />} label="Phone" value={app.businessPhone} />
              <div className="sm:col-span-2">
                <DetailField icon={<FileText size={13} />} label="Address Location" value={app.businessAddress} />
              </div>
            </Card.Body>
          </Card>

          {/* Instrument Specs */}
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

          {/* Documents */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Accredited Calibration Documents</h2>
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
        </div>
      </div>

      {/* Schedule Calibration Modal */}
      <Modal open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Schedule GATC Calibration Test">
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

export default GATCApplicationDetail;
