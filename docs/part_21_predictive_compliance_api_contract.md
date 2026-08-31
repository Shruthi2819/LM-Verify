# Part 21 — Predictive Compliance & Expiry: Backend API Specification & Contract

**Version:** 1.0.0  
**Module:** Intelligent Predictive Compliance, Expiry Forecasting & Risk Analytics  
**Target Backend Frameworks:** Python (FastAPI / Django), Node.js (NestJS / Express), Go (Gin), Java (Spring Boot)  
**Database:** PostgreSQL 15+ / TimescaleDB with Materialized Views & Redis Cache  

---

## 1. Executive Summary & Mathematical Risk Model

The frontend does not treat certificate expiry as a static countdown (e.g., *"expires in 30 days"*). Instead, it calculates **Predictive Risk**, **Operational Safety Buffers**, and an **Explainable Recommended Start Date** using deterministic mathematical formulas.

### 1.1. Core Mathematical Formulations

$$\text{Total Required Lead Time} = T_{\text{processing}} + T_{\text{queue\_delay}} + T_{\text{safety\_buffer}}$$
$$\text{Recommended Action Date} = D_{\text{expiry}} - \text{Total Required Lead Time}$$
$$\text{Days Remaining} = \lceil (D_{\text{expiry}} - D_{\text{today}}) \rceil$$

### 1.2. Instrument Type Operational Benchmarks

| Instrument Category | Avg Processing Days ($T_{\text{processing}}$) | Avg Queue Delay ($T_{\text{queue\_delay}}$) | Safety Buffer ($T_{\text{safety\_buffer}}$) | Total Lead Time |
| :--- | :---: | :---: | :---: | :---: |
| **Flow Meters / Petrol Pumps** | 14 days | 5 days | 7 days | **26 days** |
| **Weighbridges / Heavy Scales** | 11 days | 3 days | 5 days | **19 days** |
| **Precision Balances (Jewelry/Lab)** | 8 days | 2 days | 4 days | **14 days** |
| **Commercial Counter Scales** | 10 days | 3 days | 5 days | **18 days** |

### 1.3. Risk Level Matrix & Scoring Engine (0 to 100)

| Risk Level | Score Range | Mathematical Condition | Action Required |
| :--- | :---: | :--- | :--- |
| **`CRITICAL`** | `85–100` | $\text{Days Remaining} \le 0$ OR $\text{Days Remaining} \le (T_{\text{processing}} + T_{\text{queue\_delay}})$ | Immediate legal violation risk. Submit emergency re-verification today. |
| **`HIGH`** | `70–84` | $\text{Days Remaining} \le \text{Total Required Lead Time}$ | Action overdue. Start re-verification within 48–72 hours to avoid operational lapse. |
| **`MEDIUM`** | `40–69` | $\text{Days Remaining} \le (\text{Total Required Lead Time} + 15\text{ days})$ | Approaching window. Prepare calibration documents and schedule renewal within 2 weeks. |
| **`LOW`** | `10–39` | $\text{Days Remaining} > (\text{Total Required Lead Time} + 15\text{ days})$ | Compliant. Sufficient operational window. |

### 1.4. 7-Horizon Expiry Bucketing Definition

```
[EXPIRED]      : Days Remaining <= 0
[0_7_DAYS]     : 1 <= Days Remaining <= 7
[8_15_DAYS]    : 8 <= Days Remaining <= 15
[16_30_DAYS]   : 16 <= Days Remaining <= 30
[31_60_DAYS]   : 31 <= Days Remaining <= 60
[61_90_DAYS]   : 61 <= Days Remaining <= 90
[90_PLUS_DAYS] : Days Remaining >= 91
```

---

## 2. REST Endpoints Specification

### 2.1. Get Predictive Compliance Overview (Dashboard Stats & Heatmap)
Returns aggregated statewide/jurisdictional statistics, processing benchmarks, historical delay metrics, and expiry heatmap time distribution.

* **Method:** `GET`
* **Endpoint:** `/api/compliance/overview`
* **Access Control:** `admin`, `lmo`, `business` (Scoped to owned certificates for business)
* **Query Parameters:**
  * `jurisdiction` (Optional, String) — e.g. `"Pune East Division"`
  * `instrumentType` (Optional, String) — e.g. `"Platform Scale"`
