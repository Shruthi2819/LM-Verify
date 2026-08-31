import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gatcService } from "../../services/gatcService";
import { certificateService } from "../../services/certificateService";
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
import { Scale, Calendar, User, FileText, FileClock, Clock, Award } from "lucide-react";
import toast from "react-hot-toast";

function GATCApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [associatedTestId, setAssociatedTestId] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Scheduling Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("11:00 AM");
  const [modalLoading, setModalLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

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

  const loadApplication = async () => {
    try {
      const data = await gatcService.getApplication(applicationId);
      setApp(data);

      const testsData = await gatcService.getInspections();
      const tests = Array.isArray(testsData) ? testsData : (testsData?.items || []);
      const matched = tests.find(t => t.applicationId === data.id);
      if (matched) {
        setAssociatedTestId(matched.id);
      }

      const profileData = await gatcService.getProfile();
      if (profileData && new Date(profileData.accreditationExpiry) < new Date()) {
        setIsExpired(true);
      }
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

  const handleStartTest = async () => {
    if (isExpired) {
      toast.error("NABL Accreditation has expired. Starting tests is prohibited.");
      return;
    }
    const testId = associatedTestId || "TEST-2026-000109";
    try {
      await gatcService.startTest(testId);
      toast.success("Calibration test session started!");
      navigate(buildPath(ROUTES.GATC_INSPECTION_DETAIL, { inspectionId: testId }));
    } catch (err) {
      toast.error("Failed to start calibration session.");
    }
  };

  if (loading || !app) {
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

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-750 flex flex-col gap-1.5 shadow-sm">
          <span className="font-bold flex items-center gap-1">⚠️ NABL LICENSE ACCREDITATION EXPIRED</span>
          <p>Your Government Approved Test Centre authorization has expired. Starting tests or scheduling calibrations is restricted until authorization is updated.</p>
        </div>
      )}

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
              onClick={handleStartTest}
            >
              Start Test
            </Button>
          )}
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
                        onClick={() => navigate(buildPath(ROUTES.GATC_CERTIFICATE_DETAIL, { certificateId: app.certificateId }))}
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
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Certificate Status:</span>
                      <span className="font-semibold text-blue-600">NOT GENERATED</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      This application has been approved. The official digital compliance certificate is being prepared by the assigned officer.
                    </p>
                  </div>
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
