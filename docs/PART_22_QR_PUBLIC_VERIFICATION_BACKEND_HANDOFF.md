# Backend API Handoff Specification
## Part 22 — QR Code & Public Certificate Authenticity Verification

**Project**: SIH Online Legal Metrology Verification System  
**Module**: Part 22 — QR Code Generation & Public Certificate Authenticity Verification  
**Audience**: Backend / API Engineering Team, System Architects, Security Auditors  
**Date**: August 31, 2026  
**Status**: `FRONTEND COMPLETE` | `BACKEND API CONTRACT SPECIFIED`

---

## 1. Module Objective & Scope

The purpose of **Part 22** is to enable **any citizen, consumer, enforcement inspector, or business** to verify the legal authenticity, validity term, evidence chain integrity, and blockchain anchoring of an issued Legal Metrology Digital Certificate simply by scanning the physical or digital QR code on the certificate sheet or visiting a public verification URL.

### Key Constraints & Design Principles:
1. **Zero-Login Public Access**: Verification MUST work without requiring an account, login session, or authentication tokens.
2. **Strict Privacy by Design**: The public gateway MUST expose only authorized public-safe specifications (Certificate ID, status, instrument category, capacity, serial number, validity term, issuing authority, and cryptographic ledger hash). It MUST NEVER expose private business phone numbers, personal emails, owner PAN/GSTIN, residential addresses, internal officer user IDs, private notes, or authentication credentials.
3. **Authoritative Server-Side Verification**: The backend MUST remain the sole source of truth for record existence, validity status, and cryptographic evidence hash verification.
4. **Non-Accusatory Integrity Warnings**: If cryptographic verification detects data discrepancies, the system MUST report a neutral diagnostic warning (*"The certificate or associated evidence may have been modified after issuance. Please contact the Department of Legal Metrology for further verification."*) rather than accusing any officer or party of fraud.
5. **No Regressions**: MUST NOT alter existing Certificate generation (Part 17), Tamper-Evident Chain (Part 18), or Predictive Compliance (Part 21) logic.

---

## 2. Existing Frontend Implementation & Audit Record

The frontend implementation of Part 22 is complete and verified in the codebase. The following table records the exact components, routes, and services involved:

| Layer / Component | File Path | Existing Route / Export | Responsibility & Role |
| :--- | :--- | :--- | :--- |
| **Public Gateway Page** | [`src/pages/public/VerifyCertificate.jsx`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/pages/public/VerifyCertificate.jsx) | `/verify`, `/verify/:certificateId`, `/verify/certificate/:certificateId` | Zero-login verification portal with 4 trust indicators, search bar, SIH demo scenarios, neutral warning banners, and QR download. |
| **QR Code Component** | [`src/components/common/QRCodeCanvas.jsx`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/components/common/QRCodeCanvas.jsx) | `QRCodeCanvas` | Offline vector/PNG QR generator using `qrcode` library (Medium error correction, high contrast `#0f172a`, quiet zone). |
| **Certificate Preview** | [`src/components/common/CertificatePreview.jsx`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/components/common/CertificatePreview.jsx) | `CertificatePreview` | Official statutory certificate sheet with embedded `<QRCodeCanvas />`, SHA-256 fingerprint, and print stylesheet. |
| **Certificate Detail Page** | [`src/pages/business/CertificateDetail.jsx`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/pages/business/CertificateDetail.jsx) | `/business/certificates/:certificateId` | Authenticated certificate view with actions: Copy Public Link, Public Gateway Navigation, Print, PDF Download, Verify Integrity. |
| **Public Service Layer** | [`src/services/publicVerificationService.js`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/services/publicVerificationService.js) | `publicVerificationService.verifyCertificate(id)` | Calls `GET /api/public/verify/{certificateId}` with fallback mock data, PII sanitizer, and integrity check. |
| **App Configuration** | [`src/config/appConfig.js`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/config/appConfig.js) | `getPublicVerificationUrl(certificateId)` | Resolves `VITE_PUBLIC_APP_URL` or `window.location.origin` to construct canonical public verification URLs. |
| **Route Configuration** | [`src/config/routes.js`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/config/routes.js) & [`src/routes/AppRoutes.jsx`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/routes/AppRoutes.jsx) | `ROUTES.VERIFY`, `ROUTES.VERIFY_CERT`, `ROUTES.VERIFY_CERT_FULL` | Unauthenticated public routes mapped under `PublicLayout`. |
| **Cryptographic Engine** | [`src/utils/crypto.js`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/utils/crypto.js) | `computeChainedEvidenceHashes`, `compareEvidenceChainIntegrity` | 9-stage SHA-256 canonical hash chaining ($H_1 \to H_9$). |

