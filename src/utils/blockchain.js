/**
 * Blockchain utility placeholder.
 *
 * The actual blockchain verification happens server-side.
 * The frontend calls the backend verification API and
 * displays the result — it does NOT sign or submit transactions.
 *
 * SECURITY: Never store private keys or signing credentials here.
 * This file is intentionally limited to display helpers.
 *
 * Future integration flow:
 *   Certificate generated on backend
 *     → Certificate hash computed
 *     → Hash stored on blockchain (backend/service)
 *     → Transaction ID returned
 *     → Stored with certificate record
 *
 *   Verification flow:
 *     Frontend calls GET /api/certificates/:id/verify
 *     Backend checks certificate hash against blockchain record
 *     Returns { verified: true/false, hash, txId, network }
 *     Frontend displays result
 */

/**
 * Format a blockchain transaction hash for display.
 * @param {string} hash
 * @returns {string} shortened hash like 0x1234...abcd
 */
export function formatTxHash(hash) {
  if (!hash || hash.length < 12) return hash || "—";
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * Format a certificate hash for display.
 */
export function formatCertHash(hash) {
  if (!hash || hash.length < 12) return hash || "—";
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Verification status display labels.
 */
export const BLOCKCHAIN_STATUS = {
  MATCHED: "HASH MATCHED",
  MISMATCH: "HASH MISMATCH",
  PENDING: "VERIFICATION PENDING",
  UNAVAILABLE: "BLOCKCHAIN UNAVAILABLE",
};

/**
 * Placeholder — actual verification goes through the backend API.
 * This function should call the backend, not the blockchain directly.
 *
 * @param {string} certificateId
 * @returns {Promise<{ verified: boolean, hash: string, txId: string, network: string }>}
 */
export async function verifyCertificateViaAPI(certificateId) {
  // Implementation: call GET /api/verify/:certificateId
  // Backend handles blockchain verification
  throw new Error(
    "verifyCertificateViaAPI: not yet connected to backend. " +
      "Wire this to the api.js service in Part 2."
  );
}
