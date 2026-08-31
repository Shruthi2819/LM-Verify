# LM Verify — Part 11 Time-Verified & Traceability API Contract
## Backend Integration Handoff

This document defines the contract between the React frontend and the backend for the "Time-Verified Inspection & Evidence Traceability" pipeline. All GPS and geolocation dependencies have been removed.

---

## 1. REST Endpoints

### 1.1. Submit Inspection & Calibration Evidence
- **Method:** `POST`
- **Endpoint:** `/api/inspections/{inspection_id}/submit`
- **Authorization:** JWT Token required (`Authorization: Bearer <token>`)
- **Required Role:** `LMO` or `gatc`
- **Request Parameters:**
  ```json
  {
    "checklist": [
      { "id": "cl-1", "label": "Physical Condition check", "value": "PASS" }
    ],
    "measurements": [
      { "id": "m-1", "testName": "Zero Load Calibration", "standardValue": 0, "observedValue": 0, "error": 0, "result": "PASS" }
    ],
    "remarks": "Compliance checks completed successfully.",
    "result": "PASS",
    "photos": [],
    "aiVisionReport": {
      "comparison": {
        "serialMatch": true,
        "overallResult": "PASS"
      }
    },
    "timeVerifiedMetadata": {
      "inspectionId": "INS-2026-000321",
      "applicationId": "APP-2026-00041",
      "instrumentId": "INS-2026-00002",
      "officerName": "Priya Sharma",
      "officerId": "LMO-MH-44012",
      "officerRole": "LMO",
      "serverRecordedAt": "2026-08-30T10:21:35+05:30",
      "clientCapturedAt": "2026-08-30T10:21:35+05:30"
    }
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Inspection report and traceability audit record logged successfully.",
    "auditRecordId": "AUDIT-REC-1725000000",
    "serverRecordedAt": "2026-08-30T10:21:40+05:30"
  }
  ```

---

## 2. Event Log Schema Requirements

### Entity: `InspectionAuditTrail`
- `id` (PK, String/UUID)
- `inspection_id` (FK to `Inspection`, String)
- `application_id` (FK to `Application`, String)
- `instrument_id` (FK to `Instrument`, String)
- `actor_id` (FK to `User`, String - derived directly from server session token)
- `actor_role` (Enum: LMO, GATC)
- `event_type` (Enum: INSPECTION_STARTED, EVIDENCE_CAPTURED, AI_ANALYSIS_COMPLETED, INSPECTION_COMPLETED)
- `event_description` (String)
- `server_recorded_at` (DateTime - server authoritative timestamp)