---

## 3. End-to-End Public Verification Architecture

```
+-----------------------------------------------------------------------------------+
|                            PHYSICAL / DIGITAL ARTIFACT                            |
|  [Official Legal Metrology Certificate Sheet / Stamping Sticker / PDF / Screen]   |
|                                                                                   |
|                   +--------------------------------------------+                  |
|                   | [ QR CODE ] (Offline Vector Data URL)      |                  |
|                   | https://<PUBLIC_APP_URL>/verify/certificate/|                  |
|                   | LM-CERT-2026-201132                        |                  |
|                   +--------------------------------------------+                  |
+-----------------------------------------+-----------------------------------------+
                                          |
                        User Scans with Camera / Opens Link
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     FRONTEND: PUBLIC VERIFICATION GATEWAY                         |
|                    Route: /verify/certificate/:certificateId                      |
|                  (Unauthenticated — Zero Account / Token Required)                 |
+-----------------------------------------+-----------------------------------------+
                                          |
             HTTP GET /api/v1/public/certificates/{certificate_id}/verify
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       BACKEND: AUTHORITATIVE VERIFIER                             |
|  1. Find Certificate record in Database by ID                                     |
|  2. Check Validity Term (Issue Date, Expiry Date, Revocation Flag)                |
|  3. Recalculate 9-Stage Evidence Chain Hash: H_final = SHA256(H_8 || H_cert)      |
|  4. Compare Recalculated Hash == Stored Sealed Hash                               |
|  5. Query Blockchain Ledger Anchoring Record (Tx Hash, Block #, Network)          |
|  6. Filter & Sanitize Private PII (Exclude phone, email, PAN, GSTIN, notes)       |
|  7. Return Unified Public-Safe Response (HTTP 200 / 404 / 422)                    |
+-----------------------------------------+-----------------------------------------+
                                          |
                           JSON Public-Safe Payload
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     FRONTEND: 4-FACTOR TRUST DISPLAY                              |
|                                                                                   |
|  [1. Authenticity: AUTHENTIC / NOT FOUND]    [2. Validity: VALID / EXPIRED / REVOKED]
|  [3. Evidence Integrity: VERIFIED / MISMATCH] [4. Immutable Ledger: ANCHORED]      |
|                                                                                   |
|  * If MISMATCH: Display Neutral "Integrity Warning" Banner                        |
|  * Display Public Specifications: Instrument, Capacity, Serial #, Authority       |
+-----------------------------------------------------------------------------------+
```

---

## 4. Backend API Contract Specification

> [!IMPORTANT]
> **Status**: `BACKEND API REQUIRED — NOT CURRENTLY AVAILABLE IN BACKEND`  
> The frontend currently calls `GET /api/public/verify/{certificateId}` and falls back to deterministic mock verification in development (`VITE_USE_MOCK_DATA=true`). The backend engineering team must implement the following proposed REST endpoint.

### Proposed Endpoint Definition

- **Route**: `GET /api/v1/public/certificates/{certificate_id}/verify`  
  *(Also alias `GET /api/public/verify/{certificate_id}` for backward compatibility)*
- **HTTP Method**: `GET`
- **Authentication**: **None** (Public Unauthenticated Endpoint). Do not attach JWT or require session cookies.
- **Rate Limiting**: Recommended `60 requests / minute / IP` (Return `HTTP 429 Too Many Requests` on abuse).
- **CORS**: `Access-Control-Allow-Origin: *` or configured frontend origins.

