import React from "react";
import Card from "./Card";
import { Clock, Shield, User } from "lucide-react";

/**
 * TimeVerifiedEvidence
 * Renders time-verified inspection context, authenticated officer credentials, and evidence traceability timeline.
 * Completely free of GPS/geolocation references.
 */
function TimeVerifiedEvidence({
  inspectionId,
  applicationId,
  instrumentId,
  officerName,
  officerRole,
  officerId,
  startedAt,
  timelineEvents = []
}) {
  return (
    <Card className="space-y-4">
      {/* Header */}
      <Card.Header className="flex justify-between items-center border-b border-slate-100 pb-2 mb-1">
        <div className="flex items-center gap-1.5 text-slate-800">
          <Clock size={16} className="text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Time-Verified Inspection</h3>
        </div>
        <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">
          ● ACTIVE
        </span>
      </Card.Header>

      {/* Metadata Panel */}
      <div className="text-[11px] text-slate-650 bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2">
        <div className="grid grid-cols-2 gap-y-2">
          <div>
            <span className="text-slate-400 font-medium block">Inspection ID</span>
            <span className="font-semibold text-slate-800 font-mono">{inspectionId || "INS-2026-N/A"}</span>
          </div>
          <div>
            <span className="text-slate-450 font-medium block">Application ID</span>
            <span className="font-semibold text-slate-800 font-mono">{applicationId || "APP-2026-N/A"}</span>
          </div>
          <div className="col-span-2 border-t border-slate-100 my-1"></div>
          <div>
            <span className="text-slate-450 font-medium block">Instrument ID</span>
            <span className="font-semibold text-slate-800 font-mono">{instrumentId || "INS-2026-N/A"}</span>
          </div>
          <div>
            <span className="text-slate-450 font-medium block">Officer / Role</span>
            <span className="font-semibold text-slate-800 flex items-center gap-0.5">
              <User size={10} className="text-slate-400" /> {officerName || "Authenticated LMO"} ({officerRole || "LMO"})
            </span>
          </div>
          <div className="col-span-2 border-t border-slate-100 my-1"></div>
          <div className="col-span-2">
            <span className="text-slate-450 font-medium block">Started At (Server Timestamp)</span>
            <span className="font-mono text-slate-700 font-semibold">{startedAt || new Date().toISOString()}</span>
          </div>
        </div>
      </div>

      {/* Traceability Audit Timeline */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
          <Shield size={12} className="text-blue-700" /> Traceability Timeline
        </div>
        
        <div className="relative pl-4 border-l-2 border-slate-150 space-y-3 text-[11px]">
          {timelineEvents.map((ev, index) => (
            <div key={index} className="relative">
              {/* Bullet node */}
              <div className="absolute -left-[21px] top-0.5 w-2 h-2 rounded-full bg-blue-600 border border-white"></div>
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold text-slate-800">{ev.event}</span>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{ev.time}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{ev.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default TimeVerifiedEvidence;
