import React, { useState, useRef } from "react";
import { aiService } from "../../services/aiService";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import Textarea from "./Textarea";
import { Camera, Upload, AlertTriangle, CheckCircle, RefreshCw, Eye, EyeOff, ShieldAlert, Sparkles, X, Info as BadgeInfo } from "lucide-react";
import toast from "react-hot-toast";

function AIVisionInspector({ registeredDb = {}, onConfirmResults }) {
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageName, setImageName] = useState("");
  const [mode, setMode] = useState("NONE"); // NONE, CAMERA, UPLOAD
  const [stream, setStream] = useState(null);

  // AI Pipeline State
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState("");
  const [result, setResult] = useState(null);

  // Manual Editing / Override State
  const [isEditing, setIsEditing] = useState(false);
  const [editedOcr, setEditedOcr] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. Camera controls
  const startCamera = async () => {
    setMode("CAMERA");
    setImage(null);
    setResult(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error("Camera access denied or unavailable.");
      setMode("NONE");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setMode("NONE");
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg");
      setImage(dataUrl);
      const filename = `captured_frame_${Date.now()}.jpg`;
      setImageName(filename);
      
      // Save canvas frame directly as File
      canvas.toBlob((blob) => {
        const file = new File([blob], filename, { type: "image/jpeg" });
        setSelectedFile(file);
      }, "image/jpeg");

      stopCamera();
    }
  };

  // 2. File upload controls
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image/jpeg") && !file.type.match("image/png") && !file.type.match("image/webp")) {
      toast.error("Invalid file type. Only JPG, PNG, and WebP are accepted.");
      return;
    }

    if (file.size > 10 * 1024 * 1025) { // 10MB limit
      toast.error("Image exceeds allowed size limit of 10MB.");
      return;
    }

    // Revoke old URL if exists
    if (image && image.startsWith("blob:")) {
      URL.revokeObjectURL(image);
    }

    setSelectedFile(file);
    setImageName(file.name);
    setResult(null);
    setMode("UPLOAD");

    // Preview works using URL.createObjectURL()
    const objectUrl = URL.createObjectURL(file);
    setImage(objectUrl);
  };

  // 3. AI Vision Analysis trigger
  const runAnalysis = async () => {
    if (!selectedFile) {
      toast.error("Please select or capture an image first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setIsEditing(false);

    const steps = [
      "Uploading image...",
      "Pre-processing contrast...",
      "Detecting instrument template...",
      "Extracting text details (OCR)...",
      "Comparing matches with District Database...",
      "Generating explainability results..."
    ];

    try {
      // Loop through progress steps for visual effect
      for (const step of steps) {
        setProgressStep(step);
        await new Promise((r) => setTimeout(r, 450));
      }

      const response = await aiService.analyzeImage(selectedFile, registeredDb);
      setResult(response);
      setEditedOcr({ ...response.ocr });
      toast.success("AI Inspection completed successfully!");
    } catch (err) {
      toast.error(err.message || "AI Analysis failed. Run manual inspection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, val) => {
    setEditedOcr((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleConfirm = () => {
    const isMismatch = result.comparison.overallResult === "MISMATCH";
    if (isMismatch && !overrideReason.trim()) {
      toast.error("Please provide an override reason justifying the serial number mismatch.");
      return;
    }
    if (!disclaimerAccepted) {
      toast.error("Please accept the legal verification disclaimer before confirming.");
      return;
    }

    const payload = {
      imageName,
      analysisId: result.analysisId,
      originalOcr: result.ocr,
      confirmedOcr: editedOcr,
      vision: result.vision,
      comparison: result.comparison,
      overrideReason: isEditing || isMismatch ? overrideReason : "",
      confirmedByOfficer: true,
      timestamp: new Date().toISOString()
    };

    onConfirmResults?.(payload);
    toast.success("AI verification parameters saved successfully!");
  };

  const getMatchBadge = (matchStatus) => {
    switch (matchStatus) {
      case "MATCH":
        return <span className="bg-green-50 text-green-700 border border-green-150 px-1.5 py-0.5 rounded text-[10px] font-bold">MATCH</span>;
      case "MISMATCH":
        return <span className="bg-red-50 text-red-700 border border-red-150 px-1.5 py-0.5 rounded text-[10px] font-bold">MISMATCH</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-150 px-1.5 py-0.5 rounded text-[10px] font-bold">REVIEW REQUIRED</span>;
    }
  };

  const isBlurry = imageName.toLowerCase().includes("blurry");

  return (
    <Card className="space-y-4">
      <Card.Header className="flex justify-between items-center border-b border-slate-100 pb-2 mb-1">
        <div className="flex items-center gap-1.5 text-slate-800">
          <Sparkles size={16} className="text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider">AI Vision & OCR Inspector</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Engine v1.8</span>
      </Card.Header>

      {/* Media Capture Row */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs cursor-pointer" onClick={startCamera}>
          <Camera size={14} className="mr-1" /> Capture Frame
        </Button>
        <label className="flex-1 flex items-center justify-center border border-dashed border-slate-350 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-650 bg-white select-none">
          <Upload size={14} className="mr-1 text-slate-400" /> Upload Image
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* No Image Placeholder */}
      {mode === "NONE" && !image && (
        <div className="p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50 text-center text-xs text-slate-450">
          No instrument image uploaded yet.
        </div>
      )}

      {/* Video Streaming Preview */}
      {mode === "CAMERA" && !image && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-video flex flex-col justify-between p-3">
          <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="relative z-10 flex justify-between w-full mt-auto gap-2">
            <Button variant="danger" size="sm" onClick={stopCamera} className="cursor-pointer">Cancel</Button>
            <Button variant="primary" size="sm" onClick={capturePhoto} className="cursor-pointer">Capture</Button>
          </div>
        </div>
      )}

      {/* Image Preview Area */}
      {image && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex justify-center items-center group max-h-64">
            <img src={image} alt="Target Instrument" className="max-h-64 object-contain w-full" />
            <button
              onClick={() => {
                if (image && image.startsWith("blob:")) {
                  URL.revokeObjectURL(image);
                }
                setImage(null);
                setSelectedFile(null);
                setResult(null);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>

          {/* Quality Screening Warning */}
          {isBlurry && (
            <div className="p-3 border border-amber-200 bg-amber-50/50 rounded-lg flex items-start gap-2 text-xs">
              <AlertTriangle className="text-amber-700 flex-shrink-0 mt-0.5" size={14} />
              <div className="space-y-1">
                <span className="font-bold text-amber-800">Image Blur Warning</span>
                <p className="text-[10px] text-slate-600 leading-normal">
                  Glare or motion blur detected in text regions. OCR recognition reliability may stand compromised.
                </p>
                <div className="flex gap-2 pt-1">
                  <button onClick={startCamera} className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer">
                    Retake photo
                  </button>
                  <button onClick={runAnalysis} className="text-[10px] text-slate-500 font-bold hover:underline cursor-pointer">
                    Analyze Anyway
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !result && !isBlurry && (
            <Button variant="primary" className="w-full text-xs cursor-pointer" onClick={runAnalysis}>
              Analyze Instrument Image
            </Button>
          )}
        </div>
      )}

      {/* AI Processing Stepper */}
      {loading && (
        <Card className="border-blue-100 bg-blue-50/5 py-6 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw size={24} className="text-blue-700 animate-spin" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800">Processing AI Pipeline</span>
            <p className="text-[10px] text-slate-500 font-medium animate-pulse">{progressStep}</p>
          </div>
        </Card>
      )}

      {/* Results Workspace */}
      {result && (
        <div className="space-y-4 pt-1">
          {/* Main Indicators block */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-55 flex flex-col">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Verdict Outcome</span>
              <div className="mt-1 flex items-center gap-1.5">
                {getMatchBadge(result.comparison.overallResult)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-55 flex flex-col">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Vision Confidence</span>
              <span className="font-bold text-slate-800 mt-1">{result.confidence}%</span>
            </div>
          </div>

          {/* Explainability Explain */}
          <div className="p-3 rounded-lg border border-slate-150 bg-slate-50 text-[11px] leading-relaxed text-slate-650">
            <h4 className="font-bold text-slate-800 text-[11px] mb-1 flex items-center gap-1">
              <BadgeInfo className="text-blue-700" size={13} /> Why flagged:
            </h4>
            <p>{result.explanation}</p>
          </div>

          {/* Side-by-side verification table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Registered</th>
                  <th className="p-2.5">Extracted</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-2.5 font-medium">Serial No.</td>
                  <td className="p-2.5 font-mono text-[10px] text-slate-500">{registeredDb.serialNumber || "—"}</td>
                  <td className="p-2.5 font-mono text-[10px] font-bold text-slate-800">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedOcr.serialNumber}
                        onChange={(e) => handleFieldChange("serialNumber", e.target.value)}
                        className="border border-slate-350 rounded p-1 w-full text-[10px]"
                      />
                    ) : (
                      editedOcr.serialNumber
                    )}
                  </td>
                  <td className="p-2.5">{getMatchBadge(result.comparison?.serialNumberResult)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Brand</td>
                  <td className="p-2.5 text-slate-500">{registeredDb.manufacturer || "—"}</td>
                  <td className="p-2.5 font-bold text-slate-800">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedOcr.manufacturer}
                        onChange={(e) => handleFieldChange("manufacturer", e.target.value)}
                        className="border border-slate-350 rounded p-1 w-full text-[10px]"
                      />
                    ) : (
                      editedOcr.manufacturer
                    )}
                  </td>
                  <td className="p-2.5">{getMatchBadge(result.comparison?.manufacturerResult)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Model</td>
                  <td className="p-2.5 text-slate-500">{registeredDb.model || "—"}</td>
                  <td className="p-2.5 font-bold text-slate-800">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedOcr.model}
                        onChange={(e) => handleFieldChange("model", e.target.value)}
                        className="border border-slate-350 rounded p-1 w-full text-[10px]"
                      />
                    ) : (
                      editedOcr.model
                    )}
                  </td>
                  <td className="p-2.5">{getMatchBadge(result.comparison?.modelResult)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Computer Vision indicators panel */}
          <Card className="bg-slate-50/50 space-y-2.5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vision Detection Flags</h4>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-650">
              <div>
                <span className="text-slate-400 block font-medium">Instrument Template</span>
                <span className="font-semibold text-slate-800">{result.vision?.instrumentDetected}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">tamper Lead Seal</span>
                <span className="font-semibold text-slate-800">{result.vision?.sealStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Physical Damage</span>
                <span className="font-semibold text-slate-800">{result.vision?.damageStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Display Reading</span>
                <span className="font-semibold text-slate-800">{result.vision?.displayReading}</span>
              </div>
            </div>
          </Card>

          {/* Edit triggers */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[11px] h-8"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel Edit" : "Correct OCR text"}
            </Button>
          </div>

          {/* Mismatch Manual Overrides logs */}
          {(result.comparison?.overallResult === "MISMATCH" || isEditing) && (
            <div className="p-3 border border-red-200 bg-red-50/5 rounded-lg space-y-3">
              <span className="text-xs font-bold text-red-800 flex items-center gap-1">
                <ShieldAlert size={14} /> Manual Override Authorization Required
              </span>
              <Textarea
                label="Override Justification remarks"
                placeholder="Required. Specify why you are overriding this mismatch (e.g. physical nameplate serial confirm)..."
                rows={2}
                required
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>
          )}

          {/* Legal Compliance Checkboxes */}
          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-[10px] text-slate-500 space-y-2 leading-relaxed">
            <label className="flex items-start gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-0.5 rounded cursor-pointer"
              />
              <span>
                I certify that I have verified the AI-extracted telemetry physically, and the official stamping result rests on my final assessment.
              </span>
            </label>
          </div>

          {/* Finalize button */}
          <Button
            variant="success"
            className="w-full text-xs cursor-pointer"
            onClick={handleConfirm}
          >
            Confirm AI Findings
          </Button>
        </div>
      )}
    </Card>
  );
}

export default AIVisionInspector;
