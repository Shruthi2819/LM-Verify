# LM Verify — Post-Admin Backend API Developer Specification & Contract
*(Reflecting Current Frontend Implementation & User Corrections)*

**Target Audience:** Backend API Engineers  
**Scope:** Post-Admin Advanced Features & Verification Workflows (**Parts 10, 10A, 11, 13, 14, 17, 18**)  
**Standard:** REST / JSON + Deterministic Canonical JSON Hashing (SHA-256) + PDF Rendering + WebSocket / SSE for Background Sync  

---

## 1. Summary of What Is Actually in the Frontend (After User Corrections & Removals)

The backend engineer must note the following crucial corrections and removals made to the frontend:

1. **GPS / Geolocation Tracking REMOVED**:
   - Geolocation (GPS latitude, longitude, and radius geofencing) has been **completely removed** to protect officer privacy and support indoor industrial verification.
   - **What is actually used**: **Time-Verified Server Attestation** (`serverRecordedAt` ISO timestamp generated authoritatively by the server, `officerId`, `officerRole`, `clientCapturedAt`, and text installation address).
2. **Simplified, Clean Single-Column Layout (Voice/AI Right-Column Removed)**:
   - The cluttered multi-column layout was removed. The inspection workspace is a streamlined, responsive single column with clean, collapsible and embedded cards.
   - **Voice Assistant**: An optional, non-intrusive speech-to-measurement parser that returns structured JSON for manual LMO review before any value is saved.
3. **AI Vision & OCR Stamping**:
   - AI outputs are **transient until confirmed by the LMO / technician**. Confirmed OCR serial numbers and seal statuses are committed to the inspection record and sealed into the evidence chain.
4. **Offline-First Field Verification**:
   - IndexedDB (`inspections`, `sync_queue`, `evidence` blobs) + Service Worker.
   - Sync Engine dispatches batch operations with payload cryptographic checksums (`integrityHash`) and optimistic versioning (`localVersion`, `baseServerVersion`) to detect concurrency conflicts.
5. **Digital Certificates**:
   - Generated only after inspection verdict is `PASS` and officer approval is granted.
   - Server-side headless PDF generation endpoint returning standard PDF with security Guilloché styling, official QR code, and barcode.
6. **Tamper-Evident Evidence Chain**:
   - A sequential 9-stage chained SHA-256 hash ($H_1 \to H_9$) built from canonical JSON serialization.
   - **Neutral Non-Accusatory Warning**: If a hash differs, the backend returns `{ "isMatch": false, "status": "MISMATCH" }` and the UI states: *"Stored evidence differs from the original integrity record. Further review may be required."* No user or officer is ever automatically accused of fraud.

---

## 2. Module 1: AI Vision & OCR Stamping Verification APIs (Part 10 & 10A)

### 2.1. Vision OCR Extraction & Parameter Comparison
Takes an image upload (or camera frame) and compares extracted physical nameplate values against expected master database values.

* **Method:** `POST`
* **Endpoint:** `/api/ai/vision-ocr/analyze`
* **Headers:** `Content-Type: multipart/form-data` or `application/json`
* **Request Schema (`AIVisionAnalysisRequest`):**
  ```json
  {
    "inspectionId": "INS-2026-000321",
    "image": "data:image/jpeg;base64,...",
    "expectedMaster": {
      "serialNumber": "AWT-2023-XY5678",
      "manufacturer": "Avery Weigh-Tronix",
      "model": "ZM305",
      "capacity": "500 kg"
    }
  }
  ```
* **Response `200 OK` (`AIVisionAnalysisResponse`):**
  ```json
  {
    "analysisId": "AN-VISION-1725091200000",
    "extracted": {
      "serialNumber": "AWT-2023-XY5678",
      "manufacturer": "Avery Weigh-Tronix",
      "model": "ZM305",
      "capacity": "500 kg",
      "confidence": 0.985
    },
    "vision": {
      "instrumentDetected": "Detected",
      "sealStatus": "Visible (Intact)",
      "damageStatus": "None"
    },
    "comparison": {
      "serialMatch": true,
      "manufacturerMatch": true,
      "modelMatch": true,
      "overallResult": "MATCH"
    },
    "warnings": []
  }
  ```

