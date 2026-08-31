import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { RefreshCw, ShieldAlert, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

function AdminOfflineSync() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Modal Detail state
  const [selectedOp, setSelectedOp] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [resolving, setResolving] = useState(false);

  const loadOperations = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSyncOperations({ search, status });
      setOperations(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load synchronization logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperations();
  }, [search, status]);

  const handleRowClick = (row) => {
    setSelectedOp(row);
    setDetailModalOpen(true);
  };

  const handleResolveConflict = async (resolutionChoice) => {
    setResolving(true);
    try {
      await adminService.resolveConflict(selectedOp.id, resolutionChoice);
      toast.success(`Conflict resolved successfully using ${resolutionChoice} version.`);
      setDetailModalOpen(false);
      loadOperations();
    } catch (err) {
      toast.error(err.message || "Failed to resolve conflict.");
    } finally {
      setResolving(false);
    }
  };

  // Aggregate stats
  const totalOps = operations.length;
  const pendingSync = operations.filter(op => op.syncStatus === "PENDING_SYNC").length;
  const syncing = operations.filter(op => op.syncStatus === "SYNCING").length;
  const synced = operations.filter(op => op.syncStatus === "SYNCED").length;
  const failed = operations.filter(op => op.syncStatus === "SYNC_FAILED").length;
  const conflicts = operations.filter(op => op.syncStatus === "CONFLICT").length;
  const warnings = operations.filter(op => op.syncStatus === "INTEGRITY_WARNING").length;

  const columns = [
    { key: "id", header: "Operation ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "inspectionId", header: "Inspection ID", render: (r) => <span className="font-mono text-xs text-blue-700 font-semibold">{r.inspectionId}</span> },
    { key: "actorName", header: "Actor / Officer", render: (r) => <span>{r.actorName} ({r.actorRole})</span> },
    { key: "createdTime", header: "Created Time", render: (r) => <span className="font-mono text-xs">{new Date(r.createdTime).toLocaleString()}</span> },
    { key: "syncTime", header: "Sync Time", render: (r) => (
      <span className="font-mono text-xs">{r.syncTime === "—" ? "—" : new Date(r.syncTime).toLocaleString()}</span>
    )},
    { key: "syncStatus", header: "Sync Status", render: (r) => <StatusBadge status={r.syncStatus} /> },
    { key: "version", header: "Version", render: (r) => <span className="font-mono text-xs">v{r.version}</span> },
    { key: "integrityStatus", header: "Integrity", render: (r) => (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
        r.integrityStatus === "PASSED"
          ? "bg-green-50 border-green-200 text-green-700"
          : r.integrityStatus === "FAILED"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-slate-50 border-slate-200 text-slate-500"
      }`}>
        {r.integrityStatus}
      </span>
    )}
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Offline & Sync Monitor" }]} />

      <div className="flex items-center gap-2">
        <RefreshCw className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Offline Synchronisation Ledger</h1>
          <p className="text-sm text-slate-500 mt-0.5">Central tracking of field calibration synchronization checkpoints, version conflicts, and payload integrity checks</p>
        </div>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card className="p-3.5 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Total Ops</p>
          <p className="text-lg font-bold text-slate-700 mt-1">{totalOps}</p>
        </Card>
        <Card className="p-3.5 text-center border-l-4 border-slate-400">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Pending</p>
          <p className="text-lg font-bold text-slate-700 mt-1">{pendingSync}</p>
        </Card>
        <Card className="p-3.5 text-center border-l-4 border-blue-400">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Syncing</p>
          <p className="text-lg font-bold text-slate-700 mt-1">{syncing}</p>
        </Card>
        <Card className="p-3.5 text-center border-l-4 border-green-500">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Synced</p>
          <p className="text-lg font-bold text-green-700 mt-1">{synced}</p>
        </Card>
        <Card className="p-3.5 text-center border-l-4 border-red-400">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Failed</p>
          <p className="text-lg font-bold text-red-700 mt-1">{failed}</p>
        </Card>
        <Card className="p-3.5 text-center border-l-4 border-amber-500">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Conflicts</p>
          <p className="text-lg font-bold text-amber-700 mt-1">{conflicts}</p>
        </Card>
        <Card className="p-3.5 text-center border-l-4 border-red-650">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Warnings</p>
          <p className="text-lg font-bold text-red-700 mt-1">{warnings}</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by operation ID, inspection ID, or actor name..."
            />
          </div>
          <Select
            label="Sync Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "PENDING_SYNC", label: "Pending Sync" },
              { value: "SYNCING", label: "Syncing" },
              { value: "SYNCED", label: "Synced" },
              { value: "SYNC_FAILED", label: "Sync Failed" },
              { value: "CONFLICT", label: "Conflict" },
              { value: "INTEGRITY_WARNING", label: "Integrity Warning" }
            ]}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      {/* Grid List Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={8} /></div>
        ) : (
          <Table
            columns={columns}
            data={operations}
            onRowClick={handleRowClick}
            emptyTitle="No sync operations found"
            emptyDescription="All local databases are fully synchronized with the central server directory."
          />
        )}
      </Card>

      {/* Detail & Resolution Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Sync Operation Audit dossier"
      >
        {selectedOp && (
          <div className="space-y-4 text-xs select-none">
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Operation ID</td>
                    <td className="p-2 font-mono font-semibold text-slate-800">{selectedOp.id}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Inspection Task ID</td>
                    <td className="p-2 font-mono font-semibold text-blue-700">{selectedOp.inspectionId}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Actor Officer</td>
                    <td className="p-2 font-semibold text-slate-800">{selectedOp.actorName} ({selectedOp.actorRole})</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Sync Status</td>
                    <td className="p-2"><StatusBadge status={selectedOp.syncStatus} /></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Database Version</td>
                    <td className="p-2 font-mono">v{selectedOp.version}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Integrity Check</td>
                    <td className="p-2 font-semibold text-slate-800">{selectedOp.integrityStatus}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Conflict Resolution Block */}
            {selectedOp.syncStatus === "CONFLICT" && selectedOp.conflictDetails && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex gap-2">
                  <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-bold">CONFLICT DETECTED — REQUIRES ADMINISTRATIVE RESOLUTION</p>
                    <p className="mt-1 leading-relaxed">
                      The local database edit conflicts with modifications recorded on the server.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                        <th className="p-2 font-bold">Field Name</th>
                        <th className="p-2 font-bold text-amber-700">Local (Officer) Value</th>
                        <th className="p-2 font-bold text-blue-700">Server (Official) Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                      {selectedOp.conflictDetails.fields.map((f, i) => (
                        <tr key={i}>
                          <td className="p-2 font-sans font-medium text-slate-500">{f.field}</td>
                          <td className="p-2 text-amber-700 font-semibold">{f.localValue}</td>
                          <td className="p-2 text-blue-700 font-semibold">{f.serverValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={resolving}
                    onClick={() => handleResolveConflict("server")}
                  >
                    Keep Server Version
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={resolving}
                    onClick={() => handleResolveConflict("local")}
                  >
                    Use Local Version
                  </Button>
                </div>
              </div>
            )}

            {/* Integrity warnings */}
            {selectedOp.syncStatus === "INTEGRITY_WARNING" && selectedOp.integrityWarningDetails && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 flex gap-2">
                  <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-bold">INTEGRITY CHECK FAILED</p>
                    <p className="mt-1 leading-relaxed">
                      Cryptographic tamper evidence verifier indicates binary changes mismatch.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150 font-mono text-[10px] text-slate-600">
                  <p><span className="font-sans font-semibold text-slate-400">Reason:</span> {selectedOp.integrityWarningDetails.reason}</p>
                  <p className="mt-1"><span className="font-sans font-semibold text-slate-400">Timestamp:</span> {new Date(selectedOp.integrityWarningDetails.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Failure details */}
            {selectedOp.syncStatus === "SYNC_FAILED" && selectedOp.failureReason && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150 text-slate-600">
                  <p className="font-semibold text-slate-700">Synchronization Sync Error Log</p>
                  <p className="mt-1 leading-relaxed text-[10px] font-mono">{selectedOp.failureReason}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                Close dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminOfflineSync;
