import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gatcService } from "../../services/gatcService";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import FileUpload from "../../components/common/FileUpload";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { ACCEPTED_DOC_TYPES } from "../../utils/constants";
import { formatDate } from "../../utils/helpers";
import { Scale, CheckCircle2, AlertTriangle, Clock, MapPin, Camera, X } from "lucide-react";
import toast from "react-hot-toast";

function GATCInspectionDetail() {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const [ins, setIns] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [checklist, setChecklist] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [photos, setPhotos] = useState([]);
  const [result, setResult] = useState(""); // PASS, FAIL
  
  // Uploader and submission loaders
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    async function loadInspection() {
      try {
        const data = await gatcService.getInspection(inspectionId);
        setIns(data);
        setChecklist(data.checklist || []);
        setMeasurements(data.measurements || []);
        setRemarks(data.remarks || "");
        setResult(data.result || "");
        setPhotos(data.photos || []);
      } catch (err) {
        toast.error("Failed to load calibration details.");
        navigate(ROUTES.GATC_SCHEDULE);
      } finally {
        setLoading(false);
      }
    }
    loadInspection();
  }, [inspectionId]);

  const handleChecklistChange = (id, val) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value: val } : item))
    );
  };

  const handleMeasurementChange = (id, field, val) => {
    setMeasurements((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: val };
        
        if (field === "observedValue") {
          const obs = parseFloat(val);
          const std = parseFloat(updated.standardValue);
          if (!isNaN(obs) && !isNaN(std)) {
            updated.error = (obs - std).toFixed(2);
            updated.result = Math.abs(obs - std) <= 0.25 ? "PASS" : "FAIL";
          } else {
            updated.error = null;
            updated.result = "";
          }
        }
        return updated;
      })
    );
  };

  const handlePhotoUpload = async (files) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((f) =>
        gatcService.uploadEvidence(ins.id, f)
      );
      const results = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...results]);
      toast.success("Photos attached successfully!");
    } catch (err) {
      toast.error("Failed to upload photos.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    const incompleteChecklist = checklist.some(c => !c.value);
    if (incompleteChecklist) {
      toast.error("Please complete all items on the calibration checklist.");
      setConfirmOpen(false);
      return;
    }

    const incompleteMeasurements = measurements.some(m => m.observedValue === null || m.observedValue === "");
    if (incompleteMeasurements) {
      toast.error("Please fill in observed measurements readings.");
      setConfirmOpen(false);
      return;
    }

    if (!result) {
      toast.error("Please determine a final calibration result (PASS/FAIL).");
      setConfirmOpen(false);
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        checklist,
        measurements,
        remarks,
        result,
        photos
      };
      await gatcService.submitInspection(ins.id, payload);
      toast.success("GATC Calibration Report submitted successfully!");
      setConfirmOpen(false);
      navigate(buildPath(ROUTES.GATC_APPLICATION_DETAIL, { applicationId: ins.applicationId }));
    } catch (err) {
      toast.error(err.message || "Failed to submit calibration.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.GATC_DASHBOARD },
            { label: "Schedule", path: ROUTES.GATC_SCHEDULE },
            { label: "Checklist" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-5xl mx-auto pb-10">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.GATC_DASHBOARD },
          { label: "Schedule", path: ROUTES.GATC_SCHEDULE },
          { label: ins.id }
        ]}
      />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Scale size={20} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">GATC Calibration Evaluation</h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">TEST ID: {ins.id} · APP ID: {ins.applicationId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-0.5"><Clock size={12} /> {ins.scheduledTime}</span>
          <span className="flex items-center gap-0.5"><MapPin size={12} /> {ins.location.split(",")[0]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Device characteristics read-only */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Device Characteristics</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block">Instrument Type</span>
                <span className="font-semibold text-slate-800">{ins.instrumentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Serial Number</span>
                <span className="font-mono font-semibold text-slate-800">{ins.instrumentSerial}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Model</span>
                <span className="font-semibold text-slate-800">{ins.instrumentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Installation Address</span>
                <span className="font-semibold text-slate-800 truncate block">{ins.location}</span>
              </div>
            </Card.Body>
          </Card>

          {/* Checklist */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">NABL Accreditation Checklist</h2>
            </Card.Header>
            <Card.Body className="space-y-3 pt-1">
              {checklist.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-700 font-medium">{item.label}</span>
                  <div className="flex gap-2">
                    {["PASS", "FAIL", "N/A"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChecklistChange(item.id, opt)}
                        className={[
                          "px-3 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer",
                          item.value === opt
                            ? opt === "PASS"
                              ? "bg-green-600 border-green-600 text-white"
                              : opt === "FAIL"
                              ? "bg-red-600 border-red-600 text-white"
                              : "bg-slate-500 border-slate-500 text-white"
                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                        ].join(" ")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Measurements */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Standard Weights Calibration</h2>
            </Card.Header>
            <Card.Body className="space-y-4 pt-1">
              <div className="hidden sm:grid grid-cols-5 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                <span className="col-span-2">Test Parameters</span>
                <span>Standard Value</span>
                <span>Observed Reading</span>
                <span>Calculated Error / Result</span>
              </div>

              {measurements.map((m) => (
                <div key={m.id} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center py-2 border-b border-slate-50 last:border-0 text-xs">
                  <span className="sm:col-span-2 font-medium text-slate-700">{m.testName}</span>
                  <div className="flex items-center gap-1">
                    <span className="sm:hidden text-[10px] text-slate-400 uppercase font-semibold">Standard: </span>
                    <span className="font-mono font-semibold text-slate-800">{m.standardValue}</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Observed"
                      value={m.observedValue ?? ""}
                      className="h-8 text-xs py-1"
                      onChange={(e) => handleMeasurementChange(m.id, "observedValue", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {m.error !== null ? (
                      <>
                        <span className={["font-mono font-bold", parseFloat(m.error) === 0 ? "text-green-700" : "text-slate-600"].join(" ")}>
                          {m.error > 0 ? `+${m.error}` : m.error}
                        </span>
                        <span className={["text-[9px] font-bold px-1 py-0.5 rounded border", m.result === "PASS" ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"].join(" ")}>
                          {m.result}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>

        {/* Evidence, Remarks & Submission Panel */}
        <div className="space-y-6">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Calibration Evidence</h2>
            </Card.Header>
            <Card.Body className="space-y-4">
              <FileUpload
                accept={ACCEPTED_DOC_TYPES}
                onChange={handlePhotoUpload}
                loading={uploading}
                helperText="Attach photos of standard reference scales or NABL test sheets."
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {photos.map((p) => (
                    <div key={p.id} className="relative group rounded border border-slate-200 overflow-hidden bg-slate-50 aspect-square flex items-center justify-center">
                      {p.preview ? (
                        <img src={p.preview} alt={p.name} className="object-cover w-full h-full" />
                      ) : (
                        <Camera size={20} className="text-slate-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(p.id)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="space-y-3">
            <Card.Header className="border-b border-slate-100 pb-2 mb-1">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Calibration Findings</h2>
            </Card.Header>
            <Textarea
              label="Calibration Remarks / Stamping Notes"
              placeholder="Record notes about compliance levels or standard weights serial parameters..."
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Select
              label="Test Result Verdict"
              required
              value={result}
              onChange={(e) => setResult(e.target.value)}
              options={[
                { value: "PASS", label: "PASS — Meets verification tolerances" },
                { value: "FAIL", label: "FAIL — Tolerances exceeded" }
              ]}
              placeholder="Select Verdict"
            />
          </Card>

          <Button
            variant="success"
            size="lg"
            className="w-full shadow-sm cursor-pointer"
            onClick={() => setConfirmOpen(true)}
          >
            Submit Calibration Test
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm GATC Calibration Submission">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to submit this calibration report? The measurements and evidence will be submitted to the Department of Legal Metrology for official review.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleSubmit} loading={submitLoading}>
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default GATCInspectionDetail;