### 2.2. Dynamic Parameter & Maximum Permissible Error (MPE) Evaluation
* **Method:** `POST`
* **Endpoint:** `/api/ai/analyze-inspection`
* **Request Schema:**
  ```json
  {
    "inspectionId": "INS-2026-000321",
    "instrumentId": "INS-2026-00002",
    "instrumentType": "Platform Scale",
    "serialNumber": "AWT-2023-XY5678",
    "checklist": [
      { "id": "cl-1", "label": "Physical Condition check", "value": "PASS" }
    ],
    "measurements": [
      { "id": "m-1", "testName": "Zero Load Calibration", "standardValue": 0, "observedValue": 0.0 }
    ],
    "observations": "Sealing wire intact.",
    "photos": [
      { "id": "p-1", "name": "plate.jpg" }
    ]
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "evidenceCompleteness": 100,
    "evidenceRecommendations": [
      { "key": "overall", "label": "Overall Instrument Photo", "completed": true },
      { "key": "serial", "label": "Serial Plate Photo", "completed": true },
      { "key": "seal", "label": "Lead Wire Seal Photo", "completed": true }
    ],
    "warnings": []
  }
  ```

---

## 3. Module 2: Time-Verified Evidence & Server Attestation (Part 11)
*(Strictly GPS-Free — Certified Server Timestamp & Officer Credentials)*

### 3.1. Initialize Time-Verified Inspection Session
* **Method:** `POST`
* **Endpoint:** `/api/lmo/inspections/{inspectionId}/start-session`
* **Response `200 OK`:**
  ```json
  {
    "inspectionId": "INS-2026-000321",
    "serverRecordedAt": "2026-08-30T10:30:00.000Z",
    "officer": {
      "id": "LMO-MH-44012",
      "name": "Priya Sharma",
      "role": "LMO"
    },
    "sessionToken": "SESS-SECURE-998822"
  }
  ```

### 3.2. GATC Laboratory Calibration Digital Signature
* **Method:** `POST`
* **Endpoint:** `/api/gatc/inspections/{inspectionId}/sign`
* **Request Schema:**
  ```json
  {
    "technicianId": "GATC-TECH-004",
    "pin": "1234"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "signatureStatus": "Signed",
    "signatureHash": "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
    "signedAt": "2026-08-30T11:45:00.000Z"
  }
  ```

---

## 4. Module 3: Offline Field Verification & Sync Engine (Part 13)

### 4.1. Batch Synchronization Upload
Processes operations queued while the LMO or GATC technician was in an offline zone.

* **Method:** `POST`
* **Endpoint:** `/api/sync/batch`
* **Request Schema (`SyncBatchPayload`):**
  ```json
  {
    "deviceId": "LMO-TAB-MH-04",
    "officerId": "LMO-MH-44012",
    "operations": [
      {
        "operationId": "OP-1725091200001",
        "entityType": "INSPECTION",
        "entityId": "INS-2026-000321",
        "action": "SUBMIT_INSPECTION",
        "localVersion": 1,
        "baseServerVersion": 1,
        "clientTimestamp": "2026-08-30T11:20:00.000Z",
        "integrityHash": "a3f89e21d5c7b41098ef01bc...",
        "payload": {
          "checklist": [{ "id": "cl-1", "value": "PASS" }],
          "measurements": [{ "id": "m-1", "observedValue": 0.0, "error": 0.0, "result": "PASS" }],
          "result": "PASS",
          "remarks": "Verified in offline mode."
        }
      }
    ]
  }
  ```
* **Response `200 OK` (`SyncBatchResult`):**
  ```json
  {
    "successful": ["OP-1725091200001"],
    "failed": [],
    "conflicts": [],
    "serverSyncTimestamp": "2026-08-31T22:45:00.000Z"
  }
  ```
* **Response `409 Conflict` (Optimistic Version Collision):**
  ```json
  {
    "message": "Version Conflict Detected",
    "conflictDetails": {
      "conflictId": "CONF-2026-00091",
      "operationId": "OP-1725091200001",
      "localVersion": 1,
      "serverVersion": 2,
      "status": "REQUIRES_REVIEW",
      "fields": [
        {
          "field": "measurements",
          "localValue": [{ "id": "m-1", "observedValue": 0.0 }],
          "serverValue": [{ "id": "m-1", "observedValue": 0.2 }]
        }
      ]
    }
  }
  ```

---

## 5. Module 4: Voice-Assisted Inspection Parser (Part 14)

### 5.1. Speech-to-Measurement Parser
Converts raw audio transcripts into candidate checklist verdicts and numerical calibration measurements.