### Request Parameters

| Parameter | Location | Type | Required | Description / Example |
| :--- | :--- | :--- | :---: | :--- |
| `certificate_id` | Path | `string` | **Yes** | Alphanumeric Certificate ID (e.g. `LM-CERT-2026-201132` or `CERT-2026-000007`). Case-insensitive. |

---

### Response Schemas

#### 1. Success Response — Valid & Authentic Certificate (`HTTP 200 OK`)

```json
{
  "valid": true,
  "status": "VERIFIED",
  "certificate": {
    "id": "LM-CERT-2026-201132",
    "status": "Valid",
    "instrumentName": "Digital Weighing Scale",
    "instrumentType": "Digital Weighing Scale",
    "manufacturer": "Mettler Toledo India Pvt. Ltd.",
    "model": "IND231-HD",
    "serialNumber": "MT-2024-AB1234",
    "capacity": "150 kg",
    "businessName": "Acme Weighing Solutions Pvt. Ltd.",
    "issuedDate": "2026-01-15",
    "expiryDate": "2027-01-14",
    "issuingOfficer": "Off. Priya Sharma",
    "designation": "Legal Metrology Officer, Pune East",
    "department": "Department of Legal Metrology, Government of Maharashtra",
    "verificationResult": "PASS",
    "blockchainHash": "3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f99887766554433221100aabb",
    "txId": "0xabc123def456789abcdef123456789abcdef0000",
    "evidenceChainId": "CHAIN-2026-000041"
  },
  "integrity": {
    "status": "VERIFIED",
    "isMatch": true,
    "chainId": "CHAIN-2026-000041",
    "finalHash": "3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f99887766554433221100aabb",
    "recalculatedHash": "3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f99887766554433221100aabb"
  },
  "blockchain": {
    "status": "VERIFIED",
    "network": "Ethereum Sepolia Testnet / Immutable Ledger",
    "txReference": "0xabc123def456789abcdef123456789abcdef0000",
    "blockNumber": "5849201",
    "anchoredAt": "2026-01-15T11:30:00.000Z"
  },
  "verifiedAt": "2026-08-31T23:30:00.000Z"
}
```

#### 2. Success Response — Expired Certificate (`HTTP 200 OK`)
*Note: The record is authentic, but the legal validity has lapsed.*

```json
{
  "valid": true,
  "status": "VERIFIED",
  "certificate": {
    "id": "CERT-2025-000021",
    "status": "Expired",
    "instrumentName": "Water Flow Meter",
    "instrumentType": "Water Flow Meter",
    "manufacturer": "Siemens Flowtech",
    "model": "MAG 5100W",
    "serialNumber": "SI-2024-EF3456",
    "capacity": "50 m³/h",
    "businessName": "Acme Weighing Solutions Pvt. Ltd.",
    "issuedDate": "2024-07-15",
    "expiryDate": "2025-07-14",
    "issuingOfficer": "Off. Priya Sharma",
    "designation": "Legal Metrology Officer, Pune East",
    "department": "Department of Legal Metrology, Government of Maharashtra",
    "verificationResult": "PASS",
    "blockchainHash": "1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c11223344556677889900aabb",
    "txId": "0x999999abc123789abcdef123456789abcdef9999",
    "evidenceChainId": "CHAIN-2025-000021"
  },
  "integrity": {
    "status": "VERIFIED",
    "isMatch": true,
    "chainId": "CHAIN-2025-000021",
    "finalHash": "1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c11223344556677889900aabb"
  },
  "blockchain": {
    "status": "VERIFIED",
    "network": "Ethereum Sepolia Testnet / Immutable Ledger",
    "txReference": "0x999999abc123789abcdef123456789abcdef9999",
    "blockNumber": "5210940",
    "anchoredAt": "2024-07-15T09:15:00.000Z"
  },
  "verifiedAt": "2026-08-31T23:30:00.000Z"
}
```

#### 3. Success Response — Revoked Certificate (`HTTP 200 OK`)

