import React, { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { Sparkles, ShieldAlert, BadgeInfo, CheckCircle, Clock, Send, MessageSquare } from "lucide-react";

function GATCAIAssistant({
  analysis,
  loading,
  warnings = [],
  onAcknowledgeWarning,
  activityHistory = [],
  instrumentType = "Platform Scale"
}) {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "AI",
      text: `Hello GATC Technician, I have loaded the calibration parameters for this ${instrumentType}. Ask me anything about standard tolerances, OIML classes, or checks.`
    }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setChatHistory((prev) => [...prev, { sender: "GATC", text: userMsg }]);
    setQuery("");

    setTimeout(() => {
      let reply = "I can only address queries related to this instrument's specifications, standard seals, or active warnings.";
      const text = userMsg.toLowerCase();
      if (text.includes("seal") || text.includes("flag")) {
        reply = "Sealing verification requires checking that the physical lead seals match the configuration certificates. If the seal is broken or absent, the device fails physical verification.";
      } else if (text.includes("tolerance") || text.includes("error")) {
        reply = "For Class III platform scales, the maximum permissible error (MPE) is ±0.5 scale intervals. Deviations beyond this require recalibration before approval.";
      } else if (text.includes("check") || text.includes("next")) {
        reply = "Please confirm the device serial number matches the application certificate plate, complete the numerical measurements table, and upload the seal photographs.";
      }
      setChatHistory((prev) => [...prev, { sender: "AI", text: reply }]);
    }, 400);
  };

  const getReadinessColor = (readiness) => {
    switch (readiness) {
      case "READY": return "bg-green-50 text-green-700 border-green-200";
      case "PARTIALLY_READY": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "LOW": return "bg-green-50 text-green-800 border-green-200";
      case "MEDIUM": return "bg-amber-55 text-amber-800 border-amber-200";
      default: return "bg-red-55 text-red-800 border-red-200";
    }
  };

  if (loading) {
    return (
      <Card className="border-blue-100 bg-blue-50/5">
        <div className="flex items-center gap-2 text-blue-700 mb-4 animate-pulse">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">AI Verification Assistant</span>
        </div>
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-6 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-20 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="text-center py-8">
        <Sparkles size={24} className="text-slate-350 mx-auto mb-2" />
        <p className="text-xs text-slate-400">AI calibration analysis not generated yet.</p>
        <p className="text-[10px] text-slate-400 mt-1">Open the GATC workspace or trigger explicit checks.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Core Summary Card */}
      <Card className="border-blue-200 bg-blue-50/5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Sparkles size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">AI Assistant Panel</h3>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 block uppercase font-medium">Model Confidence</span>
            <span className="text-xs font-bold text-slate-800 select-none">
              {analysis.confidence}%
            </span>
          </div>
        </div>

        {/* Readiness and Risk Badges */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div className={`p-2.5 rounded-lg border flex flex-col ${getReadinessColor(analysis.readiness)}`}>
            <span className="text-[9px] uppercase font-semibold text-slate-400">Readiness</span>
            <span className="font-bold mt-1">{analysis.readiness.replace("_", " ")}</span>
          </div>
          <div className={`p-2.5 rounded-lg border flex flex-col ${getRiskColor(analysis.riskLevel)}`}>
            <span className="text-[9px] uppercase font-semibold text-slate-400">AI Risk Rating</span>
            <span className="font-bold mt-1">{analysis.riskLevel}</span>
          </div>
        </div>

        {/* Recommendations list */}
        <div className="text-xs space-y-2 border-t border-slate-100 pt-3">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">AI Recommendation Workflow</span>
          <ul className="space-y-1.5 pt-0.5">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-slate-600 text-[11px] leading-relaxed">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* 2. Key Device Checklist Recommendations */}
      <Card>
        <Card.Header className="border-b border-slate-100 pb-2 mb-3">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">NABL Calibration checks</h4>
        </Card.Header>
        <Card.Body className="space-y-2.5 text-xs">
          {analysis.checklistRecommendations.map((check, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-600 text-[11px] leading-relaxed">
              <CheckCircle size={13} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">{check}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Reason: Ensure NABL laboratory standards are fully validated.</p>
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* 3. Evidence Recommendations Completeness */}
      <Card>
        <Card.Header className="border-b border-slate-100 pb-2 mb-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Required Evidence checklist</h4>
            <span className="text-[10px] font-semibold text-slate-500">{analysis.evidenceCompleteness}%</span>
          </div>
        </Card.Header>
        <Card.Body className="space-y-3 pt-1 text-xs">
          <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${analysis.evidenceCompleteness}%` }} />
          </div>
          <div className="space-y-2 pt-1">
            {analysis.evidenceRecommendations.map((rec) => (
              <div key={rec.key} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700">{rec.label}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rec.completed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {rec.completed ? "AVAILABLE" : "RECOMMENDED"}
                </span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* 4. Human-in-the-loop Warnings Panel */}
      {warnings.length > 0 && (
        <Card className="border-red-200 bg-red-50/10">
          <Card.Header className="border-b border-red-100 pb-2 mb-3 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-red-700" />
            <h4 className="text-[11px] font-bold text-red-800 uppercase tracking-wider">AI Discrepancy Warnings</h4>
          </Card.Header>
          <Card.Body className="space-y-4">
            {warnings.map((warn) => {
              const isReviewed = warn.status === "REVIEWED";
              return (
                <div key={warn.id} className="p-3 border border-red-100 rounded-lg bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-800 text-[11px]">{warn.title}</span>
                    <span className={`text-[9px] font-semibold px-1 rounded ${isReviewed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {warn.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 space-y-1">
                    <p><strong className="text-slate-700">What:</strong> {warn.what}</p>
                    <p><strong className="text-slate-700">Why:</strong> {warn.why}</p>
                    <p><strong className="text-slate-700">Action:</strong> {warn.todo}</p>
                  </div>
                  {!isReviewed && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[10px] h-7 py-0 mt-1 cursor-pointer"
                      onClick={() => onAcknowledgeWarning(warn.id)}
                    >
                      Acknowledge & Mark Reviewed
                    </Button>
                  )}
                </div>
              );
            })}
          </Card.Body>
        </Card>
      )}

      {/* 5. Domain-Specific Chat Interface */}
      <Card>
        <Card.Header className="border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Calibration Guide Q&A</h4>
        </Card.Header>
        <Card.Body className="space-y-3">
          <div className="h-40 overflow-y-auto border border-slate-100 rounded bg-slate-50 p-2.5 space-y-2 text-[10px]">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={msg.sender === "GATC" ? "text-right" : "text-left"}>
                <span className={["inline-block p-1.5 rounded max-w-[85%] leading-relaxed", msg.sender === "GATC" ? "bg-blue-600 text-white text-right" : "bg-white border border-slate-200 text-slate-700"].join(" ")}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Ask about seals or calibration..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-[11px] px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-blue-500 bg-white text-slate-800"
            />
            <button
              type="submit"
              className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              <Send size={12} />
            </button>
          </form>
        </Card.Body>
      </Card>

      {/* 6. AI Activity History Log */}
      <Card>
        <Card.Header className="border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
          <Clock size={14} className="text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">AI Activity Logs</h4>
        </Card.Header>
        <Card.Body className="space-y-2 text-[10px]">
          {activityHistory.map((act, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-slate-500 py-0.5 border-b border-slate-50 last:border-0">
              <span className="font-mono text-slate-400 flex-shrink-0">{act.time}</span>
              <span>{act.message}</span>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Model Specifications */}
      <div className="text-center text-[9px] text-slate-400 italic">
        Powered by {analysis.modelName} · Ref: {analysis.timestamp}
      </div>
    </div>
  );
}

export default GATCAIAssistant;
