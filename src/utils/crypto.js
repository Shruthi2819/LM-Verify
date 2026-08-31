/**
 * Cryptographic & Deterministic Canonicalization Utilities for Tamper-Evident Evidence Chains
 */

export function canonicalJsonStringify(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(item => canonicalJsonStringify(item)).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys
    .filter(key => obj[key] !== undefined)
    .map(key => JSON.stringify(key) + ":" + canonicalJsonStringify(obj[key]));

  return "{" + pairs.join(",") + "}";
}

function sha256Pure(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = "length";
  let i, j;
  let result = "";

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [];
  const k = [];
  let primeCounter = 0;

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += "\x80";
  while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return;
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 =
        hash[7] +
        (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
        ch +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const temp2 =
        (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
        maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

export async function sha256(str) {
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) {}
  return sha256Pure(str);
}

export function sha256Sync(str) {
  return sha256Pure(str);
}

export const EVIDENCE_STAGES = [
  { key: "application", label: "Application Submission", order: 1 },
  { key: "assignment", label: "Officer Allocation", order: 2 },
  { key: "inspection", label: "Inspection Workspace", order: 3 },
  { key: "measurements", label: "Calibration Measurements", order: 4 },
  { key: "evidence", label: "Photographs & AI Evidence", order: 5 },
  { key: "locationTime", label: "Time & Location Attestation", order: 6 },
  { key: "decision", label: "Inspection Decision", order: 7 },
  { key: "approval", label: "Officer Approval", order: 8 },
  { key: "certificate", label: "Digital Certificate", order: 9 }
];

export function computeChainedEvidenceHashes(stageDataMap) {
  let previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
  const stageHashes = [];

  for (const stage of EVIDENCE_STAGES) {
    const data = stageDataMap[stage.key] || {};
    const canonicalPayload = canonicalJsonStringify(data);
    const inputToHash = previousHash + "|" + stage.key + "|" + canonicalPayload;
    const hash = sha256Sync(inputToHash);
    
    stageHashes.push({
      key: stage.key,
      label: stage.label,
      order: stage.order,
      inputPayload: data,
      canonicalString: canonicalPayload,
      previousHash,
      stageHash: hash
    });

    previousHash = hash;
  }

  return {
    stageHashes,
    finalHash: previousHash
  };
}

export function compareEvidenceChainIntegrity(originalChain, currentStageDataMap) {
  const currentChained = computeChainedEvidenceHashes(currentStageDataMap);
  const stageComparisons = [];
  let isOverallMatch = true;

  for (let i = 0; i < EVIDENCE_STAGES.length; i++) {
    const stageMeta = EVIDENCE_STAGES[i];
    const originalStage = originalChain.stages?.find(s => s.key === stageMeta.key);
    const currentStage = currentChained.stageHashes[i];

    const origHash = originalStage?.stageHash || "";
    const currHash = currentStage?.stageHash || "";
    const isMatch = origHash === currHash;

    if (!isMatch) {
      isOverallMatch = false;
    }

    stageComparisons.push({
      key: stageMeta.key,
      label: stageMeta.label,
      order: stageMeta.order,
      isMatch,
      originalHash: origHash,
      currentHash: currHash,
      originalPayload: originalStage?.inputPayload || null,
      currentPayload: currentStage?.inputPayload || null
    });
  }

  return {
    isMatch: isOverallMatch,
    status: isOverallMatch ? "VERIFIED" : "MISMATCH",
    originalFinalHash: originalChain.finalHash,
    currentFinalHash: currentChained.finalHash,
    stageComparisons,
    verifiedAt: new Date().toISOString()
  };
}

export function formatHash(hash, startLen = 8, endLen = 6) {
  if (!hash) return "—";
  if (hash.length <= startLen + endLen) return hash;
  return hash.substring(0, startLen) + "..." + hash.substring(hash.length - endLen);
}