* **Method:** `POST`
* **Endpoint:** `/api/voice/parse-inspection`
* **Request Schema:**
  ```json
  {
    "transcript": "Zero load observed reading zero point zero kilograms pass, half capacity observed reading 250 point zero error zero pass",
    "checklistCatalog": ["Physical Condition check", "Identification Markings legible"],
    "measurementCatalog": ["Zero Load Calibration", "Half Capacity Verification", "Full Capacity Load"]
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "structuredUpdates": {
      "checklistUpdates": [
        { "id": "cl-1", "label": "Physical Condition check", "value": "PASS" }
      ],
      "measurementUpdates": [
        { "id": "m-1", "testName": "Zero Load Calibration", "observedValue": 0.0, "error": 0.0, "result": "PASS" },
        { "id": "m-2", "testName": "Half Capacity Verification", "observedValue": 250.0, "error": 0.0, "result": "PASS" }
      ]
    },
    "confidence": 0.97
  }
  ```

---

## 6. Module 5: Digital Certificates & PDF Download (Part 17)

### 6.1. Generate Certificate (Post-Verification & Approval)
* **Method:** `POST`
* **Endpoint:** `/api/certificates/generate`
* **Request Schema:**
  ```json
  {
    "applicationId": "APP-2026-00041"
  }
  ```
* **Response `201 Created`:**
  ```json
  {
    "certificate": {
      "id": "CERT-2026-000007",
      "applicationId": "APP-2026-00041",
      "instrumentName": "Platform Scale",
      "serialNumber": "AWT-2023-XY5678",
      "capacity": "500 kg",
      "businessName": "Acme Weighing Solutions Pvt. Ltd.",
      "address": "Plot 12, Bhosari Industrial Estate, Pune",
      "issuedDate": "2026-08-30",
      "expiryDate": "2027-08-29",
      "status": "Valid",
      "issuingOfficer": "Priya Sharma",
      "designation": "Legal Metrology Officer",
      "department": "Department of Legal Metrology",
      "blockchainHash": "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f",
      "txId": "0x5849201abc1237890ef99887766554433221100aa",
      "network": "Ethereum Sepolia Testnet",
      "evidenceChainId": "CHAIN-2026-000041"
    }
  }
  ```

### 6.2. Download Official Certificate PDF
Generates a printable PDF file with Guilloché border, Government header, dynamic QR code, and barcode.

* **Method:** `GET`
* **Endpoint:** `/api/certificates/{certificateId}/pdf`
* **Response Headers:**
  ```http
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="CERT-2026-000007.pdf"
  ```
* **Response Body:** Binary PDF stream.

### 6.3. Public Certificate Verification Gateway
* **Method:** `GET`
* **Endpoint:** `/api/public/verify/{certificateId}`
* **Access:** Public (No token required)
* **Response `200 OK`:**
  ```json
  {
    "valid": true,
    "status": "VERIFIED",
    "certificate": {
      "id": "CERT-2026-000007",
      "instrumentName": "Platform Scale",
      "serialNumber": "AWT-2023-XY5678",
      "businessName": "Acme Weighing Solutions Pvt. Ltd.",
      "issuedDate": "2026-08-30",
      "expiryDate": "2027-08-29",
      "status": "Valid",
      "evidenceChainId": "CHAIN-2026-000041",
      "blockchainHash": "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f"
    }
  }
  ```

---

## 7. Module 6: Tamper-Evident Evidence Chain & Cryptographic Ledger (Part 18)

### 7.1. Chained Hashing Algorithm ($H_1 \to H_9$)
The backend must construct the 9 verification stages deterministically:

1. **Stage 1 (Application):** $H_1 = \text{SHA256}(H_0 + \text{"|application|"} + \text{canonical}(payload_1))$  
   *(where $H_0 = \text{"0000000000000000000000000000000000000000000000000000000000000000"}$)*
2. **Stage 2 (Assignment):** $H_2 = \text{SHA256}(H_1 + \text{"|assignment|"} + \text{canonical}(payload_2))$
3. **Stage 3 (Inspection):** $H_3 = \text{SHA256}(H_2 + \text{"|inspection|"} + \text{canonical}(payload_3))$
4. **Stage 4 (Measurements):** $H_4 = \text{SHA256}(H_3 + \text{"|measurements|"} + \text{canonical}(payload_4))$
5. **Stage 5 (Evidence & Photos):** $H_5 = \text{SHA256}(H_4 + \text{"|evidence|"} + \text{canonical}(payload_5))$
6. **Stage 6 (Location & Server Time):** $H_6 = \text{SHA256}(H_5 + \text{"|locationTime|"} + \text{canonical}(payload_6))$
7. **Stage 7 (Decision):** $H_7 = \text{SHA256}(H_6 + \text{"|decision|"} + \text{canonical}(payload_7))$
8. **Stage 8 (Officer Approval):** $H_8 = \text{SHA256}(H_7 + \text{"|approval|"} + \text{canonical}(payload_8))$
9. **Stage 9 (Certificate):** $H_9 = \text{SHA256}(H_8 + \text{"|certificate|"} + \text{canonical}(payload_9))$

