import { useState, useEffect } from "react";
import { voiceService } from "../../services/voiceService";
import { voiceParser } from "../../services/voiceParser";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import Textarea from "../common/Textarea";
import Card from "../common/Card";
import { Mic, MicOff, AlertCircle, CheckCircle, RotateCcw, Edit2, Play } from "lucide-react";
import toast from "react-hot-toast";

/**
 * VoiceAssistant component — floating panel providing natural language dictation,
 * structured parsing previews, and manual override verification screens.
 *
 * @param {Array} parameters - List of GATC/LMO checklists and measurements fields.
 * @param {function} onConfirm - Callback triggered when LMO confirms the entry.
 */
function VoiceAssistant({ parameters = [], onConfirm }) {
  const [state, setState] = useState("IDLE"); // IDLE, LISTENING, PROCESSING, TRANSCRIBED, READY_FOR_CONFIRMATION, CONFIRMED, ERROR
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [textObservation, setTextObservation] = useState("");
  
  // Extracted payload override states
  const [extractedData, setExtractedData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  const [formParamId, setFormParamId] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formResult, setFormResult] = useState("");
  const [formRemarks, setFormRemarks] = useState("");

  useEffect(() => {
    // Release mic on unmount
    return () => {
      voiceService.stopListening();
    };
  }, []);

  const handleStartListening = () => {
    setErrorMsg("");
    setTranscript("");
    setExtractedData(null);
    setEditMode(false);

    voiceService.startListening({
      onStart: () => {
        setState("LISTENING");
      },
      onResult: (text, confidence) => {
        setState("TRANSCRIBED");
        setTranscript(text);
        processTranscript(text);
      },
      onError: (err) => {
        setState("ERROR");
        setErrorMsg(err.message);
        toast.error(err.message);
      },
      onEnd: () => {
        // Ends recording state
      }
    });
  };

  const handleStopListening = () => {
    voiceService.stopListening();
    setState("IDLE");
  };

  const processTranscript = (text) => {
    setState("PROCESSING");
    try {
      const parsed = voiceParser.parseObservation(text, parameters);
      setExtractedData(parsed);

      // Populate input states for confirmation override
      setFormParamId(parsed.parameterId || "");
      setFormValue(parsed.value !== null ? parsed.value.toString() : "");
      setFormUnit(parsed.unit || "");
      setFormResult(parsed.result || "");
      setFormRemarks("");

      setState("READY_FOR_CONFIRMATION");
    } catch (e) {
      setState("ERROR");
      setErrorMsg("Failed to extract structured findings.");
    }
  };

  const handleConfirmAndAdd = () => {
    // Validation checks
    if (!formParamId) {
      toast.error("Please identify or select a matching inspection parameter.");
      return;
    }

    const matchedParam = parameters.find((p) => p.id === formParamId);
    if (!matchedParam) return;

    const isMeasurement = "standardValue" in matchedParam;
    
    const confirmedPayload = {
      parameterId: formParamId,
      parameterType: isMeasurement ? "measurement" : "checklist",
      value: isMeasurement ? parseFloat(formValue) : null,
      unit: isMeasurement ? formUnit : null,
      result: isMeasurement ? (parseFloat(formValue) !== null ? "PASS" : "") : formResult,
      remarks: formRemarks,
      transcript: transcript
    };

    // Validation range/format checks (Rule T)
    if (isMeasurement && isNaN(confirmedPayload.value)) {
      toast.error("Invalid measurement value. Please enter a valid number.");
      return;
    }

    if (!isMeasurement && !confirmedPayload.result) {
      toast.error("Please determine a checklist verdict (PASS/FAIL).");
      return;
    }

    onConfirm(confirmedPayload);
    setState("CONFIRMED");
    toast.success("Voice entry added to form!");
    
    // Auto-reset after a short delay
    setTimeout(() => {
      setState("IDLE");
      setTranscript("");
      setExtractedData(null);
    }, 1500);
  };

  return (
    <Card className="border-l-4 border-l-blue-600 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-3 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Mic size={15} className="text-blue-700" />
          Voice-Assisted Assistant
        </h3>
        
        {/* Connection/Browser support check */}
        {!voiceService.isSupported && (
          <span className="text-[10px] text-amber-600 font-semibold uppercase">Fallback Mode</span>
        )}
      </div>

      <div className="space-y-3">
        {/* IDLE / LISTENING State controllers */}
        {state === "IDLE" && (
          !voiceService.isSupported ? (
            <div className="space-y-2">
              <span className="text-[10px] text-amber-600 font-semibold block uppercase">
                ⚠ Browser Fallback Mode (Microphone Blocked)
              </span>
              <Input
                placeholder="Type spoken observation, e.g. Zero error is 0.2 grams"
                value={textObservation}
                onChange={(e) => setTextObservation(e.target.value)}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!textObservation.trim()) {
                    toast.error("Please enter a text observation.");
                    return;
                  }
                  setTranscript(textObservation);
                  processTranscript(textObservation);
                }}
                className="w-full justify-center font-bold"
              >
                Process Observation
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartListening}
                aria-label="Start voice inspection input"
                leftIcon={<Mic size={14} />}
                className="w-full justify-center"
              >
                Start Voice Input
              </Button>
              <p className="text-[10px] text-slate-400 text-center">
                Speak observations naturally, e.g. "Zero error is 0.2 grams" or "Seal intact".
              </p>
            </div>
          )
        )}

        {state === "LISTENING" && voiceService.isSupported && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 text-center space-y-2">
            <span className="flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              Listening... Speak your observation now.
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={handleStopListening}
              leftIcon={<MicOff size={12} />}
              className="mx-auto"
            >
              Stop Recording
            </Button>
          </div>
        )}

        {state === "PROCESSING" && (
          <div className="text-center py-2 space-y-2 text-slate-500">
            <RotateCcw className="animate-spin mx-auto text-blue-700" size={16} />
            <p className="text-[11px]">Processing speech and extracting parameters...</p>
          </div>
        )}

        {/* READY_FOR_CONFIRMATION State */}
        {state === "READY_FOR_CONFIRMATION" && extractedData && (
          <div className="space-y-3 bg-white dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Extracted dossier</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                extractedData.confidence >= 80 
                  ? "bg-green-50 text-green-700 dark:bg-green-950/20" 
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
              }`}>
                Confidence: {extractedData.confidence}%
              </span>
            </div>

            {/* Editable Field Preview */}
            <div className="space-y-2 text-[11px]">
              <p className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded text-slate-700 dark:text-slate-300 font-medium font-sans">
                <span className="text-[10px] text-slate-400 block font-normal">Spoken Speech / Input</span>
                "{transcript}"
              </p>

              {editMode ? (
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                  <Select
                    label="Match Parameter"
                    value={formParamId}
                    onChange={(e) => setFormParamId(e.target.value)}
                    options={parameters.map((p) => ({
                      value: p.id,
                      label: p.label || p.testName
                    }))}
                  />

                  {extractedData.parameterType === "measurement" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Observed Value"
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        placeholder="e.g. 0.2"
                      />
                      <Input
                        label="Measurement Unit"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="e.g. g"
                      />
                    </div>
                  ) : (
                    <Select
                      label="Checklist Verdict"
                      value={formResult}
                      onChange={(e) => setFormResult(e.target.value)}
                      options={[
                        { value: "PASS", label: "PASS" },
                        { value: "FAIL", label: "FAIL" }
                      ]}
                    />
                  )}

                  <Textarea
                    label="Observation Notes"
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="Enter remarks..."
                    rows={2}
                  />
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Parameter Match:</span>{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {parameters.find(p => p.id === formParamId)?.label || parameters.find(p => p.id === formParamId)?.testName || "Unrecognized parameter"}
                    </span>
                  </div>

                  {extractedData.parameterType === "measurement" ? (
                    <div>
                      <span className="text-slate-400">Observed Value:</span>{" "}
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                        {formValue || "Not detected"} {formUnit}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-400">Result Verdict:</span>{" "}
                      <span className={`font-bold ${formResult === "PASS" ? "text-green-600" : formResult === "FAIL" ? "text-red-600" : "text-amber-600"}`}>
                        {formResult || "Not detected"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Low Confidence Warning */}
            {extractedData.confidence < 70 && !editMode && (
              <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-2 rounded text-[10px] leading-relaxed flex gap-1">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>Low confidence. Please review the parameter alignment or tap Edit to override details manually.</span>
              </div>
            )}

            {/* Action Triggers */}
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setEditMode((v) => !v)}
                leftIcon={<Edit2 size={11} />}
              >
                {editMode ? "Preview" : "Edit"}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={voiceService.isSupported ? handleStartListening : () => {
                  setState("IDLE");
                  setTextObservation("");
                }}
                leftIcon={<RotateCcw size={11} />}
              >
                Retry
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={handleConfirmAndAdd}
                leftIcon={<CheckCircle size={11} />}
              >
                Confirm & Add
              </Button>
            </div>
          </div>
        )}

        {/* CONFIRMED State */}
        {state === "CONFIRMED" && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 text-center flex items-center justify-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-bold">
            <CheckCircle size={14} />
            <span>Observation Confirmed and added to record!</span>
          </div>
        )}

        {/* ERROR State */}
        {state === "ERROR" && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 text-center space-y-2">
            <span className="flex items-center justify-center gap-1.5 text-xs text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </span>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="xs" onClick={voiceService.isSupported ? handleStartListening : () => {
                setState("IDLE");
                setTextObservation("");
              }}>
                Retry
              </Button>
              <Button variant="outline" size="xs" onClick={() => {
                setState("IDLE");
                setTextObservation("");
              }}>
                Enter Manually
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default VoiceAssistant;