* **Response `200 OK` (`ComplianceOverviewResponse`):**
  ```json
  {
    "totalCertificates": 1248,
    "expiringWithin30Days": 82,
    "expiredCount": 3,
    "criticalCount": 7,
    "highCount": 21,
    "mediumCount": 43,
    "recommendedActionCount": 28,
    "avgProcessingTimeDays": 11.8,
    "medianProcessingDays": 10.0,
    "historicalDelayRatePercent": 14.5,
    "avgDelayDays": 3.8,
    "heatmap": [
      { "key": "EXPIRED", "label": "Expired", "count": 3, "color": "red" },
      { "key": "0_7_DAYS", "label": "0–7 Days", "count": 5, "color": "rose" },
      { "key": "8_15_DAYS", "label": "8–15 Days", "count": 12, "color": "amber" },
      { "key": "16_30_DAYS", "label": "16–30 Days", "count": 24, "color": "yellow" },
      { "key": "31_60_DAYS", "label": "31–60 Days", "count": 40, "color": "blue" },
      { "key": "61_90_DAYS", "label": "61–90 Days", "count": 75, "color": "indigo" },
      { "key": "90_PLUS_DAYS", "label": "90+ Days", "count": 1089, "color": "emerald" }
    ],
    "lastAnalyzedAt": "2026-08-31T22:50:00.000Z"
  }
  ```

---

### 2.2. Get Expiring Certificates with Predictive Risk
Returns a paginated and filterable list of monitored certificates with predictive risk scores, safety buffers, and recommended start dates.

* **Method:** `GET`
* **Endpoint:** `/api/compliance/expiring-certificates`
* **Access Control:** `admin`, `lmo`, `business`
* **Query Parameters:**
  * `search` (String) — Matches certificate ID, instrument name, serial number, or business name.
  * `risk` (String) — Filters by risk level: `CRITICAL` \| `HIGH` \| `MEDIUM` \| `LOW`.
  * `horizon` (String) — Filters by horizon bucket key: `EXPIRED` \| `0_7_DAYS` \| `8_15_DAYS` \| `16_30_DAYS` \| `31_60_DAYS` \| `61_90_DAYS` \| `90_PLUS_DAYS`.
  * `status` (String) — Filters by certificate status: `Valid` \| `Expired` \| `Revoked`.
  * `page` (Integer, default `1`)
  * `limit` (Integer, default `20`)
  * `sortBy` (String, default `"daysRemaining"`) — `daysRemaining` \| `riskScore` \| `expiryDate`
  * `sortOrder` (String, default `"ASC"`) — `ASC` \| `DESC`
* **Response `200 OK` (`ExpiringCertificatesListResponse`):**
  ```json
  {
    "items": [
      {
        "certificateId": "CERT-2026-000007",
        "instrumentId": "INS-2026-00002",
        "instrumentName": "Platform Scale",
        "serialNumber": "AWT-2023-XY5678",
        "businessName": "Acme Weighing Solutions Pvt. Ltd.",
        "issuedDate": "2025-08-15",
        "expiryDate": "2026-09-15",
        "daysRemaining": 15,
        "horizon": {
          "key": "8_15_DAYS",
          "label": "8–15 Days",
          "color": "amber"
        },
        "riskLevel": "HIGH",
        "riskScore": 78,
        "totalRequiredLeadTime": 19,
        "avgProcessingDays": 11,
        "avgDelayDays": 3,
        "safetyBufferDays": 5,
        "recommendedStartDate": "2026-08-27",
        "recommendation": "Start re-verification within 48 to 72 hours.",
        "reason": "Remaining validity (15 days) is within the recommended total lead window of 19 days (processing: 11d, typical delay: 3d, recommended buffer: 5d). Initiating now prevents last-minute operational lapse.",
        "status": "Valid"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 82,
      "totalPages": 5
    }
  }
  ```

---

### 2.3. Get Single Certificate Predictive Compliance Dossier
Returns full historical performance metrics, previous verification cycles, and detailed factor breakdowns for a specific certificate.

* **Method:** `GET`
* **Endpoint:** `/api/compliance/certificates/{certificateId}/prediction`
* **Access Control:** `admin`, `lmo`, `business`
* **Response `200 OK` (`CertificatePredictionDossier`):**
  ```json
  {
    "certificateId": "CERT-2026-000007",
    "instrumentId": "INS-2026-00002",
    "instrumentName": "Platform Scale",
    "businessName": "Acme Weighing Solutions Pvt. Ltd.",
    "issuedDate": "2025-08-15",
    "expiryDate": "2026-09-15",
    "daysRemaining": 15,
    "riskLevel": "HIGH",
    "riskScore": 78,
    "totalRequiredLeadTime": 19,
    "avgProcessingDays": 11,
    "avgDelayDays": 3,
    "safetyBufferDays": 5,
    "recommendedStartDate": "2026-08-27",
    "recommendation": "Start re-verification within 48 to 72 hours.",
    "reason": "Remaining validity (15 days) is within the recommended total lead window of 19 days (processing: 11d, typical delay: 3d, recommended buffer: 5d). Initiating now prevents last-minute operational lapse.",
    "historyCycles": [
      {
        "year": 2024,
        "result": "PASS",
        "processingDays": 9,
        "delayDays": 1,
        "officer": "Priya Sharma (LMO)",
        "completedAt": "2024-08-28"
      },
      {
        "year": 2025,
        "result": "PASS",
        "processingDays": 12,
        "delayDays": 3,
        "officer": "Priya Sharma (LMO)",
        "completedAt": "2025-08-15"
      },
      {
        "year": 2026,
        "result": "VALID",
        "processingDays": 11,
        "delayDays": 3,
        "officer": "Priya Sharma (LMO)",
        "completedAt": "2026-08-30"
      }
    ],
    "status": "Valid"
  }
  ```