**Authoritative Final Hash:** $H_9$ (64-character lowercase hex string).

### 7.2. Canonical JSON Serialization Rules
- Keys recursively sorted alphabetically.
- No whitespace between keys, colons, or commas (`{"a":1,"b":"val"}`).
- Null fields preserved if defined; undefined fields omitted.
- Numbers formatted with consistent precision.

### 7.3. Query Evidence Chain
* **Method:** `GET`
* **Endpoint:** `/api/evidence-chains/{chainIdOrEntityId}`
* **Response `200 OK` (`EvidenceChainResponse`):**
  ```json
  {
    "chainId": "CHAIN-2026-000001",
    "applicationId": "APP-2026-00041",
    "inspectionId": "INS-2026-000321",
    "certificateId": "CERT-2026-000007",
    "businessName": "Acme Weighing Solutions Pvt. Ltd.",
    "status": "VERIFIED",
    "finalHash": "4445cd2a9a8008e1e34bffb9cf67c85160cab58a49089abddef85d1f4015d5fc",
    "stages": [
      {
        "key": "application",
        "label": "Application Submission",
        "order": 1,
        "previousHash": "0000000000000000000000000000000000000000000000000000000000000000",
        "stageHash": "a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef",
        "inputPayload": { "applicationId": "APP-2026-00041", "instrumentSerial": "AWT-2023-XY5678" }
      },
      { "key": "assignment", "order": 2, "stageHash": "b2c3d4e5..." },
      { "key": "inspection", "order": 3, "stageHash": "c3d4e5f6..." },
      { "key": "measurements", "order": 4, "stageHash": "d4e5f607..." },
      { "key": "evidence", "order": 5, "stageHash": "e5f60718..." },
      { "key": "locationTime", "order": 6, "stageHash": "f6071829..." },
      { "key": "decision", "order": 7, "stageHash": "0718293a..." },
      { "key": "approval", "order": 8, "stageHash": "18293a4b..." },
      { "key": "certificate", "order": 9, "stageHash": "4445cd2a9a8008e1e34bffb9cf67c85160cab58a49089abddef85d1f4015d5fc" }
    ],
    "blockchainRecord": {
      "network": "Ethereum Sepolia Testnet / Internal Immutable Ledger",
      "txReference": "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f",
      "blockNumber": "5849201",
      "anchoredAt": "2026-08-30T11:26:30.000Z",
      "status": "ANCHORED"
    },
    "lastVerifiedAt": "2026-08-31T22:45:00.000Z"
  }
  ```

### 7.4. Verify Evidence Chain Integrity
Reconstructs current canonical evidence from live database tables, recomputes current $H_1 \to H_9$, and compares against the original sealed stage hashes.

* **Method:** `POST`
* **Endpoint:** `/api/evidence-chains/{chainId}/verify`
* **Response `200 OK` — When All Stages Match:**
  ```json
  {
    "chainId": "CHAIN-2026-000001",
    "isMatch": true,
    "status": "VERIFIED",
    "originalFinalHash": "4445cd2a9a8008e1e34bffb9cf67c85160cab58a49089abddef85d1f4015d5fc",
    "currentFinalHash": "4445cd2a9a8008e1e34bffb9cf67c85160cab58a49089abddef85d1f4015d5fc",
    "stageComparisons": [
      { "key": "application", "isMatch": true, "originalHash": "a1b2...", "currentHash": "a1b2..." },
      { "key": "assignment", "isMatch": true, "originalHash": "b2c3...", "currentHash": "b2c3..." },
      { "key": "inspection", "isMatch": true, "originalHash": "c3d4...", "currentHash": "c3d4..." },
      { "key": "measurements", "isMatch": true, "originalHash": "d4e5...", "currentHash": "d4e5..." },
      { "key": "evidence", "isMatch": true, "originalHash": "e5f6...", "currentHash": "e5f6..." },
      { "key": "locationTime", "isMatch": true, "originalHash": "f607...", "currentHash": "f607..." },
      { "key": "decision", "isMatch": true, "originalHash": "0718...", "currentHash": "0718..." },
      { "key": "approval", "isMatch": true, "originalHash": "1829...", "currentHash": "1829..." },
      { "key": "certificate", "isMatch": true, "originalHash": "4445...", "currentHash": "4445..." }
    ],
    "verifiedAt": "2026-08-31T22:45:00.000Z"
  }
  ```
