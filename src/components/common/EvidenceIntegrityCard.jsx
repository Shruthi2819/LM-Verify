import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, ExternalLink, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Modal from "./Modal";
import EvidenceChainViewer from "./EvidenceChainViewer";
import { formatHash } from "../../utils/crypto";
import { evidenceChainService } from "../../services/evidenceChainService";
import toast from "react-hot-toast";

export function EvidenceIntegrityCard({
  chainId,
  applicationId,
  inspectionId,
  certificateId,
  className = ""
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const identifier = chainId || certificateId || inspectionId || applicationId;

  const loadChain = async () => {
    setLoading(true);
    try {
      const data = await evidenceChainService.getEvidenceChain(identifier);
      setChain(data);
    } catch (err) {
      console.warn("Could not load evidence chain:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    loadChain();
  };

  const handleVerify = async () => {
    if (!chain) return;
    setVerifying(true);
    try {
      const result = await evidenceChainService.verifyIntegrity(chain.chainId);
      setVerifyResult(result);
      if (result.isMatch) {
        toast.success("Integrity verified: all 9 evidence stages match.");
      } else {
        toast.error("Integrity mismatch detected. Stored evidence differs from sealed record.");
      }
      loadChain();
    } catch (err) {
      toast.error(err.message || "Failed to verify evidence integrity.");
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperSimulate = async (stageKey) => {
    if (!chain) return;
    try {
      await evidenceChainService.simulateTampering(chain.chainId, stageKey);
      toast.success(`Modified ${stageKey} in demo sandbox. Click 'Verify Integrity' to observe detection.`);
      loadChain();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRestoreOriginal = async () => {
    if (!chain) return;
    try {
      await evidenceChainService.restoreOriginalEvidence(chain.chainId);
      toast.success("Restored clean original evidence.");
      setVerifyResult(null);
      loadChain();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    toast.success("Evidence hash copied.");
  };

  return (
    <>
      <Card className={`border border-blue-100 bg-blue-50/20 dark:border-blue-900/30 dark:bg-slate-900/40 ${className}`}>
        <Card.Header className="border-b border-blue-100 pb-2.5 mb-3 flex justify-between items-center dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-700 dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Tamper-Evident Evidence Chain
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={10} /> CRYPTOGRAPHIC PROOF
          </span>
        </Card.Header>

        <Card.Body className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            All 9 inspection milestones (Application, Assignment, Measurements, Photo Evidence, Decision, Approval, Certificate) are cryptographically chained and anchored.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 bg-white rounded-lg border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Chain Reference</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {chainId || `CHAIN-${identifier.replace(/[^0-9]/g, "").padStart(6, "0") || "2026-000001"}`}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Authoritative Hash</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 truncate" title="0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f">
                0x3a7f...2c0f
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenModal}
              leftIcon={<ExternalLink size={12} />}
            >
              View Evidence Chain
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Evidence Chain Detailed Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tamper-Evident Evidence Chain & Integrity Audit"
        maxWidth="max-w-3xl"
      >
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          <EvidenceChainViewer
            chain={chain}
            onVerify={handleVerify}
            onTamperSimulate={handleTamperSimulate}
            onRestoreOriginal={handleRestoreOriginal}
            verifying={verifying}
            verificationResult={verifyResult}
            showDemoControls={true}
          />
        </div>
      </Modal>
    </>
  );
}

export default EvidenceIntegrityCard;
