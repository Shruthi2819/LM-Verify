import React from "react";
import { ShieldAlert, CheckCircle2, Clock, Calendar, AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { RISK_LEVELS } from "../../utils/predictiveCompliance";
import { formatDate } from "../../utils/helpers";

export function PredictionExplanationModal({
  open,
  onClose,
  prediction,
  onStartReverification
}) {
  if (!prediction) return null;

  const riskMeta = RISK_LEVELS[prediction.riskLevel] || RISK_LEVELS.LOW;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Predictive Compliance & Risk Analysis Dossier"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs select-none max-h-[75vh] overflow-y-auto pr-1">
        {/* ── Status Banner ────────────────────────────────────────── */}
        <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Certificate ID</span>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-mono">{prediction.certificateId}</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">{prediction.instrumentName} • {prediction.businessName}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Compliance Risk Score</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-base text-slate-800 dark:text-slate-100">{prediction.riskScore} / 100</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskMeta.badgeClass}`}>
                  {prediction.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recommendation Box ────────────────────────────────────── */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-lg space-y-1.5 dark:bg-blue-950/20 dark:border-blue-900/40">
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <HelpCircle size={12} /> System Recommendation
          </span>
          <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 leading-snug">
            {prediction.recommendation}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-blue-900 dark:text-blue-300">
            <Calendar size={12} />
            <span>Recommended Re-verification Start Date: <strong>{prediction.recommendedStartDate}</strong></span>
          </div>
        </div>

        {/* ── Explainable Factor Breakdown ──────────────────────────── */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
            Why this risk evaluation? (Explainable Factors)
          </h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] p-3 rounded-lg bg-slate-50/50 border border-slate-200/70 dark:bg-slate-900/30 dark:border-slate-800">
            {prediction.reason}
          </p>
        </div>

        {/* ── Operational Metric Grid ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Days Remaining</span>
            <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">{prediction.daysRemaining} days</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Avg Processing</span>
            <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">{prediction.avgProcessingDays} days</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Typical Delay</span>
            <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">{prediction.avgDelayDays} days</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Safety Buffer</span>
            <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">{prediction.safetyBufferDays} days</span>
          </div>
        </div>

        {/* ── Previous Verification History Cycles ─────────────────── */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Clock size={12} className="text-blue-700" /> Historical Verification Cycles
          </h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden dark:border-slate-800">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="p-2">Cycle Year</th>
                  <th className="p-2">Verdict</th>
                  <th className="p-2">Processing Time</th>
                  <th className="p-2">Queue Delay</th>
                  <th className="p-2">Authorized Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {prediction.historyCycles?.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-2 font-semibold font-mono">{c.year}</td>
                    <td className="p-2">
                      <span className="text-emerald-700 font-bold dark:text-emerald-400">{c.result}</span>
                    </td>
                    <td className="p-2 font-mono">{c.processingDays} days</td>
                    <td className="p-2 font-mono">{c.delayDays} days</td>
                    <td className="p-2">{c.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Modal Actions ────────────────────────────────────────── */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] text-slate-400">
            Rule-based analytics derived from historical division metrics.
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {onStartReverification && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onStartReverification(prediction);
                }}
                rightIcon={<ArrowRight size={12} />}
              >
                Start Re-verification
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PredictionExplanationModal;
