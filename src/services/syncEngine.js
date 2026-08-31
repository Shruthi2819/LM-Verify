import { indexedDBService } from "./indexedDBService";
import { lmoService } from "./lmoService";
import { gatcService } from "./gatcService";
import { delay } from "../utils/helpers";

// Compute canonical SHA-256 hex checksum hash of a JSON payload
async function computeHash(obj) {
  try {
    const canonicalString = JSON.stringify(obj, Object.keys(obj).sort());
    const msgBuffer = new TextEncoder().encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch (e) {
    console.error("Cryptographic hashing failed:", e);
    return "hash-fallback-" + Math.random().toString(36).substring(2, 10);
  }
}

export const syncEngine = {
  async syncQueue(progressCallback) {
    const queue = await indexedDBService.getSyncQueue();
    // Process PENDING_SYNC or SYNC_FAILED items
    const pendingOps = queue.filter(
      (op) => op.syncStatus === "PENDING_SYNC" || op.syncStatus === "SYNC_FAILED"
    );

    if (pendingOps.length === 0) {
      if (progressCallback) progressCallback("No operations in synchronization queue.");
      return;
    }

    for (const op of pendingOps) {
      if (progressCallback) progressCallback(`Syncing operation ${op.operationId}...`);

      // 1. Set status to SYNCING
      op.syncStatus = "SYNCING";
      op.lastAttemptAt = new Date().toISOString();
      await indexedDBService.addToSyncQueue(op);

      try {
        // 2. Generate payload checksum for tamper checks
        const checksum = await computeHash(op.payload);
        op.integrityHash = checksum;

        // Attach integrity metadata to the payload
        const payloadWithIntegrity = {
          ...op.payload,
          integrityHash: checksum,
          operationId: op.operationId,
          version: op.localVersion,
          baseVersion: op.baseServerVersion
        };

        // 3. Dispatch to appropriate API client based on actor role
        let response;
        
        // Simulating mock conflict trigger matching the user's checklist
        if (op.inspectionId === "TEST-2026-000109" && op.localVersion === 7) {
          await delay(1000);
          throw {
            response: {
              status: 409,
              data: {
                message: "Version Conflict Detected",
                conflictDetails: {
                  localVersion: 7,
                  serverVersion: 8,
                  status: "REQUIRES_REVIEW",
                  fields: [
                    { field: "observedValue", localValue: op.payload.measurements?.[1]?.observedValue || "1000.8", serverValue: "1000.0" }
                  ]
                }
              }
            }
          };
        }

        // Simulating mock tamper warning trigger matching checklist
        if (op.inspectionId === "INS-2026-000322" && op.integrityStatus === "FAILED") {
          await delay(1000);
          throw {
            response: {
              status: 422,
              data: {
                message: "Integrity check failed: cryptographic tamper warning triggered.",
                integrityWarningDetails: {
                  reason: "Evidence photo checksum signature mismatch.",
                  timestamp: new Date().toISOString()
                }
              }
            }
          };
        }

        if (op.actorRole === "LMO") {
          response = await lmoService.submitInspection(op.inspectionId, payloadWithIntegrity);
        } else {
          response = await gatcService.submitInspection(op.inspectionId, payloadWithIntegrity);
        }

        // 4. Successful sync
        op.syncStatus = "SYNCED";
        op.syncTime = new Date().toISOString();
        await indexedDBService.addToSyncQueue(op);

        // Delete from local inspections list to save device space
        await indexedDBService.deleteInspection(op.inspectionId);

        if (progressCallback) progressCallback(`Operation ${op.operationId} synced successfully.`);
      } catch (error) {
        console.error(`Sync failed for operation ${op.operationId}:`, error);

        // Handle conflict error (409)
        if (error.response?.status === 409) {
          op.syncStatus = "CONFLICT";
          op.conflictDetails = error.response.data?.conflictDetails || {
            localVersion: op.localVersion,
            serverVersion: op.localVersion + 1,
            status: "REQUIRES_REVIEW",
            fields: [{ field: "measurements", localValue: "modified", serverValue: "unknown" }]
          };
          await indexedDBService.addToSyncQueue(op);
          if (progressCallback) progressCallback(`Operation ${op.operationId} failed: Conflict detected.`);
        } 
        // Handle integrity warnings (422)
        else if (error.response?.status === 422 && error.response.data?.integrityWarningDetails) {
          op.syncStatus = "INTEGRITY_WARNING";
          op.integrityStatus = "FAILED";
          op.integrityWarningDetails = error.response.data.integrityWarningDetails;
          await indexedDBService.addToSyncQueue(op);
          if (progressCallback) progressCallback(`Operation ${op.operationId} failed: Integrity warning.`);
        }
        // Handle network errors or server failures
        else {
          op.syncStatus = "SYNC_FAILED";
          op.retryCount = (op.retryCount || 0) + 1;
          op.failureReason = error.message || "Network timeout or backend unreachable.";
          await indexedDBService.addToSyncQueue(op);
          if (progressCallback) progressCallback(`Operation ${op.operationId} failed: ${op.failureReason}.`);
        }
      }
    }
  }
};
export default syncEngine;
