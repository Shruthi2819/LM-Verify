import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lmoService } from "../../services/lmoService";
import { aiService } from "../../services/aiService";
import { useNetwork } from "../../context/NetworkContext";
import { indexedDBService } from "../../services/indexedDBService";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import FileUpload from "../../components/common/FileUpload";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import AIVerificationAssistant from "../../components/lmo/AIVerificationAssistant";
import AIVisionInspector from "../../components/common/AIVisionInspector";
import TimeVerifiedEvidence from "../../components/common/TimeVerifiedEvidence";
import EvidenceIntegrityCard from "../../components/common/EvidenceIntegrityCard";
import VoiceAssistant from "../../components/common/VoiceAssistant";
import { useAuth } from "../../hooks/useAuth";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { ACCEPTED_DOC_TYPES } from "../../utils/constants";
import { formatDate } from "../../utils/helpers";
import { Scale, Clock, MapPin, Camera, X, Wifi, WifiOff, ShieldCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

function InspectionDetail() {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ins, setIns] = useState(null);
  const [loading, setLoading] = useState(true);

  // Time-Verified Start Timestamp (authoritative server-side simulation with localStorage cache)
  const [serverRecordedAt] = useState(() => {
    const cacheKey = `inspection_start_time_${inspectionId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    const val = new Date().toISOString();
    localStorage.setItem(cacheKey, val);
    return val;
  });

  // Form states
  const [checklist, setChecklist] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [observations, setObservations] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photos, setPhotos] = useState([]);
  const [result, setResult] = useState(""); // PASS, FAIL

  // Connection & Offline states
  const { isOnline: rawOnline, updatePendingCount } = useNetwork();
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const isOnline = rawOnline && !simulatedOffline;
  const [isAvailableOffline, setIsAvailableOffline] = useState(false);
  const [syncQueueCount, setSyncQueueCount] = useState(0);

  // AI Assistant states
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiWarnings, setAiWarnings] = useState([]);
  const [aiHistory, setAiHistory] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), message: "Initialized verification model." }
  ]);

  const [aiVisionReport, setAiVisionReport] = useState(null);

  const handleConfirmAiVision = (report) => {
    setAiVisionReport(report);
    setAiHistory((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Confirmed AI Vision extraction. Result: ${report.comparison.overallResult}`
      }
    ]);
  };

  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Reference to prevent redundant first-load calls
  const isFirstLoad = useRef(true);

  useEffect(() => {
    async function loadInspection() {
      try {
        let data = null;
        let localData = null;
        try {
          localData = await indexedDBService.getInspection(inspectionId);
        } catch (e) {
          console.warn("Could not check local IndexedDB:", e);
        }

        if (localData) {
          setIsAvailableOffline(true);
        }

        if (isOnline) {
          data = await lmoService.getInspection(inspectionId);
          setIns(data);
          // Auto-save a copy locally if marked available offline
          if (localData && data) {
            try {
              await indexedDBService.saveInspection({ ...data, isAvailableOffline: true });
            } catch (e) {
              console.warn("Could not save to IndexedDB:", e);
            }
          }
        } else {
          if (localData) {
            data = localData;
            setIns(data);
            toast.success("Loaded inspection details from local offline cache.");
          } else {
            toast.error("This inspection is not available offline. Please download it first when online.");
            navigate(ROUTES.LMO_SCHEDULE);
            return;
          }
        }

        if (!data) {
          throw new Error("No inspection data found.");
        }

        setChecklist(data.checklist || []);
        setMeasurements(data.measurements || []);
        setObservations(data.observations || "");
        setRemarks(data.remarks || "");
        setResult(data.result || "");
        setPhotos(data.photos || []);

        // Load sync queue operations count
        try {
          const queue = await indexedDBService.getSyncQueue();
          const pending = queue.filter(op => op.syncStatus === "PENDING_SYNC" || op.syncStatus === "SYNC_FAILED").length;
          setSyncQueueCount(pending);
        } catch (e) {
          console.warn("Could not get sync queue:", e);
        }
      } catch (err) {
        console.error("Failed to load inspection details:", err);
        toast.error("Failed to load inspection details.");
        navigate(ROUTES.LMO_SCHEDULE);
      } finally {
        setLoading(false);
      }
    }
    loadInspection();
  }, [inspectionId, isOnline]);

  // Dynamic AI trigger function
  const runAIAnalysis = async (currentChecklist, currentMeasurements, currentPhotos) => {
    if (!ins) return;
    setAiLoading(true);
    try {
      const response = await aiService.analyzeInspection({
        inspectionId: ins.id,
        instrumentId: ins.instrumentId,
        instrumentType: ins.instrumentName,
        serialNumber: ins.instrumentSerial,
        checklist: currentChecklist,
        measurements: currentMeasurements,
        observations,
        photos: currentPhotos
      });
      setAiAnalysis(response);

      // Merge backend/mock warnings, retaining LMO reviewed state
      setAiWarnings((prev) => {
        return response.warnings.map((newW) => {
          const existing = prev.find((w) => w.id === newW.id);
          return existing ? { ...newW, status: existing.status } : newW;
        });
      });
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Debounced measurements / observations updates
  useEffect(() => {
    if (loading || !ins) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      runAIAnalysis(checklist, measurements, photos);
      return;
    }

    const timer = setTimeout(() => {
      runAIAnalysis(checklist, measurements, photos);
      setAiHistory((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: "Scanned numerical readings and comments entries."
        }
      ]);
    }, 450);

    return () => clearTimeout(timer);
  }, [measurements, observations]);

  // Handle pass/fail selections in checklist
  const handleChecklistChange = (id, val) => {
    const updated = checklist.map((item) => (item.id === id ? { ...item, value: val } : item));
    setChecklist(updated);

    // Immediate AI update
    runAIAnalysis(updated, measurements, photos);
    setAiHistory((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Updated checklist item: ${id} to ${val}`
      }
    ]);
  };

  // Handle numerical measurement input
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
            updated.result = Math.abs(obs - std) <= 0.5 ? "PASS" : "FAIL";
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
        lmoService.uploadInspectionPhoto(ins.id, f)
      );
      const results = await Promise.all(uploadPromises);
      const updatedPhotos = [...photos, ...results];
      setPhotos(updatedPhotos);

      // Immediate AI trigger
      runAIAnalysis(checklist, measurements, updatedPhotos);
      setAiHistory((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: `Attached calibration evidence: ${files[0].name}`
        }
      ]);
      toast.success("Photos attached successfully!");
    } catch (err) {
      toast.error("Failed to upload photos.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (id) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);

    // Rerun analysis
    runAIAnalysis(checklist, measurements, updated);
    setAiHistory((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Removed evidence thumbnail reference.`
      }
    ]);
  };

  // Human-in-the-loop acknowledgement trigger
  const handleAcknowledgeWarning = (warningId) => {
    setAiWarnings((prev) =>
      prev.map((w) => (w.id === warningId ? { ...w, status: "REVIEWED" } : w))
    );
    const targetWarn = aiWarnings.find((w) => w.id === warningId);
    setAiHistory((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `LMO reviewed alert: ${targetWarn ? targetWarn.title : warningId}`
      }
    ]);
    toast.success("Discrepancy warning marked as reviewed.");
  };

  // Debounced Autosave draft state to IndexedDB inspections store
  const [autosaveState, setAutosaveState] = useState("Saved");
  useEffect(() => {
    if (loading || !ins) return;
    setAutosaveState("Saving...");
    const timer = setTimeout(async () => {
      try {
        const record = {
          ...ins,
          inspectionId: ins.id,
          checklist,
          measurements,
          observations,
          remarks,
          result,
          photos,
          offlineModifiedAt: new Date().toISOString()
        };
        await indexedDBService.saveInspection(record);
        setAutosaveState("Saved");
      } catch (err) {
        setAutosaveState("Storage Error");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [checklist, measurements, observations, remarks, result, photos, loading, ins]);

  const handleVoiceConfirm = (payload) => {
    const { parameterId, parameterType, value, unit, result: voiceVerdict, remarks: voiceRemarks, transcript: voiceTranscript } = payload;
    
    if (parameterType === "measurement") {
      setMeasurements((prev) =>
        prev.map((m) => {
          if (m.id !== parameterId) return m;
          
          const std = parseFloat(m.standardValue);
          const obs = parseFloat(value);
          let err = null;
          let verd = m.result;

          if (!isNaN(std) && !isNaN(obs)) {
            err = (obs - std).toFixed(2);
            // standard tolerances 0.25 (Class III weights)
            verd = Math.abs(obs - std) <= 0.25 ? "PASS" : "FAIL";
          }

          return {
            ...m,
            observedValue: value,
            error: err,
            result: verd,
            source: "voice",
            transcript: voiceTranscript
          };
        })
      );
    } else {
      setChecklist((prev) =>
        prev.map((c) => {
          if (c.id !== parameterId) return c;
          return {
            ...c,
            value: voiceVerdict,
            source: "voice",
            transcript: voiceTranscript
          };
        })
      );
    }

    if (voiceRemarks) {
      setRemarks((prev) => (prev ? `${prev}\n${voiceRemarks}` : voiceRemarks));
    }

    // Trace update in AI assistant logs feed
    setAiHistory((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Voice-Assisted update confirmed: Matched to ID ${parameterId}`
      }
    ]);
  };

  // Toggle Offline availability for caching the current LMO inspection target
  const handleToggleOfflineAvailability = async () => {
    try {
      if (isAvailableOffline) {
        // Delete cache
        await indexedDBService.deleteInspection(ins.id);
        setIsAvailableOffline(false);
        toast.success("Removed local offline cache for this inspection.");
      } else {
        // Save cache
        const record = {
          ...ins,
          inspectionId: ins.id,
          checklist,
          measurements,
          observations,
          remarks,
          result,
          photos,
          isAvailableOffline: true,
          cachedAt: new Date().toISOString()
        };
        await indexedDBService.saveInspection(record);
        setIsAvailableOffline(true);
        toast.success("This inspection is now cached and available offline!");
      }
    } catch (e) {
      toast.error("Failed to update offline cache.");
    }
  };

  const handleSubmit = async () => {
    // 1. Checklist verification checks
    const incompleteChecklist = checklist.some(c => !c.value);
    if (incompleteChecklist) {
      toast.error("Please complete all items on the physical checklist.");
      setConfirmOpen(false);
      return;
    }

    // 2. Measurements completed checks
    const incompleteMeasurements = measurements.some(m => m.observedValue === null || m.observedValue === "");
    if (incompleteMeasurements) {
      toast.error("Please fill in observed measurements calibration readings.");
      setConfirmOpen(false);
      return;
    }



    if (!result) {
      toast.error("Please determine a final verification result (PASS/FAIL).");
      setConfirmOpen(false);
      return;
    }

    if (result === "FAIL" && !remarks.trim()) {
      toast.error("Remarks are required for verification failures.");
      setConfirmOpen(false);
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        checklist,
        measurements,
        observations,
        remarks,
        result,
        photos,
        aiSummary: aiAnalysis?.summary || "",
        aiModelUsed: aiAnalysis?.modelName || "",
        aiVisionReport,
        timeVerifiedMetadata: {
          inspectionId: ins.id,
          applicationId: ins.applicationId,
          instrumentId: ins.instrumentId,
          officerName: user?.name,
          officerId: user?.officerId || user?.id,
          officerRole: user?.role,
          serverRecordedAt,
          clientCapturedAt: new Date().toISOString()
        }
      };

      if (!isOnline) {
        // Construct the offline operation payload
        const opId = "OP-" + crypto.randomUUID();
        const baseVersion = ins.serverVersion || ins.version || 1;
        const localVer = baseVersion + 1;

        const op = {
          operationId: opId,
          inspectionId: ins.id,
          actorRole: "LMO",
          actorName: user?.name || "LMO Officer",
          createdAt: new Date().toISOString(),
          syncStatus: "PENDING_SYNC",
          localVersion: localVer,
          baseServerVersion: baseVersion,
          payload: payload,
          integrityStatus: "PENDING"
        };

        // Cache updated state locally to prevent loss on refresh
        const updatedInspection = {
          ...ins,
          status: "COMPLETED",
          checklist,
          measurements,
          observations,
          remarks,
          result,
          photos,
          localVersion: localVer,
          syncStatus: "PENDING_SYNC"
        };

        await indexedDBService.saveInspection(updatedInspection);
        await indexedDBService.addToSyncQueue(op);
        await updatePendingCount();

        toast.success("Saved locally. Verification report queued for sync.");
        setConfirmOpen(false);
        navigate(ROUTES.LMO_SCHEDULE);
      } else {
        await lmoService.submitInspection(ins.id, payload);
        
        // Remove from local IndexedDB if cached
        await indexedDBService.deleteInspection(ins.id);
        
        toast.success("Inspection report submitted!");
        setConfirmOpen(false);
        navigate(buildPath(ROUTES.LMO_APPLICATION_DETAIL, { applicationId: ins.applicationId }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit inspection.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.LMO_DASHBOARD },
            { label: "Schedule", path: ROUTES.LMO_SCHEDULE },
            { label: "Checklist" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-7xl mx-auto pb-10">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.LMO_DASHBOARD },
          { label: "Schedule", path: ROUTES.LMO_SCHEDULE },
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
            <h1 className="text-base font-bold text-slate-800">Verification Inspection Workspace</h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">INS ID: {ins.id} · APP ID: {ins.applicationId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-xs font-semibold">
          {/* Connection status badge */}
          <button
            type="button"
            onClick={() => setSimulatedOffline(prev => !prev)}
            className={["flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded border cursor-pointer transition-colors", isOnline ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"].join(" ")}
          >
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? "ONLINE" : "OFFLINE (Simulated)"}
          </button>

          {/* Make available offline cache toggle */}
          {rawOnline && (
            <button
              type="button"
              onClick={handleToggleOfflineAvailability}
              className={["flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded border cursor-pointer transition-colors", isAvailableOffline ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"].join(" ")}
            >
              <ShieldCheck size={12} className="text-blue-700" />
              {isAvailableOffline ? "✓ AVAILABLE OFFLINE" : "DOWNLOAD OFFLINE"}
            </button>
          )}

          {/* Sync operations indicator */}
          {syncQueueCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded">
              <RefreshCw size={12} /> Sync Queue: {syncQueueCount} pending
            </span>
          )}

          {/* Autosave status indicator */}
          <span className="text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200 px-2 py-1 rounded">
            {autosaveState === "Saving..." ? "Saving..." : "✓ Saved locally"}
          </span>

          <span className="flex items-center gap-0.5 text-slate-400"><Clock size={12} /> {ins.scheduledTime}</span>
          <span className="flex items-center gap-0.5 text-slate-400"><MapPin size={12} /> {ins.location.split(",")[0]}</span>
        </div>
      </div>

      {/* Responsive Column Container */}
      <div className="space-y-6 max-w-4xl mx-auto">
          {/* Device characteristics card */}
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
                <span className="font-semibold text-slate-800 truncate block" title={ins.location}>{ins.location}</span>
              </div>
            </Card.Body>
          </Card>

          {/* AI Vision & OCR Inspector */}
          <AIVisionInspector
            registeredDb={{
              serialNumber: ins.instrumentSerial,
              manufacturer: ins.instrumentManufacturer || "Avery Weigh-Tronix",
              model: ins.instrumentModel || ins.instrumentId,
              capacity: ins.capacity || "1000 kg"
            }}
            onConfirmResults={handleConfirmAiVision}
          />

          {/* Time-Verified Inspection & Evidence Traceability */}
          <TimeVerifiedEvidence
            inspectionId={ins.id}
            applicationId={ins.applicationId}
            instrumentId={ins.instrumentId}
            officerName={user?.name || "Priya Sharma"}
            officerRole={user?.role || "LMO"}
            officerId={user?.officerId || "LMO-MH-44012"}
            startedAt={serverRecordedAt}
            timelineEvents={[
              {
                event: "INSPECTION_STARTED",
                time: new Date(serverRecordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                detail: `Inspection session initialized by LMO ${user?.name || "Priya Sharma"}`
              },
              ...(checklist.some(c => c.value) ? [{
                event: "PHYSICAL_CHECKLIST_UPDATED",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                detail: "Physical condition and sealing verification items logged."
              }] : []),
              ...(measurements.some(m => m.observedValue !== null && m.observedValue !== "") ? [{
                event: "CALIBRATION_MEASUREMENTS",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                detail: "Standard weights tolerance values recorded."
              }] : []),
              ...(photos.length > 0 ? [{
                event: "EVIDENCE_CAPTURED",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                detail: `${photos.length} evidence photographs attached to inspection session.`
              }] : []),
              ...(aiVisionReport ? [{
                event: "AI_ANALYSIS_COMPLETED",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                detail: `OCR Serial Match Result: ${aiVisionReport.comparison.serialMatch ? "MATCH" : "MISMATCH"}`
              }] : [])
            ]}
          />

          {/* Physical Checklist */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Physical Condition Checklist</h2>
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

          {/* Numerical Calibration Measurement Entries */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Calibration Observations</h2>
            </Card.Header>
            <Card.Body className="space-y-4 pt-1">
              <div className="hidden sm:grid grid-cols-5 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                <span className="col-span-2">Test Name</span>
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

          {/* Device Photographs evidence upload */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Device Photographs</h2>
            </Card.Header>
            <Card.Body className="space-y-4">
              <FileUpload
                accept={ACCEPTED_DOC_TYPES}
                onChange={handlePhotoUpload}
                loading={uploading}
                helperText="Attach photos of standard weights, sealings or serial marking."
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 pt-2">
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

          {/* Observations and Remarks fields */}
          <Card className="space-y-3">
            <Card.Header className="border-b border-slate-100 pb-2 mb-1">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Report Remarks</h2>
            </Card.Header>
            <Textarea
              label="Observations"
              placeholder="General inspection observations..."
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
            <Textarea
              label="Final Remarks / Stamping Notes"
              placeholder="Include details about certification status or seal numbers..."
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Select
              label="Final Verdict Result"
              required
              value={result}
              onChange={(e) => setResult(e.target.value)}
              options={[
                { value: "PASS", label: "PASS — Verification Approved" },
                { value: "FAIL", label: "FAIL — Verification Rejected" }
              ]}
              placeholder="Select Verdict"
            />
          </Card>

          {/* Tamper-Evident Evidence Chain Integrity Card */}
          <EvidenceIntegrityCard
            inspectionId={ins.id}
            applicationId={ins.applicationId}
            certificateId={ins.certificateId}
          />

          {/* Submission Trigger */}
          <Button
            variant="success"
            size="lg"
            className="w-full shadow-sm cursor-pointer"
            onClick={() => setConfirmOpen(true)}
          >
            Submit Inspection Report
          </Button>
      </div>

      {/* Confirmation Dialog */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Inspection Report Submission">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to submit this inspection report? The observations, verification readings, and AI reviewed parameters will be finalized.
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

export default InspectionDetail;
