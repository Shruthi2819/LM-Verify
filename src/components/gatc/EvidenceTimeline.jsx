import React from "react";
import { CheckCircle2, Circle, Clock, FileText, Camera, ShieldCheck } from "lucide-react";

function EvidenceTimeline({ events = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "SUBMISSION": return <FileText size={12} className="text-blue-600" />;
      case "PHOTO": return <Camera size={12} className="text-amber-600" />;
      case "AI": return <ShieldCheck size={12} className="text-purple-600" />;
      default: return <CheckCircle2 size={12} className="text-green-600" />;
    }
  };

  return (
    <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-5 text-xs py-2">
      {events.map((evt, idx) => (
        <div key={idx} className="relative group">
          {/* Connector Dot */}
          <div className="absolute -left-[23px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            {getIcon(evt.type)}
          </div>
          
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{evt.title}</span>
              {(() => {
                if (!evt.timestamp) return null;
                const d = new Date(evt.timestamp);
                if (isNaN(d.getTime())) return null;
                return (
                  <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                    <Clock size={8} /> {d.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </span>
                );
              })()}
            </div>
            <p className="text-[11px] text-slate-500">{evt.description}</p>
            {evt.actor && (
              <span className="text-[9px] text-slate-400 block pt-0.5">Actor: {evt.actor}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EvidenceTimeline;