```json
{
  "valid": true,
  "status": "VERIFIED",
  "certificate": {
    "id": "CERT-2025-000019",
    "status": "Revoked",
    "instrumentName": "Commercial Counter Scale",
    "instrumentType": "Counter Scale",
    "manufacturer": "Essae Teraoka Ltd.",
    "model": "DS-252",
    "serialNumber": "CS-2024-GH7890",
    "capacity": "30 kg",
    "businessName": "Acme Weighing Solutions Pvt. Ltd.",
    "issuedDate": "2024-05-10",
    "expiryDate": "2025-05-09",
    "issuingOfficer": "Off. Priya Sharma",
    "designation": "Legal Metrology Officer, Pune East",
    "department": "Department of Legal Metrology, Government of Maharashtra",
    "verificationResult": "PASS",
    "blockchainHash": "8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d11223344556677889900aabb",
    "txId": "0x777777abc123789abcdef123456789abcdef7777",
    "evidenceChainId": "CHAIN-2025-000019"
  },
  "integrity": {
    "status": "VERIFIED",
    "isMatch": true,
    "chainId": "CHAIN-2025-000019"
  },
  "blockchain": {
    "status": "VERIFIED",
    "network": "Ethereum Sepolia Testnet",
    "txReference": "0x777777abc123789abcdef123456789abcdef7777"
  },
  "verifiedAt": "2026-08-31T23:30:00.000Z"
}
```

#### 4. Success Response — Integrity Mismatch Detected (`HTTP 200 OK`)
*Note: Returns 200 OK with `integrity.status = "MISMATCH"` and `isMatch = false` so the frontend can render the neutral warning banner.*

```json
{
  "valid": true,
  "status": "VERIFIED",
  "certificate": {
    "id": "LM-CERT-2026-201132",
    "status": "Valid",
    "instrumentName": "Digital Weighing Scale",
    "instrumentType": "Digital Weighing Scale",
    "serialNumber": "MT-2024-AB1234",
    "capacity": "150 kg",
    "businessName": "Acme Weighing Solutions Pvt. Ltd.",
    "issuedDate": "2026-01-15",
    "expiryDate": "2027-01-14",
    "issuingOfficer": "Off. Priya Sharma",
    "designation": "Legal Metrology Officer",
    "department": "Department of Legal Metrology",
    "verificationResult": "PASS",
    "blockchainHash": "3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f99887766554433221100aabb",
    "evidenceChainId": "CHAIN-2026-000041"
  },
  "integrity": {
    "status": "MISMATCH",
    "isMatch": false,
    "chainId": "CHAIN-2026-000041",
    "finalHash": "3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f99887766554433221100aabb",
    "recalculatedHash": "e9b208fa7c31d4e0821fb7a64c01d9e23871ab0192837465abcde1234567890f",
    "mismatchReason": "Current evidence payload does not match the original sealed root hash."
  },
  "blockchain": {
    "status": "VERIFIED",
    "txReference": "0xabc123def456789abcdef123456789abcdef0000"
  },
  "verifiedAt": "2026-08-31T23:30:00.000Z"
}
```

#### 5. Error Response — Certificate Not Found (`HTTP 404 Not Found` or `HTTP 200 with valid: false`)
*Note: Both schemas are supported by the frontend.*

```json
{
  "valid": false,
  "status": "NOT_FOUND",
  "certificate": null,
  "integrity": null,
  "blockchain": null,
  "message": "Certificate identification number was not found in the legal metrology registry.",
  "verifiedAt": "2026-08-31T23:30:00.000Z"
}
```

