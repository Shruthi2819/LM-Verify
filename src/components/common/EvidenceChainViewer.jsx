import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Scale,
  Camera,
  MapPin,
  Award,
  ExternalLink,
  RefreshCw,
  Sliders
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Modal from "./Modal";
import { formatHash } from "../../utils/crypto";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

export function EvidenceChainViewer({
  chain,
  onVerify,
  onTamperSimulate,
  onRestoreOriginal,
  verifying = false,
  verificationResult = null,
  showDemoControls = true
}) {
  const [expandedStage, setExpandedStage] = useState(null);
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  if (!chain) {
    return (
      <div className="p-6 text-center text-xs text-slate-500">
        Evidence chain data is currently unavailable.
      </div>
    );
  }

  const isVerified = verificationResult
    ? verificationResult.isMatch
    : chain.status === "VERIFIED";

  const currentFinalHash = verificationResult
    ? verificationResult.currentFinalHash
    : chain.finalHash;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  const getStageIcon = (key) => {
    switch (key) {
      case "application": return <FileText size={13} className="text-blue-600" />;
      case "assignment": return <User size={13} className="text-indigo-600" />;
      case "inspection": return <Scale size={13} className="text-amber-600" />;
      case "measurements": return <Scale size={13} className="text-emerald-600" />;
      case "evidence": return <Camera size={13} className="text-purple-600" />;
      case "locationTime": return <MapPin size={13} className="text-rose-600" />;
      case "decision": return <CheckCircle2 size={13} className="text-teal-600" />;
      case "approval": return <Award size={13} className="text-sky-600" />;
      case "certificate": return <Award size={13} className="text-green-600" />;
      default: return <ShieldCheck size={13} className="text-slate-600" />;
    }
  };

  return (
    <div className="space-y-5 select-none text-xs">
      {/* ── Status Banner ────────────────────────────────────────── */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          isVerified
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900/40"
            : "bg-amber-50/90 border-amber-300 text-amber-950 dark:bg-amber-950/20 dark:border-amber-800/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${
              isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
            }`}
          >
            {isVerified ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm">
                {isVerified
                  ? "EVIDENCE CHAIN INTEGRITY: VERIFIED"
                  : "⚠ INTEGRITY MISMATCH DETECTED"}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                  isVerified
                    ? "bg-emerald-200/80 text-emerald-800"
                    : "bg-amber-200 text-amber-900"
                }`}
              >
                {isVerified ? "PASS (100% MATCH)" : "REQUIRES REVIEW"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-xl">
              {isVerified
                ? "All 9 chronological evidence stages match the authoritative sealed integrity record anchored to the ledger."
                : "Stored evidence differs from the original integrity record. Further review by an authorized officer may be required."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <Button
            variant={isVerified ? "primary" : "warning"}
            size="sm"
            onClick={onVerify}
            loading={verifying}
            leftIcon={<RefreshCw size={12} />}
          >
            Verify Integrity
          </Button>
          {showDemoControls && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDemoDrawer(!showDemoDrawer)}
              leftIcon={<Sliders size={12} />}
            >
              Demo Controls
            </Button>
          )}
        </div>
      </div>

      {/* ── Demo Controls Drawer (For SIH Presentation) ─────────── */}
      {showDemoDrawer && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 dark:bg-slate-900/40 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders size={12} className="text-blue-600" />
              SIH Controlled Demonstration Controls
            </span>
            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium">
              Demo sandbox
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            Simulate a data alteration in a test record to demonstrate real-time mismatch detection and pinpointing of affected stages.
          </p>
          <div className="flex gap-2 pt-1 flex-wrap">
            <Button
              variant="danger"
              size="sm"
              className="text-[10px] h-7 px-2.5"
              onClick={() => onTamperSimulate && onTamperSimulate("measurements")}
            >
              Simulate Modified Measurements
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="text-[10px] h-7 px-2.5"
              onClick={() => onTamperSimulate && onTamperSimulate("evidence")}
            >
              Simulate Modified Photo Hash
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-7 px-2.5"
              onClick={() => onRestoreOriginal && onRestoreOriginal()}
            >
              Restore Original Clean Data
            </Button>
          </div>
        </div>
      )}

      {/* ── Metadata Summary Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80 dark:bg-slate-900/30 dark:border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Evidence Chain ID</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{chain.chainId}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Anchored Ledger Reference</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]" title={chain.blockchainRecord?.txReference}>
              {formatHash(chain.blockchainRecord?.txReference, 6, 6)}
            </span>
            <button
              onClick={() => copyToClipboard(chain.blockchainRecord?.txReference, "Transaction Reference")}
              className="text-slate-400 hover:text-slate-600 transition"
              title="Copy Reference"
            >
              <Copy size={11} />
            </button>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Final Evidence Hash</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]" title={currentFinalHash}>
              {formatHash(currentFinalHash, 8, 6)}
            </span>
            <button
              onClick={() => copyToClipboard(currentFinalHash, "Final Evidence Hash")}
              className="text-slate-400 hover:text-slate-600 transition"
              title="Copy Hash"
            >
              <Copy size={11} />
            </button>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Last Verified</span>
          <span className="text-slate-700 dark:text-slate-300">
            {chain.lastVerifiedAt ? new Date(chain.lastVerifiedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Recently"}
          </span>
        </div>
      </div>

      {/* ── 9-Stage Chained Evidence Timeline ─────────────────────── */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-700" />
          Sequential Evidence Stages ({chain.stages?.length || 9} Verified Links)
        </h4>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-5 space-y-4 py-2">
          {chain.stages?.map((stage, idx) => {
            const comparison = verificationResult?.stageComparisons?.find(c => c.key === stage.key);
            const isStageMatch = comparison !== undefined ? comparison.isMatch : true;
            const isExpanded = expandedStage === stage.key;

            return (
              <div key={stage.key} className="relative group">
                {/* Connector Dot */}
                <div
                  className={`absolute -left-[27px] top-1.5 w-5 h-5 rounded-full bg-white border flex items-center justify-center shadow-xs dark:bg-slate-900 ${
                    isStageMatch
                      ? "border-emerald-500 text-emerald-600"
                      : "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40"
                  }`}
                >
                  {isStageMatch ? (
                    <CheckCircle2 size={12} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={12} className="text-amber-700" />
                  )}
                </div>

                {/* Stage Header Block */}
                <div
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    isStageMatch
                      ? "bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-800"
                      : "bg-amber-50/40 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800/60"
                  }`}
                  onClick={() => setExpandedStage(isExpanded ? null : stage.key)}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                        {getStageIcon(stage.key)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Stage {idx + 1}: {stage.label}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isStageMatch
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300"
                        }`}
                      >
                        {isStageMatch ? "✓ MATCH" : "⚠ MISMATCH"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                        <span>Hash:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatHash(stage.stageHash, 6, 4)}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Stage Data Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Previous Link Hash (H{idx})</span>
                          <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all select-all">
                            {stage.previousHash}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Stage Sealed Hash (H{idx + 1})</span>
                          <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all select-all">
                            {stage.stageHash}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Canonical Stage Payload</span>
                        <pre className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-700 overflow-x-auto max-h-36 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                          {JSON.stringify(stage.inputPayload || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EvidenceChainViewer;
