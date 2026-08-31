import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Filter, RefreshCw, AlertTriangle, CheckCircle2, Eye, ExternalLink, Sliders } from "lucide-react";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import EvidenceChainViewer from "../../components/common/EvidenceChainViewer";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { evidenceChainService } from "../../services/evidenceChainService";
import { formatHash } from "../../utils/crypto";
import toast from "react-hot-toast";

export function AdminEvidenceChains() {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal inspection
  const [selectedChain, setSelectedChain] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const loadChains = async () => {
    setLoading(true);
    try {
      const data = await evidenceChainService.getEvidenceChains({
        search: search.trim(),
        status: statusFilter
      });
      setChains(data || []);
    } catch (err) {
      toast.error("Failed to load evidence chains registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChains();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadChains();
  };

  const handleOpenChain = (chain) => {
    setSelectedChain(chain);
    setVerifyResult(null);
    setModalOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedChain) return;
    setVerifying(true);
    try {
      const res = await evidenceChainService.verifyIntegrity(selectedChain.chainId);
      setVerifyResult(res);
      if (res.isMatch) {
        toast.success("Integrity verified: all stages match authoritative ledger record.");
      } else {
        toast.error("Integrity mismatch detected. Stored evidence differs from sealed record.");
      }
      loadChains();
    } catch (err) {
      toast.error(err.message || "Integrity verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperSimulate = async (stageKey) => {
    if (!selectedChain) return;
    try {
      await evidenceChainService.simulateTampering(selectedChain.chainId, stageKey);
      toast.success(`Modified ${stageKey} in demo sandbox. Click 'Verify Integrity' to observe detection.`);
      const updated = await evidenceChainService.getEvidenceChain(selectedChain.chainId);
      setSelectedChain(updated);
      loadChains();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRestoreOriginal = async () => {
    if (!selectedChain) return;
    try {
      await evidenceChainService.restoreOriginalEvidence(selectedChain.chainId);
      toast.success("Restored clean original evidence.");
      setVerifyResult(null);
      const updated = await evidenceChainService.getEvidenceChain(selectedChain.chainId);
      setSelectedChain(updated);
      loadChains();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: "chainId",
      header: "Chain ID",
      render: (r) => <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">{r.chainId}</span>
    },
    {
      key: "applicationId",
      header: "Application ID",
      render: (r) => <span className="font-mono text-xs">{r.applicationId}</span>
    },
    {
      key: "certificateId",
      header: "Certificate ID",
      render: (r) => <span className="font-mono text-xs font-semibold">{r.certificateId || "—"}</span>
    },
    {
      key: "businessName",
      header: "Business Name",
      render: (r) => <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{r.businessName}</span>
    },
    {
      key: "finalHash",
      header: "Cryptographic Hash",
      render: (r) => (
        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800" title={r.finalHash}>
          {formatHash(r.finalHash, 6, 4)}
        </span>
      )
    },
    {
      key: "status",
      header: "Integrity Status",
      render: (r) => {
        const isMatch = r.status === "VERIFIED";
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
              isMatch
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300"
            }`}
          >
            {isMatch ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
            {isMatch ? "VERIFIED" : "MISMATCH"}
          </span>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 py-0 px-2"
          onClick={() => handleOpenChain(r)}
        >
          Audit Chain
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
          { label: "Evidence Integrity Chains" }
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 dark:bg-slate-800 dark:border-slate-700">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Evidence Integrity & Chain Registry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographic hash verification and immutable ledger audit for all 9 verification stages
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadChains} leftIcon={<RefreshCw size={12} />}>
            Refresh Ledger
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card noPadding className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by Chain ID, Application ID, Certificate ID, or Business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="VERIFIED">Verified (Match)</option>
              <option value="MISMATCH">Mismatch / Flagged</option>
            </Select>
          </div>
          <Button type="submit" variant="primary">
            Filter
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={4} cols={7} />
          </div>
        ) : (
          <Table
            columns={columns}
            data={chains}
            emptyTitle="No evidence chains found"
            emptyDescription="Generated evidence chains will be cataloged here."
          />
        )}
      </Card>

      {/* Chain Detail & Audit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Evidence Chain Integrity Audit"
        maxWidth="max-w-3xl"
      >
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {selectedChain && (
            <EvidenceChainViewer
              chain={selectedChain}
              onVerify={handleVerify}
              onTamperSimulate={handleTamperSimulate}
              onRestoreOriginal={handleRestoreOriginal}
              verifying={verifying}
              verificationResult={verifyResult}
              showDemoControls={true}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AdminEvidenceChains;