#### 6. Error Response — Rate Limit Exceeded (`HTTP 429 Too Many Requests`)

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many verification requests. Please try again in a few moments."
}
```

---

## 5. Privacy by Design: Field Exposure Policy

The backend **MUST strictly sanitize** the certificate entity before returning it in the public API response:

| Field | Classification | Include in Public Response? | Rationale |
| :--- | :---: | :---: | :--- |
| `certificate.id` | **PUBLIC** | **YES** | Essential identifier scanned from QR. |
| `certificate.status` | **PUBLIC** | **YES** | Informs consumer if device is legally valid (`Valid`, `Expired`, `Revoked`). |
| `certificate.instrumentName` | **PUBLIC** | **YES** | Instrument classification (e.g. Weighing Scale, Petrol Meter). |
| `certificate.serialNumber` | **PUBLIC** | **YES** | Allows consumer to cross-check machine nameplate. |
| `certificate.capacity` | **PUBLIC** | **YES** | Maximum approved capacity stamped on instrument. |
| `certificate.businessName` | **PUBLIC** | **YES** | Commercial establishment operating the instrument. |
| `certificate.issuedDate` | **PUBLIC** | **YES** | Stamping / verification date. |
| `certificate.expiryDate` | **PUBLIC** | **YES** | Legal re-verification deadline. |
| `certificate.issuingOfficer` | **PUBLIC** | **YES** | Official name of statutory inspector. |
| `certificate.designation` | **PUBLIC** | **YES** | Public designation (e.g. Legal Metrology Officer, Pune). |
| `certificate.department` | **PUBLIC** | **YES** | Government Department of Legal Metrology. |
| `certificate.blockchainHash` | **PUBLIC** | **YES** | Public SHA-256 fingerprint for integrity validation. |
| `certificate.txId` | **PUBLIC** | **YES** | Public transaction identifier on ledger. |
| `business.phone` | **PRIVATE** | ❌ **FORBIDDEN** | Protects business owner privacy from scrapers. |
| `business.email` | **PRIVATE** | ❌ **FORBIDDEN** | Protects business contact info from spam. |
| `business.pan` / `gstin` | **PRIVATE** | ❌ **FORBIDDEN** | Financial/tax identifiers must remain confidential. |
| `business.ownerName` / `residentialAddress` | **PRIVATE** | ❌ **FORBIDDEN** | Personal citizen PII protected under privacy laws. |
| `officer.employeeId` / `phone` / `email` | **PRIVATE** | ❌ **FORBIDDEN** | Officer personal & employee IDs protected. |
| `inspection.notes` / `internalChecklist` | **PRIVATE** | ❌ **FORBIDDEN** | Internal enforcement audit records protected. |
| `inspection.photos` (Raw blobs) | **PRIVATE** | ❌ **FORBIDDEN** | Inspection images contain internal premises details. |
| `user.password` / `passwordHash` | **SECURITY** | ❌ **FORBIDDEN** | Critical credential security. |
| `auth.jwtTokens` / `sessionCookies` | **SECURITY** | ❌ **FORBIDDEN** | Zero token leakage. |

---

## 6. Server-Side Cryptographic & Integrity Verification Workflow

When the backend receives `GET /api/v1/public/certificates/{certificate_id}/verify`, it must execute the following deterministic server-side steps:

```
[1. Lookup Certificate]
       |
       v
[2. Fetch 9 Evidence Chain Stages]
       |
       +--> 1. Application: SHA256(canonicalJson(applicationData))
       +--> 2. Document Uploads: SHA256(canonicalJson(documentHashes))
       +--> 3. Inspection Scheduled: SHA256(canonicalJson(scheduleData))
       +--> 4. Calibration Measurements: SHA256(canonicalJson(calibrations))
       +--> 5. Visual/OCR Stamping: SHA256(canonicalJson(stampInfo))
       +--> 6. Location/Time Attestation: SHA256(canonicalJson(timeOfficerAttestation))
       +--> 7. Officer Approval: SHA256(canonicalJson(decisionData))
       +--> 8. Certificate Generated: SHA256(canonicalJson(certMetadata))
       +--> 9. Blockchain Anchored: SHA256(canonicalJson(anchorPayload))
       |
       v
[3. Recalculate Chained Hashes]
       H_1 = SHA256(H_0 || Stage_1)
       H_2 = SHA256(H_1 || Stage_2)
       ...
       H_9 = SHA256(H_8 || Stage_9)
       |
       v
[4. Hash Comparison]
       Is H_9 (Recalculated) == Stored Sealed Hash?
       |
       +--- YES ---> integrity.status = "VERIFIED", isMatch = true
       |
       +--- NO  ---> integrity.status = "MISMATCH", isMatch = false
                     (Neutral Warning Triggered)
