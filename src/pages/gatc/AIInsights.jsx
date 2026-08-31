import { useState, useEffect } from "react";
import { gatcService } from "../../services/gatcService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatCard from "../../components/common/StatCard";
import { Sparkles, ShieldAlert, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAIInsights = async () => {
    try {
      const response = await gatcService.getAIInsights();
      setData(response);
    } catch (err) {
      toast.error("Failed to load AI Insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIInsights();
  }, []);

  const handleResolveAlert = async (id) => {
    try {
      await gatcService.resolveAIWarning(id);
      toast.success("AI Alert resolved successfully!");
      loadAIInsights();
    } catch (err) {
      toast.error("Failed to resolve alert.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "Dashboard", path: "/gatc/dashboard" }, { label: "AI Insights" }]} />
        <div className="h-40 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: "/gatc/dashboard" }, { label: "AI Insights" }]} />

      <div className="flex items-center gap-2">
        <Sparkles className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Calibration AI Insights</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time discrepancy checks, sensor deviation warnings and evidence audit metrics</p>
        </div>
      </div>

      {/* Stats indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Open Alerts" value={data.stats.totalAlerts} change="Needs GATC technician attention" trend="neutral" />
        <StatCard label="High Risk Anomalies" value={data.stats.highRisk} change="Critical serial/weight checks" trend="down" />
        <StatCard label="Medium Risk Warnings" value={data.stats.mediumRisk} change="Evidence missing warnings" trend="neutral" />
        <StatCard label="Resolved Alerts Logs" value={data.stats.resolvedAlerts} change="All time history" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Alerts lists */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Calibration Alerts</h2>
            </Card.Header>
            <Card.Body className="space-y-4">
              {data.alerts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No active AI verification alerts detected.</p>
              ) : (
                data.alerts.map((alert) => (
                  <div key={alert.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-3 text-xs shadow-sm hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs">{alert.type}</span>
                        <span className="font-mono text-[10px] text-slate-400 block">Task Ref: {alert.task}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={["text-[9px] font-bold px-1.5 py-0.5 rounded", alert.risk === "HIGH" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"].join(" ")}>
                          {alert.risk} RISK
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 px-1 border rounded">{alert.status}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-[11px] text-slate-650 space-y-2">
                      <p><strong>Explainability (Why flagged):</strong> {alert.reason}</p>
                      <p><strong>Corrective Action:</strong> {alert.todo}</p>
                    </div>
                    {alert.status === "OPEN" && (
                      <div className="flex justify-end pt-1">
                        <Button
                          variant="success"
                          size="sm"
                          className="h-8 text-[11px] cursor-pointer"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve Alert
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Right Column (1/3 width) - Technical explanation */}
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/5">
            <Card.Header className="border-b border-blue-100 pb-2 mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-blue-700" />
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Calibration AI Metrics</h3>
            </Card.Header>
            <Card.Body className="space-y-3.5 text-xs text-slate-650 leading-relaxed">
              <p>
                The AI assistant dynamically screens observed readings against **Legal Metrology (OIML R 76 / IS 9281)** accuracy guidelines.
              </p>
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-800">Checkpoints:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Measurement deviations check</li>
                  <li>Serial stamp mismatch verification</li>
                  <li>Tamper seal evidence completeness</li>
                </ul>
              </div>
              <p className="text-[10px] text-slate-400">
                LMO technicians retain complete legal authority; AI warnings serve only as procedural validation highlights.
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AIInsights;
