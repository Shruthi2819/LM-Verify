// Application-wide constants

export const APP_STATUS = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

// Application workflow statuses — matches backend enum
export const APPLICATION_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  ASSIGNED: "ASSIGNED",
  SCHEDULED: "SCHEDULED",
  INSPECTION_COMPLETED: "INSPECTION_COMPLETED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CERTIFICATE_GENERATED: "CERTIFICATE_GENERATED",
};

// Map backend enum → human-readable UI label
export const APPLICATION_STATUS_LABEL = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Officer Assigned",
  SCHEDULED: "Inspection Scheduled",
  INSPECTION_COMPLETED: "Inspection Completed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CERTIFICATE_GENERATED: "Certificate Issued",
};

// Instrument verification statuses
export const INSTRUMENT_STATUS = {
  UNVERIFIED: "Unverified",
  PENDING: "Pending",
  VERIFIED: "Verified",
  EXPIRED: "Expired",
  REJECTED: "Rejected",
};

// Certificate statuses
export const CERTIFICATE_STATUS = {
  VALID: "Valid",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export const STAKEHOLDER_TYPES = [
  { value: "business", label: "Business User" },
  { value: "lmo", label: "Legal Metrology Officer (LMO)" },
  { value: "gatc", label: "Government Approved Test Centre (GATC)" },
];

export const INSTRUMENT_TYPES = [
  "Digital Weighing Scale",
  "Platform Scale",
  "Weighbridge",
  "Petrol Pump Meter",
  "Water Flow Meter",
  "Pressure Gauge",
  "Electricity Meter",
  "Milk Meter",
  "Gas Meter",
  "Other",
];

export const INSTRUMENT_CATEGORIES = [
  "Weighing Instrument",
  "Measuring Instrument",
  "Flow Meter",
  "Pressure Instrument",
  "Electrical Instrument",
  "Other",
];

export const ACCURACY_CLASSES = ["Class I", "Class II", "Class III", "Class IIII", "Class M1", "Class M2", "Class M3"];

export const UNITS_OF_MEASUREMENT = ["kg", "g", "mg", "t", "L", "mL", "m³", "m", "kPa", "bar", "kWh", "Other"];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export const APPLICATION_TYPES = [
  { value: "verification", label: "Verification (New)" },
  { value: "re-verification", label: "Re-verification (Renewal)" },
];

export const ACCEPTED_DOC_TYPES = ".pdf,.jpg,.jpeg,.png";
export const MAX_FILE_SIZE_MB = 10;

export const PAGINATION_SIZES = [10, 25, 50, 100];

export const DATE_FORMAT = "DD MMM YYYY";
export const DATETIME_FORMAT = "DD MMM YYYY, hh:mm A";

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "lmv_token",
  USER: "lmv_user",
  THEME: "lmv_theme",
};

// Notification types
export const NOTIFICATION_TYPE = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};