```

---

## 7. QR Code Generation & URL Configuration

### 1. Canonical Public Verification URL Format

```
https://<PUBLIC_APP_URL>/verify/certificate/<CERTIFICATE_ID>
```

- **Production Example**: `https://app.lmverify.gov.in/verify/certificate/LM-CERT-2026-201132`
- **Development Example**: `http://localhost:5175/verify/certificate/LM-CERT-2026-201132`
- **LAN Mobile Testing Example**: `http://192.168.1.15:5175/verify/certificate/LM-CERT-2026-201132`

### 2. Frontend Configuration Variable
The frontend reads the base URL from the environment variable:
```env
VITE_PUBLIC_APP_URL=https://app.lmverify.gov.in
```
- In [`src/config/appConfig.js`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/config/appConfig.js), `getPublicVerificationUrl(certificateId)` automatically falls back to `window.location.origin` if `VITE_PUBLIC_APP_URL` is undefined.
- **Never Hardcode `localhost`**: In production deployments, `VITE_PUBLIC_APP_URL` must be set to the live public domain so QR codes printed on physical certificates resolve correctly when scanned by mobile cameras.

---

## 8. Frontend ↔ Backend Integration Contract Matrix

| Frontend Field / Property | Expected Backend Response Key | Type | Description |
| :--- | :--- | :---: | :--- |
| `result.valid` | `valid` | `boolean` | `true` if certificate found, `false` if not found / invalid. |
| `result.status` | `status` | `string` | `"VERIFIED"` or `"NOT_FOUND"`. |
| `result.certificate.id` | `certificate.id` | `string` | Unique Certificate ID (e.g. `LM-CERT-2026-201132`). |
| `result.certificate.status` | `certificate.status` | `string` | Statutory validity: `"Valid"`, `"Expired"`, `"Revoked"`. |
| `result.certificate.instrumentName` | `certificate.instrumentName` | `string` | Instrument category name. |
| `result.certificate.serialNumber` | `certificate.serialNumber` | `string` | Physical instrument serial number. |
| `result.certificate.capacity` | `certificate.capacity` | `string` | Rated instrument capacity (e.g. `150 kg`). |
| `result.certificate.businessName` | `certificate.businessName` | `string` | Operating business entity name. |
| `result.certificate.issuedDate` | `certificate.issuedDate` | `string` (ISO Date) | Verification issue date (`YYYY-MM-DD`). |
| `result.certificate.expiryDate` | `certificate.expiryDate` | `string` (ISO Date) | Legal validity expiration date (`YYYY-MM-DD`). |
| `result.certificate.issuingOfficer` | `certificate.issuingOfficer` | `string` | Name of issuing officer. |
| `result.certificate.designation` | `certificate.designation` | `string` | Officer title (e.g. Legal Metrology Officer). |
| `result.certificate.department` | `certificate.department` | `string` | Issuing government department. |
| `result.certificate.blockchainHash`| `certificate.blockchainHash` | `string` | Sealed SHA-256 integrity fingerprint. |
| `result.certificate.txId` | `certificate.txId` | `string` | Ledger transaction hash / reference. |
| `result.certificate.evidenceChainId`| `certificate.evidenceChainId` | `string` | Evidence chain tracking identifier. |
| `result.integrity.status` | `integrity.status` | `string` | `"VERIFIED"`, `"MISMATCH"`, or `"UNAVAILABLE"`. |
| `result.integrity.isMatch` | `integrity.isMatch` | `boolean` | `true` if cryptographic hashes match, `false` otherwise. |
| `result.blockchain.status` | `blockchain.status` | `string` | `"VERIFIED"`, `"NOT_ANCHORED"`, or `"UNAVAILABLE"`. |
| `result.blockchain.network` | `blockchain.network` | `string` | Ledger network name (e.g. `Ethereum Sepolia Testnet`). |
| `result.blockchain.txReference` | `blockchain.txReference` | `string` | Transaction hash on immutable ledger. |
| `result.verifiedAt` | `verifiedAt` | `string` (ISO Date) | Server timestamp when verification was executed. |