* **Response `200 OK` — When Mismatch Is Detected (Neutral Diagnostic Response):**
  ```json
  {
    "chainId": "CHAIN-2026-000001",
    "isMatch": false,
    "status": "MISMATCH",
    "originalFinalHash": "4445cd2a9a8008e1e34bffb9cf67c85160cab58a49089abddef85d1f4015d5fc",
    "currentFinalHash": "7c89f012e34a5b6c7d8e9f01234567890abcdef1234567890abcdef12345678",
    "stageComparisons": [
      { "key": "application", "isMatch": true, "originalHash": "a1b2...", "currentHash": "a1b2..." },
      { "key": "assignment", "isMatch": true, "originalHash": "b2c3...", "currentHash": "b2c3..." },
      { "key": "inspection", "isMatch": true, "originalHash": "c3d4...", "currentHash": "c3d4..." },
      { "key": "measurements", "isMatch": false, "originalHash": "d4e5...", "currentHash": "99aa..." },
      { "key": "evidence", "isMatch": false, "originalHash": "e5f6...", "currentHash": "88bb..." },
      { "key": "locationTime", "isMatch": false, "originalHash": "f607...", "currentHash": "77cc..." },
      { "key": "decision", "isMatch": false, "originalHash": "0718...", "currentHash": "66dd..." },
      { "key": "approval", "isMatch": false, "originalHash": "1829...", "currentHash": "55ee..." },
      { "key": "certificate", "isMatch": false, "originalHash": "4445...", "currentHash": "44ff..." }
    ],
    "verifiedAt": "2026-08-31T22:45:00.000Z"
  }
  ```

---

## 8. Database DDL for Post-Admin Modules (PostgreSQL Schema)

```sql
-- 1. Inspection Checklists (Physical inspection criteria)
CREATE TABLE inspection_checklists (
    id VARCHAR(64) PRIMARY KEY,
    inspection_id VARCHAR(64) REFERENCES inspections(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    verdict VARCHAR(16) NOT NULL CHECK (verdict IN ('PASS', 'FAIL', 'N/A'))
);

-- 2. Inspection Numerical Readings & Error Tolerances
CREATE TABLE inspection_measurements (
    id VARCHAR(64) PRIMARY KEY,
    inspection_id VARCHAR(64) REFERENCES inspections(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    standard_value NUMERIC(12, 4) NOT NULL,
    observed_value NUMERIC(12, 4) NOT NULL,
    error NUMERIC(12, 4) NOT NULL,
    verdict VARCHAR(16) NOT NULL CHECK (verdict IN ('PASS', 'FAIL'))
);

-- 3. Photo & Stamping Evidence
CREATE TABLE evidence_photos (
    id VARCHAR(64) PRIMARY KEY,
    inspection_id VARCHAR(64) REFERENCES inspections(id) ON DELETE CASCADE,
    label VARCHAR(128) NOT NULL,
    file_url TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL
);

-- 4. Digital Verification Certificates
CREATE TABLE certificates (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES applications(id),
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Valid', -- Valid, Expired, Revoked
    issuing_officer_id VARCHAR(64) REFERENCES users(id),
    blockchain_hash VARCHAR(128) NOT NULL,
    tx_id VARCHAR(128),
    ledger_network VARCHAR(128) DEFAULT 'Ethereum Sepolia Testnet',
    evidence_chain_id VARCHAR(64),
    revocation_reason TEXT,
    revoked_at TIMESTAMPTZ
);

-- 5. Tamper-Evident Evidence Chains & Sealed Hashes
CREATE TABLE evidence_chains (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES applications(id),
    inspection_id VARCHAR(64) REFERENCES inspections(id),
    certificate_id VARCHAR(64) REFERENCES certificates(id),
    final_hash VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED',
    stages_payload JSONB NOT NULL,
    blockchain_tx VARCHAR(128),
    blockchain_block VARCHAR(64),
    anchored_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Offline Synchronization Queue & Conflict Resolution
CREATE TABLE sync_operations (
    operation_id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    officer_id VARCHAR(64) REFERENCES users(id),
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
    integrity_hash VARCHAR(64) NOT NULL,
    local_version INT NOT NULL,
    base_server_version INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, CONFLICT, REJECTED
    payload JSONB NOT NULL
);

-- Indexes for Fast Lookups
CREATE INDEX idx_cert_app ON certificates(application_id);
CREATE INDEX idx_chain_app ON evidence_chains(application_id);
CREATE INDEX idx_chain_cert ON evidence_chains(certificate_id);
CREATE INDEX idx_sync_device ON sync_operations(device_id, server_sync_timestamp);
```