---

### 2.4. Trigger Priority Renewal Notification / Reminder
Triggers an automated high/critical priority reminder to the business owner and officer queue.

* **Method:** `POST`
* **Endpoint:** `/api/compliance/certificates/{certificateId}/trigger-reminder`
* **Access Control:** `admin`, `lmo`
* **Request Schema:**
  ```json
  {
    "channel": "EMAIL_AND_SMS",
    "customNote": "Please submit your annual platform scale re-verification before September 5th."
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "notificationId": "NOTIF-2026-000841",
    "dispatchedAt": "2026-08-31T22:55:00.000Z",
    "priority": "HIGH",
    "recipientEmail": "rajesh@acmescales.in"
  }
  ```

---

## 3. PostgreSQL Database Schema (DDL)

```sql
-- 1. Historical Processing Performance Benchmarks Table
CREATE TABLE compliance_processing_benchmarks (
    id VARCHAR(64) PRIMARY KEY,
    instrument_type VARCHAR(128) NOT NULL,
    jurisdiction VARCHAR(128) NOT NULL,
    avg_processing_days NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    median_processing_days NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    avg_delay_days NUMERIC(5, 2) NOT NULL DEFAULT 3.50,
    safety_buffer_days INT NOT NULL DEFAULT 5,
    delay_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 14.50,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_type_jurisdiction UNIQUE (instrument_type, jurisdiction)
);

-- 2. Historical Instrument Verification Cycles Table
CREATE TABLE instrument_verification_history (
    id VARCHAR(64) PRIMARY KEY,
    instrument_id VARCHAR(64) REFERENCES instruments(id) ON DELETE CASCADE,
    certificate_id VARCHAR(64) REFERENCES certificates(id),
    cycle_year INT NOT NULL,
    verdict VARCHAR(16) NOT NULL CHECK (verdict IN ('PASS', 'FAIL', 'VALID', 'REVOKED')),
    processing_days INT NOT NULL,
    delay_days INT NOT NULL DEFAULT 0,
    inspecting_officer_id VARCHAR(64) REFERENCES users(id),
    completed_at DATE NOT NULL
);

-- 3. Materialized View for High-Speed Expiry Heatmap Aggregation
CREATE MATERIALIZED VIEW mv_expiry_heatmap_summary AS
SELECT
    COUNT(*) AS total_certificates,
    COUNT(*) FILTER (WHERE (c.expiry_date - CURRENT_DATE) <= 0) AS expired_count,
    COUNT(*) FILTER (WHERE (c.expiry_date - CURRENT_DATE) BETWEEN 1 AND 7) AS days_0_7_count,
    COUNT(*) FILTER (WHERE (c.expiry_date - CURRENT_DATE) BETWEEN 8 AND 15) AS days_8_15_count,
    COUNT(*) FILTER (WHERE (c.expiry_date - CURRENT_DATE) BETWEEN 16 AND 30) AS days_16_30_count,
    COUNT(*) FILTER (WHERE (c.expiry_date - CURRENT_DATE) BETWEEN 31 AND 60) AS days_31_60_count,
    COUNT(*) FILTER (WHERE (c.expiry_date - CURRENT_DATE) BETWEEN 61 AND 90) AS days_61_90_count,
    COUNT(*) FILTER (WHERE (c.expiry_date - CURRENT_DATE) > 90) AS days_90_plus_count,
    NOW() AS refreshed_at
FROM certificates c
WHERE c.status = 'Valid';

-- Periodic auto-refresh index & cron
CREATE UNIQUE INDEX idx_mv_heatmap_refreshed ON mv_expiry_heatmap_summary(refreshed_at);

-- Performance Indexes
CREATE INDEX idx_cert_expiry_date ON certificates(expiry_date);
CREATE INDEX idx_history_instrument_year ON instrument_verification_history(instrument_id, cycle_year DESC);
```

---

## 4. Backend Implementation Checklist for API Engineers

1. **Deterministic Risk Calculations**: Ensure `calculatePredictiveCompliance` formula in backend matches the frontend [`src/utils/predictiveCompliance.js`](file:///C:/Users/Shruthi/.gemini/antigravity/scratch/lm-verify/src/utils/predictiveCompliance.js).
2. **Materialized View Refresh**: Schedule a cron / Celery / pg_cron job to refresh `mv_expiry_heatmap_summary` every hour or upon new certificate issuance.
3. **Role Scoping**: Ensure `GET /api/compliance/expiring-certificates` strictly filters by `applicant_id = req.user.id` when called by a `business` role user.
4. **Pre-fill Parameter Compatibility**: Ensure `GET /api/instruments/{id}` returns all necessary fields to pre-populate `/business/applications/new` when `Renew` is clicked.
