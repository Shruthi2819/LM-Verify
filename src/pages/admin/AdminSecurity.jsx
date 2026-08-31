import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatusBadge from "../../components/feedback/StatusBadge";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

function AdminSecurity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSecurityLogs();
      setLogs(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load security ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns = [
    { key: "timestamp", header: "Timestamp", render: (r) => <span className="font-mono text-xs">{new Date(r.timestamp).toLocaleString()}</span> },
    { key: "actorId", header: "User ID / Origin", render: (r) => <span className="font-mono text-xs font-semibold">{r.actorId || "System"}</span> },
    { key: "actorRole", header: "Role Context", render: (r) => (
      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
        {r.actorRole}
      </span>
    )},
    { key: "action", header: "Security Event", render: (r) => (
      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
        r.action === "UNAUTHORIZED_API_ACCESS" || r.action === "FAILED_LOGIN_ATTEMPT"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-green-50 border-green-200 text-green-700"
      }`}>
        {r.action}
      </span>
    )},
    { key: "detail", header: "Audit Incident Details", render: (r) => <span className="text-slate-600 text-xs">{r.detail}</span> }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Security Monitoring" }]} />

      <div className="flex items-center gap-2">
        <ShieldAlert className="text-red-650" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Security & Access Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time auditing of failed login attempts, unauthorized api requests, and credentials mutations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Unresolved Threats</p>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">0 incidents</h3>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-amber-500" size={20} />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Recent Failed Logins</p>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">1 attempt</h3>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-500" size={20} />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">System State Integrity</p>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">100% Compliant</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Table view */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={3} cols={5} /></div>
        ) : (
          <Table
            columns={columns}
            data={logs}
            emptyTitle="No suspicious activities detected"
            emptyDescription="All security verifications have returned normal compliant logs."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminSecurity;
