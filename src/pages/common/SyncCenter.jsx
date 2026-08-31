import { useState, useEffect } from "react";
import { useNetwork } from "../../context/NetworkContext";
import { indexedDBService } from "../../services/indexedDBService";
import { adminService } from "../../services/adminService"; // Reuses resolveConflict api
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { RefreshCw, ShieldAlert, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

function SyncCenter() {
  const { isOnline, syncing, triggerSync, updatePendingCount } = useNetwork();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedOp, setSelectedOp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await indexedDBService.getSyncQueue();
      // Order chronologically (newest first)
      const sorted = [...data].sort((a, b) => new Date(b.createdTime || b.createdAt) - new Date(a.createdTime || a.createdAt));
      setOperations(sorted);
    } catch (e) {
      toast.error("Failed to load local sync queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [syncing]);

  const handleRowClick = (row) => {
    setSelectedOp(row);
    setModalOpen(true);
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error("You are currently offline. Synchronization will start when network connection is restored.");
      return;
    }
    toast.promise(triggerSync(), {
      loading: "Processing synchronization queue...",
      success: "Synchronization checks completed.",
      error: "Some operations failed to sync."
    }).then(() => {
      loadQueue();
      updatePendingCount();
    });
  };

  const handleResolveConflict = async (resolutionChoice) => {
    setActionLoading(true);
    try {
      // In mock mode, this resolves the state and marks status = SYNCED
      await adminService.resolveConflict(selectedOp.operationId || selectedOp.id, resolutionChoice);
      
      // Update IndexedDB record
      const updatedOp = {
        ...selectedOp,
        syncStatus: "SYNCED",
        syncTime: new Date().toISOString()
      };
      await indexedDBService.addToSyncQueue(updatedOp);
      
      toast.success(`Conflict resolved successfully using ${resolutionChoice} version.`);
      setModalOpen(false);
      loadQueue();
      updatePendingCount();
    } catch (err) {
      toast.error(err.message || "Failed to resolve conflict.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryOperation = async (op) => {
    if (!isOnline) {
      toast.error("Please connect to the internet to retry.");
      return;
    }
    
    // Mark status back to PENDING_SYNC
    const updated = {
      ...op,
      syncStatus: "PENDING_SYNC",
      retryCount: (op.retryCount || 0) + 1
    };
    await indexedDBService.addToSyncQueue(updated);
    
    toast.success("Operation queued for immediate retry.");
    handleManualSync();
  };

  // Aggregate states counts
  const total = operations.length;
  const pending = operations.filter(op => op.syncStatus === "PENDING_SYNC").length;
  const inProgress = operations.filter(op => op.syncStatus === "SYNCING").length;
  const synced = operations.filter(op => op.syncStatus === "SYNCED").length;
  const failed = operations.filter(op => op.syncStatus === "SYNC_FAILED").length;
  const conflicts = operations.filter(op => op.syncStatus === "CONFLICT").length;
  const warnings = operations.filter(op => op.syncStatus === "INTEGRITY_WARNING").length;

  const columns = [
    { key: "operationId", header: "Operation ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.operationId || r.id}</span> },
    { key: "inspectionId", header: "Inspection ID", render: (r) => <span className="font-mono text-xs text-blue-700 font-semibold">{r.inspectionId}</span> },
    { key: "actorName", header: "Audit Actor", render: (r) => <span>{r.actorName || "Officer"} ({r.actorRole || "LMO"})</span> },
    { key: "createdAt", header: "Created Time", render: (r) => <span className="font-mono text-xs">{new Date(r.createdAt || r.createdTime).toLocaleString()}</span> },
    { key: "syncTime", header: "Sync Time", render: (r) => (
      <span className="font-mono text-xs">{!r.syncTime || r.syncTime === "—" ? "—" : new Date(r.syncTime).toLocaleString()}</span>
    )},
    { key: "syncStatus", header: "Sync Status", render: (r) => <StatusBadge status={r.syncStatus} /> },
    { key: "version", header: "Local Version", render: (r) => <span className="font-mono text-xs">v{r.localVersion || r.version}</span> },
    { key: "integrityStatus", header: "Integrity", render: (r) => (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
        r.integrityStatus === "PASSED" || !r.integrityStatus
          ? "bg-green-50 border-green-200 text-green-700"
          : r.integrityStatus === "FAILED"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-slate-50 border-slate-200 text-slate-500"
      }`}>
        {r.integrityStatus || "PASSED"}
      </span>
    )}
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard" }, { label: "Sync Center" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="text-blue-700" size={24} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Field Synchronisation Hub</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage local-first calibration checklists database and resolve sync conflicts</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleManualSync}
          loading={syncing}
          leftIcon={<RefreshCw size={16} />}
        >
          Sync Now
        </Button>
      </div>

      {/* Sync Dashboard Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-3 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Queue Total</p>
          <p className="text-lg font-bold text-slate-700 mt-1">{total}</p>
        </Card>
        <Card className="p-3 text-center border-l-4 border-slate-400">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Sync</p>
          <p className="text-lg font-bold text-slate-700 mt-1">{pending}</p>
        </Card>
        <Card className="p-3 text-center border-l-4 border-blue-400">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Syncing</p>
          <p className="text-lg font-bold text-slate-700 mt-1">{inProgress}</p>
        </Card>
        <Card className="p-3 text-center border-l-4 border-green-500">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Synced</p>
          <p className="text-lg font-bold text-green-700 mt-1">{synced}</p>
        </Card>
        <Card className="p-3 text-center border-l-4 border-red-500">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Failed</p>
          <p className="text-lg font-bold text-red-700 mt-1">{failed}</p>
        </Card>
        <Card className="p-3 text-center border-l-4 border-amber-500">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Conflicts</p>
          <p className="text-lg font-bold text-amber-700 mt-1">{conflicts}</p>
        </Card>
      </div>

      {/* Queue list table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={8} /></div>
        ) : (
          <Table
            columns={columns}
            data={operations}
            onRowClick={handleRowClick}
            emptyTitle="No local operations in queue"
            emptyDescription="All offline field verifications are fully synchronized with the department servers."
          />
        )}
      </Card>

      {/* Detail & Resolution Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sync Operation Details"
      >
        {selectedOp && (
          <div className="space-y-4 text-xs select-none">
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Operation ID</td>
                    <td className="p-2 font-mono font-semibold text-slate-800">{selectedOp.operationId || selectedOp.id}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Inspection Task ID</td>
                    <td className="p-2 font-mono font-semibold text-blue-700">{selectedOp.inspectionId}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Sync Status</td>
                    <td className="p-2"><StatusBadge status={selectedOp.syncStatus} /></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-slate-400">Payload integrity Checksum</td>
                    <td className="p-2 font-mono text-[10px] text-slate-600 truncate max-w-[200px]">{selectedOp.integrityHash || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Conflict Review Widget */}
            {selectedOp.syncStatus === "CONFLICT" && selectedOp.conflictDetails && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex gap-2">
                  <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-bold">CONFLICT DETECTED — REQUIRES REVIEW</p>
                    <p className="mt-1 leading-relaxed">
                      Server database has a newer version. Overwriting requires selecting which version to keep.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                        <th className="p-2 font-bold">Field Name</th>
                        <th className="p-2 font-bold text-amber-700">Local (Your) Value</th>
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
                    loading={actionLoading}
                    onClick={() => handleResolveConflict("server")}
                  >
                    Keep Server Version
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={() => handleResolveConflict("local")}
                  >
                    Use Local Version
                  </Button>
                </div>
              </div>
            )}

            {/* Integrity / Tamper alerts */}
            {selectedOp.syncStatus === "INTEGRITY_WARNING" && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 flex gap-2">
                  <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-bold">INTEGRITY CHECK FAILED</p>
                    <p className="mt-1 leading-relaxed">
                      Cryptographic digest validation failed. Mismatch detected on local payload signature.
                    </p>
                  </div>
                </div>
                {selectedOp.integrityWarningDetails && (
                  <p className="text-[10px] text-slate-500 font-mono">Reason: {selectedOp.integrityWarningDetails.reason}</p>
                )}
              </div>
            )}

            {/* Failed Sync details */}
            {selectedOp.syncStatus === "SYNC_FAILED" && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150 text-slate-600">
                  <p className="font-semibold text-slate-700">Synchronization Error Log</p>
                  <p className="mt-1 leading-relaxed text-[10px] font-mono">{selectedOp.failureReason || "Connection timed out."}</p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRetryOperation(selectedOp)}
                  >
                    Retry Operation
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SyncCenter;
