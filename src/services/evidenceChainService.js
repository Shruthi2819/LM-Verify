/**
 * Evidence Chain Service
 * Manages tamper-evident verification chains, canonical recomputation, and blockchain anchoring proofs.
 */
import api from "./api.js";
import { mockEvidenceChains } from "../mock/evidenceChainData.js";
import { compareEvidenceChainIntegrity, computeChainedEvidenceHashes } from "../utils/crypto.js";
import { delay } from "../utils/helpers.js";

const USE_MOCK = (typeof import.meta !== "undefined" && import.meta?.env?.VITE_USE_MOCK_DATA) ? (import.meta.env.VITE_USE_MOCK_DATA === "true") : true;

// Local storage key for persistent evidence chains
const CHAIN_STORAGE_KEY = "lmv_mock_evidence_chains";

function getLocalChains() {
  if (typeof localStorage === "undefined") return [...mockEvidenceChains];
  const cached = localStorage.getItem(CHAIN_STORAGE_KEY);
  if (!cached) {
    localStorage.setItem(CHAIN_STORAGE_KEY, JSON.stringify(mockEvidenceChains));
    return [...mockEvidenceChains];
  }
  return JSON.parse(cached);
}

function saveLocalChains(chains) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CHAIN_STORAGE_KEY, JSON.stringify(chains));
  }
}

export const evidenceChainService = {
  /**
   * Get all evidence chains (for Admin monitoring)
   */
  async getEvidenceChains(params = {}) {
    if (USE_MOCK) {
      await delay(500);
      const { status, search } = params;
      let chains = getLocalChains();

      if (status) {
        chains = chains.filter(c => c.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        chains = chains.filter(c =>
          c.chainId.toLowerCase().includes(q) ||
          c.applicationId.toLowerCase().includes(q) ||
          (c.certificateId && c.certificateId.toLowerCase().includes(q)) ||
          (c.inspectionId && c.inspectionId.toLowerCase().includes(q)) ||
          c.businessName.toLowerCase().includes(q)
        );
      }
      return chains;
    }

    try {
      const response = await api.get("/evidence-chains", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch evidence chains.");
    }
  },

  /**
   * Get an evidence chain by Chain ID, Application ID, Certificate ID, or Inspection ID
   */
  async getEvidenceChain(identifier) {
    if (USE_MOCK) {
      await delay(400);
      const chains = getLocalChains();
      const matched = chains.find(c =>
        c.chainId.toUpperCase() === identifier.toUpperCase() ||
        c.applicationId.toUpperCase() === identifier.toUpperCase() ||
        (c.certificateId && c.certificateId.toUpperCase() === identifier.toUpperCase()) ||
        (c.inspectionId && c.inspectionId.toUpperCase() === identifier.toUpperCase())
      );

      if (matched) return matched;

      // Fallback: generate default evidence chain for any known certificate / application
      const defaultChain = {
        chainId: `CHAIN-${identifier.replace(/[^0-9]/g, "").padStart(6, "0") || "2026-000001"}`,
        applicationId: identifier.startsWith("APP") ? identifier : "APP-2026-00041",
        inspectionId: identifier.startsWith("INS") ? identifier : "INS-2026-000321",
        certificateId: identifier.startsWith("CERT") ? identifier : "CERT-2026-000007",
        instrumentId: "INS-2026-00001",
        businessName: "Acme Weighing Solutions Pvt. Ltd.",
        status: "VERIFIED",
        finalHash: "3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f99887766554433221100aabb",
        stages: mockEvidenceChains[0].stages,
        stageData: mockEvidenceChains[0].stageData,
        blockchainRecord: {
          network: "Ethereum Sepolia Testnet / Immutable Ledger",
          txReference: "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f",
          blockNumber: "5849201",
          anchoredAt: new Date().toISOString(),
          status: "ANCHORED"
        },
        lastVerifiedAt: new Date().toISOString(),
        verifiedBy: "Automated Integrity Engine"
      };
      return defaultChain;
    }

    try {
      const response = await api.get(`/evidence-chains/${identifier}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Evidence chain could not be loaded.");
    }
  },

  /**
   * Verify integrity of an evidence chain by comparing sealed hashes against live data
   */
  async verifyIntegrity(chainId) {
    if (USE_MOCK) {
      await delay(800);
      const chains = getLocalChains();
      const chainIdx = chains.findIndex(c => c.chainId === chainId);
      
      const chain = chainIdx !== -1 ? chains[chainIdx] : mockEvidenceChains[0];
      const liveStageData = chain.currentStageData || chain.stageData;

      const comparison = compareEvidenceChainIntegrity(chain, liveStageData);

      // Update chain status in cache
      if (chainIdx !== -1) {
        chains[chainIdx] = {
          ...chains[chainIdx],
          status: comparison.status,
          lastVerifiedAt: comparison.verifiedAt,
          verifiedBy: "Authorized System Officer"
        };
        saveLocalChains(chains);
      }

      return {
        chainId,
        ...comparison,
        blockchainRecord: chain.blockchainRecord
      };
    }

    try {
      const response = await api.post(`/evidence-chains/${chainId}/verify`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Unable to complete integrity verification.");
    }
  },

  /**
   * Controlled simulation tool for SIH Demonstration: Tamper with live measurement or photo stage
   */
  async simulateTampering(chainId, stageKey = "measurements", tamperedField = "readings") {
    if (USE_MOCK) {
      await delay(400);
      const chains = getLocalChains();
      const chainIdx = chains.findIndex(c => c.chainId === chainId);
      if (chainIdx === -1) throw new Error("Chain not found");

      const chain = chains[chainIdx];
      const current = JSON.parse(JSON.stringify(chain.currentStageData || chain.stageData));

      if (stageKey === "measurements") {
        current.measurements.readings[1].observedValue = 254.8; // Modified from 250.0
        current.measurements.readings[1].error = 4.8; // Exceeds tolerance
      } else if (stageKey === "evidence") {
        current.evidence.photos[0].hash = "ffffffffffffffffffffffff"; // Replaced photo hash
      } else if (stageKey === "decision") {
        current.decision.remarks = "Manually modified decision remarks after finalization.";
      }

      chains[chainIdx].currentStageData = current;
      chains[chainIdx].isTamperedDemo = true;
      saveLocalChains(chains);

      return { success: true, message: `Simulated modification in stage: ${stageKey}` };
    }
    throw new Error("Tampering simulation is only available in mock/demo mode.");
  },

  /**
   * Restore original clean data after demonstration
   */
  async restoreOriginalEvidence(chainId) {
    if (USE_MOCK) {
      await delay(400);
      const chains = getLocalChains();
      const chainIdx = chains.findIndex(c => c.chainId === chainId);
      if (chainIdx !== -1) {
        delete chains[chainIdx].currentStageData;
        chains[chainIdx].isTamperedDemo = false;
        chains[chainIdx].status = "VERIFIED";
        saveLocalChains(chains);
      }
      return { success: true, message: "Restored original clean integrity state." };
    }
  }
};

export default evidenceChainService;
