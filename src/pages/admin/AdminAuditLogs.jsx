import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import SearchBar from "../../components/common/SearchBar";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { ScrollText, Clock, User, Landmark, Clipboard } from "lucide-react";
import toast from "react-hot-toast";

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs({ search });
      setLogs(data || []);
    } catch (err) {
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [search]);

  const handleRowClick = (row) => {
    setSelectedLog(row);
    setModalOpen(true);
  };

  const columns = [
    { key: "timestamp", header: "Timestamp", render: (r) => <span className="font-mono text-xs">{new Date(r.timestamp).toLocaleString()}</span> },
    { key: "actorName", header: "User / Actor" },
    { key: "actorRole", header: "Role", render: (r) => (
      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
        {r.actorRole}
      </span>
    )},
    { key: "action", header: "Action Event" },
    { key: "entityType", header: "Target Entity" },
    { key: "entityId", header: "Entity ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.entityId}</span> }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Audit Logs" }]} />

      <div className="flex items-center gap-2">
        <ScrollText className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Department Audit Ledger</h1>
          <p className="text-sm text-slate-500 mt-0.5">Audit log logs of user state updates, verification schedules, and approvals</p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by actor name, event action, or application ID..."
        />
      </Card>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={5} cols={6} /></div>
        ) : (
          <Table
            columns={columns}
            data={logs}
            onRowClick={handleRowClick}
            emptyTitle="No audit logs recorded"
            emptyDescription="Administrative and calibration operations will trigger audit entries here."
          />
        )}
      </Card>

      {/* Audit Detail Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Audit Ledger Transaction details">
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Event ID</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Timestamp</span>
                <span className="font-mono text-slate-800">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Actor Identity</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <User size={12} className="text-slate-400" /> {selectedLog.actorName} ({selectedLog.actorRole})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Action Trigger</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedLog.action}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Target Type</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedLog.entityType}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Entity ID</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">{selectedLog.entityId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Previous State</span>
                <span className="font-mono font-semibold text-slate-500 mt-0.5 block">{selectedLog.previousState}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] tracking-wide">New State</span>
                <span className="font-mono font-bold text-blue-700 mt-0.5 block">{selectedLog.newState}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block uppercase text-[10px] tracking-wide">Event Metadata / Remarks</span>
              <p className="text-slate-700 leading-relaxed mt-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                {selectedLog.metadata}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminAuditLogs;
