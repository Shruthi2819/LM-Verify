# LM Verify — Part 12 GATC Workflow API Contract
## Backend Integration Handoff

This document defines the contract between the React frontend and the FastAPI backend for the Government Approved Test Centre (GATC) workflow.

---

## 1. Page-by-Page Specifications

### 1.1. GATC Dashboard
- **Page Name:** GATC Dashboard
- **Route:** `/gatc/dashboard`
- **Actor:** GATC Officer / Technician
- **Required API:** `GET /api/gatc/dashboard/stats`, `GET /api/gatc/inspections` (scheduled), `GET /api/gatc/applications` (assigned review)
- **HTTP Method:** `GET`
- **Request Parameters:** None
- **Response Structure (Stats):**
  ```json
  [
    { "label": "Assigned Applications", "value": 8, "change": "+1 today", "trend": "up" },
    { "label": "Pending Tests", "value": 3, "change": "Awaiting schedule", "trend": "neutral" }
  ]
  ```
- **Authorization:** Authenticated user with role `gatc`.

---

### 1.2. GATC Assigned Applications Listing
- **Page Name:** GATC Assigned Applications
- **Route:** `/gatc/applications`
- **Actor:** GATC Officer
- **Required API:** `GET /api/gatc/applications`
- **HTTP Method:** `GET`
- **Request Parameters (Search/Filters/Pagination):**
  - `search` (Optional string for application ID, business name, or serial number)
  - `status` (Optional string mapping to status enums)
- **Response Structure:**
  ```json
  {
    "items": [
      {
        "id": "APP-2026-00051",
        "businessName": "Sahayadri Logistics Ltd.",
        "instrumentName": "Weighbridge",
        "instrumentSerial": "WB-2024-XY990",
        "status": "UNDER_REVIEW",
        "submittedDate": "2026-08-22"
      }
    ],
    "total": 1
  }
  ```

---

### 1.3. GATC Application Details
- **Page Name:** GATC Application Details
- **Route:** `/gatc/applications/:applicationId`
- **Actor:** GATC Officer
- **Required API:**
  - `GET /api/gatc/applications/{applicationId}` (load info)
  - `POST /api/gatc/applications/{applicationId}/schedule` (schedule slot)
  - `POST /api/inspections/{testId}/start` (initialize test)
- **HTTP Method:** `GET` | `POST`
- **Request Parameters:** `applicationId` (path param), `testId` (path param)
- **Start Test API Response (200 OK):**
  ```json
  {
    "success": true,
    "status": "IN_PROGRESS",
    "startedAt": "2026-08-30T14:20:00+05:30"
  }
  ```

---

### 1.4. GATC Testing Workspace
- **Page Name:** GATC Testing Workspace
- **Route:** `/gatc/inspections/:inspectionId`
- **Actor:** GATC Technician
- **Required APIs:**
  - `GET /api/gatc/inspections/{inspectionId}` (load parameters & details)
  - `POST /api/gatc/inspections/{inspectionId}/evidence` (photo upload)
  - `POST /api/gatc/inspections/{inspectionId}/submit` (finalize submit)
- **HTTP Method:** `GET` | `POST`
- **File Upload Requirements (Evidence):**
  - Multipart/form-data. Key name: `file`.
  - Allowed extensions: `.pdf`, `.jpg`, `.jpeg`, `.png`. Max size: 10 MB.
- **Submit Request Body Payload:**
  ```json
  {
    "checklist": [
      { "id": "gcl-1", "label": "NABL reference calibration check", "value": "PASS" }
    ],
    "measurements": [
      { "id": "gm-1", "testName": "Zero Load Test", "standardValue": 0, "observedValue": 0.02, "error": 0.02, "result": "PASS" }
    ],
    "remarks": "Verified compliant with NABL calibration limits.",
    "result": "PASS",
    "photos": [],
    "aiVisionReport": {},
    "timeVerifiedMetadata": {
      "inspectionId": "TEST-2026-000109",
      "applicationId": "APP-2026-00052",
      "instrumentId": "INS-2026-00006",
      "officerName": "Technician Priya",
      "officerId": "GATC-NABL-092",
      "officerRole": "GATC",
      "serverRecordedAt": "2026-08-30T14:20:00+05:30",
      "clientCapturedAt": "2026-08-30T14:25:00+05:30"
    }
  }
  ```

---

### 1.5. GATC Test Reports Registry (History)
- **Page Name:** GATC Test Reports Registry
- **Route:** `/gatc/reports`
- **Actor:** GATC Officer
- **Required API:** `GET /api/gatc/reports`
- **HTTP Method:** `GET`
- **Request Parameters:**
  - `search` (Optional string)
  - `status` (Optional filter)
  - `result` (Optional filter)
  - `page` (Optional page index)
  - `limit` (Optional items count)

---

### 1.6. GATC Profile
- **Page Name:** GATC Profile
- **Route:** `/gatc/profile`
- **Actor:** GATC Officer
- **Required API:** `GET /api/gatc/profile`
- **HTTP Method:** `GET`
- **Accreditation Warning Logic:** If `accreditationExpiry` < `currentDate`, dashboard & detail actions are blocked and expired warning banners display.

---

## 2. Status Transition Machine Enums
- **Test / Calibration Statuses:**
  - `SCHEDULED` ➔ Assigned and scheduled slot set.
  - `IN_PROGRESS` ➔ GATC starts test workspace.
  - `COMPLETED` ➔ Calibration submitted successfully.
- **Application Statuses:**
  - `UNDER_REVIEW` ➔ `SCHEDULED` ➔ `INSPECTION_COMPLETED` ➔ `APPROVED` / `REJECTED`
