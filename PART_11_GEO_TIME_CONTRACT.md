# LM Verify — Part 11 Geo & Time Verification API Contract
## Backend Integration Handoff

This document defines the contract between the React frontend and the FastAPI backend for the Geo + Time Verified Inspection pipeline.

---

## 1. REST Endpoints

### 1.1. Log Geolocation Verification
- **Method:** `POST`
- **Endpoint:** `/api/inspections/{inspection_id}/geo-time`
- **Authorization:** JWT Token required (`Authorization: Bearer <token>`)
- **Required Role:** `LMO` or `gatc`
- **Request Parameters:**
  ```json
  {
    "expectedCoords": {
      "lat": 18.6272,
      "lng": 73.8124
    },
    "capturedCoords": {
      "lat": 18.6274,
      "lng": 73.8126
    },
    "distance": 30,
    "accuracy": 8,
    "status": "MATCH",
    "justification": "",
    "timestamp": "2026-08-30T00:10:00Z"
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Geo-time audit record logged successfully.",
    "verificationId": "GT-AUDIT-1725000000",
    "timestamp": "2026-08-30T00:10:05Z"
  }
  ```

---

## 2. Status Enums

### 2.1. Geolocation Statuses (`status`)
- `MATCH` (Calculated offset distance is <= 200 meters)
- `MISMATCH` (Calculated offset distance exceeds 200 meters - requires LMO justification text)
- `PENDING` (Not yet requested or captured)

---

## 3. Database Schema Requirements

### Entity: `GeoTimeInspectionAudit`
- `id` (PK, String/UUID)
- `inspection_id` (FK to `Inspection`, String)
- `expected_latitude` (Float)
- `expected_longitude` (Float)
- `captured_latitude` (Float)
- `captured_longitude` (Float)
- `distance_offset_meters` (Integer)
- `gps_accuracy_meters` (Integer)
- `verification_status` (Enum: MATCH, MISMATCH)
- `justification_remarks` (Text - nullable, filled if mismatch)
- `verified_by_officer` (FK to `User`, String)
- `created_at` (DateTime - server authoritative timestamp)