---

## 9. Comprehensive Testing & Verification Plan

### Test Scenarios to Validate Before SIH Demonstration

| # | Scenario | Test Input / Action | Expected Backend Result | Expected Frontend UI Presentation |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Active Authentic Scale** | `GET /verify/certificate/CERT-2026-000007` | `200 OK`, `valid: true`, `status: "Valid"`, `integrity: "VERIFIED"`, `blockchain: "VERIFIED"` | `✓ AUTHENTIC`, `VALID`, `Evidence Chain: VERIFIED`, `Ledger: ANCHORED` |
| **2** | **Expired Certificate** | `GET /verify/certificate/CERT-2025-000021` | `200 OK`, `valid: true`, `status: "Expired"`, `integrity: "VERIFIED"` | `✓ AUTHENTIC RECORD`, `⚠ EXPIRED` banner (not fake) |
| **3** | **Revoked Certificate** | `GET /verify/certificate/CERT-2025-000019` | `200 OK`, `valid: true`, `status: "Revoked"` | `✓ AUTHENTIC RECORD`, `✕ CERTIFICATE REVOKED` banner |
| **4** | **Counterfeit / Non-Existent ID** | `GET /verify/certificate/CERT-FAKE-999` | `404 Not Found` or `valid: false, status: "NOT_FOUND"` | `✕ CERTIFICATE NOT FOUND` with counterfeit advisory |
| **5** | **Evidence Tampering Detection** | Certificate with altered calibration data | `200 OK`, `valid: true`, `integrity: { isMatch: false, status: "MISMATCH" }` | `⚠ INTEGRITY WARNING` banner with neutral wording |
| **6** | **Privacy Audit (No Leaks)** | Inspect JSON response payload | Payload has NO `phone`, `email`, `pan`, `gstin`, `password`, `tokens` | User sees clean specifications with zero PII |
| **7** | **Zero-Auth Accessibility** | Query endpoint without `Authorization` header | `200 OK` (No 401 Unauthorized redirect) | Opens directly in logged-out private browser window |
| **8** | **Mobile Phone Camera Scan** | Scan physical/screen QR with phone camera | Resolves to LAN/Domain verification URL | Mobile verification page opens and loads certificate |
| **9** | **PDF Printout QR Scan** | Download PDF -> Print -> Scan printed QR | Scans cleanly with standard phone camera | Opens public verification gateway for that certificate |

---

## 10. Summary of Gaps & Action Items

### Current Implementation Status

- **Frontend Status**: `100% COMPLETE`
  - Zero-auth public routes registered at `/verify`, `/verify/:certificateId`, `/verify/certificate/:certificateId`.
  - Machine-readable vector QR generator implemented via `qrcode` in [`QRCodeCanvas.jsx`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/components/common/QRCodeCanvas.jsx).
  - 4-factor trust indicator matrix (Authenticity, Validity, Integrity, Ledger).
  - Strict privacy-by-design filtering.
  - Neutral non-accusatory integrity warnings.
  - End-to-end unit and build tests passed with 0 errors.

- **Backend Status**: `PENDING IMPLEMENTATION`
  - Dedicated public verification route `GET /api/v1/public/certificates/{certificate_id}/verify` needs to be implemented.
  - Server-side SHA-256 9-stage hash recomputation needs to be connected to the database.
  - Privacy sanitization filter must be enforced on backend responses.

### Action Items for Backend Engineering Team:
1. Create unauthenticated route `GET /api/v1/public/certificates/{certificate_id}/verify` (and alias `/api/public/verify/{certificate_id}`).
2. Implement server-side lookup querying the authoritative Certificate table.
3. Compute 9-stage evidence chain hash and compare with the stored root hash.
4. Apply the field exposure filter: strictly return only public-safe fields (exclude phone, email, PAN, GSTIN, passwords, private notes).
5. Add rate-limiting middleware (`60 req/min/IP`) to protect against automated scrapers.
6. Configure CORS to allow public GET requests from frontend origins.
