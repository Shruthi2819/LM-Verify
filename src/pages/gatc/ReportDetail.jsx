import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gatcService } from "../../services/gatcService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatusBadge from "../../components/feedback/StatusBadge";
import EvidenceTimeline from "../../components/gatc/EvidenceTimeline";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { Scale, ShieldCheck, MapPin, Key, ScrollText, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await gatcService.getReport(reportId);
        setReport(data);
      } catch (err) {
        toast.error("Failed to load report details.");
        navigate(ROUTES.GATC_REPORTS);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  if (loading || !report) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.GATC_DASHBOARD }, { label: "Reports", path: ROUTES.GATC_REPORTS }, { label: "Details" }]} />
        <PanelSkeleton />
      </div>
    );
  }

  const timelineEvents = [
    { type: "SUBMISSION", title: "Application Lodged", timestamp: report.testDate + "T10:00:00Z", description: "Business User uploaded verification details.", actor: "Business Representative" },
    { type: "PHOTO", title: "Evidence Uploaded", timestamp: report.testDate + "T11:20:00Z", description: `Attached image: ${report.photos?.[0]?.name || "device_frame.jpg"}.`, actor: "GATC Technician" },
    { type: "AI", title: "AI Integrity Analysis", timestamp: report.testDate + "T11:21:00Z", description: "Checked OIML tolerances, zero load scales and image integrity.", actor: "AI Verification Model" },
    { type: "REPORT", title: "Report Finalized", timestamp: report.testDate + "T11:30:00Z", description: `GATC Recommendation submitted: ${report.result}.`, actor: "GATC Lead Approver" }
  ];

  return (
    <div className="space-y-6 page-enter max-w-6xl mx-auto pb-10">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.GATC_DASHBOARD },
          { label: "Reports", path: ROUTES.GATC_REPORTS },
          { label: report.id }
        ]}
      />

      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <ScrollText size={24} className="text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-800">Calibration Test Report</h1>
              <StatusBadge status={report.result} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Report ID: {report.id} · App ID: {report.applicationId}</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 text-right">
          <span className="block font-semibold">GATC Hub: Pune Centre</span>
          <span className="block text-slate-400">Submitted: {report.submittedDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Characteristics */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Device Characteristics</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-slate-650">
              <div>
                <span className="text-slate-400 block font-medium">Instrument Type</span>
                <span className="font-semibold text-slate-800">{report.instrumentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Serial Number</span>
                <span className="font-mono font-semibold text-slate-800">{report.instrumentSerial}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Model Reference</span>
                <span className="font-semibold text-slate-800">{report.applicationId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Target Business</span>
                <span className="font-semibold text-slate-800 truncate block">{report.businessName}</span>
              </div>
            </Card.Body>
          </Card>

          {/* Checklist */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Accreditation Checklist Findings</h2>
            </Card.Header>
            <Card.Body className="space-y-3 pt-1">
              {(report.checklist || []).map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 text-xs">
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  <span className={["px-2 py-0.5 rounded text-[10px] font-bold border", item.value === "PASS" ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"].join(" ")}>
                    {item.value}
                  </span>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Measurements */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Calibration Readings</h2>
            </Card.Header>
            <Card.Body className="space-y-3 pt-1">
              <div className="hidden sm:grid grid-cols-4 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                <span className="col-span-2">Test Point</span>
                <span>Standard Weight</span>
                <span>Observed Error</span>
              </div>
              {(report.measurements || []).map((m) => (
                <div key={m.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center py-2 border-b border-slate-50 last:border-0 text-xs">
                  <span className="sm:col-span-2 font-medium text-slate-700">{m.testName}</span>
                  <div>
                    <span className="sm:hidden text-[10px] text-slate-400 uppercase font-semibold">Standard: </span>
                    <span className="font-mono font-semibold text-slate-800">{m.standardValue} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="sm:hidden text-[10px] text-slate-400 uppercase font-semibold">Observed: </span>
                    <span className="font-mono font-bold text-slate-800">
                      {m.observedValue !== null ? `${m.observedValue} kg` : "—"}
                    </span>
                    {m.error !== null && (
                      <span className={["text-[9px] font-bold px-1.5 py-0.5 rounded border", m.result === "PASS" ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"].join(" ")}>
                        {m.error > 0 ? `+${m.error}` : m.error} ({m.result})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Evidence Gallery */}
          {report.photos && report.photos.length > 0 && (
            <Card>
              <Card.Header className="border-b border-slate-100 pb-2 mb-3">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Calibration Evidence Photographs</h2>
              </Card.Header>
              <Card.Body className="grid grid-cols-4 gap-3">
                {report.photos.map((p, idx) => (
                  <div key={idx} className="rounded border border-slate-200 overflow-hidden bg-slate-50 aspect-square flex flex-col justify-center items-center text-[10px] text-slate-500 font-medium">
                    {p.preview ? (
                      <img src={p.preview} alt={p.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="p-3 text-center space-y-1">
                        <Scale size={16} className="mx-auto text-slate-400" />
                        <span className="truncate block max-w-full">{p.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Remarks */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-2">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Findings Remarks</h2>
            </Card.Header>
            <Card.Body>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-150 font-medium leading-relaxed">
                {report.remarks || "No supplementary findings remarks documented."}
              </p>
            </Card.Body>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Blockchain & Digital Signature widget */}
          <Card className="border-blue-200 bg-blue-50/5">
            <Card.Header className="border-b border-blue-100 pb-2 mb-3 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-700" />
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Blockchain Anchorage Status</h3>
            </Card.Header>
            <Card.Body className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Security Index</span>
                <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-150">
                  {report.blockchainStatus}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Anchoring hash ID</span>
                <span className="font-mono text-[10px] text-slate-600 block truncate bg-white p-1.5 rounded border border-slate-200 select-all" title={report.blockchainHash}>
                  {report.blockchainHash}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Transaction signature</span>
                <span className="font-mono text-[10px] text-slate-600 block truncate bg-white p-1.5 rounded border border-slate-200 select-all" title={report.blockchainTx}>
                  {report.blockchainTx}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Signature Status:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-0.5"><Key size={10} /> {report.signatureStatus}</span>
              </div>
            </Card.Body>
          </Card>

          {/* GPS Coordinates panel */}
          {report.gps && (
            <Card>
              <Card.Header className="border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">GPS Location Anchor</h3>
              </Card.Header>
              <Card.Body className="text-xs space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Latitude</span>
                  <span className="font-mono font-semibold text-slate-800">{report.gps.lat}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Longitude</span>
                  <span className="font-mono font-semibold text-slate-800">{report.gps.lng}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[9px] text-slate-400 text-center font-mono">
                  Captured: {new Date(report.gps.timestamp).toLocaleString()}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Evidence vertical trace history */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Audit Evidence Stepper</h3>
            </Card.Header>
            <Card.Body>
              <EvidenceTimeline events={timelineEvents} />
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ReportDetail;
