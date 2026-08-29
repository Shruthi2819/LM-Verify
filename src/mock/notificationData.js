/**
 * Mock notification data.
 */

export const mockNotifications = [
  {
    id: "notif-001",
    title: "Application Under Review",
    message: "Your application APP-2026-00043 for 'Digital Weighing Scale (150 kg)' is now under review by an LMO.",
    type: "info", // info, success, warning, error
    createdAt: "2026-08-21T10:30:00Z",
    read: false,
  },
  {
    id: "notif-002",
    title: "Inspection Scheduled",
    message: "An inspection is scheduled for Platform Scale on 2026-08-30 by Off. Priya Sharma.",
    type: "info",
    createdAt: "2026-08-22T14:15:00Z",
    read: false,
  },
  {
    id: "notif-003",
    title: "Certificate Issued",
    message: "Certificate CERT-2026-000004 has been generated for Petrol Pump Meter and successfully anchored on blockchain.",
    type: "success",
    createdAt: "2026-02-22T09:00:00Z",
    read: true,
  },
  {
    id: "notif-004",
    title: "Certificate Expiring Soon",
    message: "Your verification certificate CERT-2026-000007 for Digital Weighing Scale will expire in 18 days (2026-09-15).",
    type: "warning",
    createdAt: "2026-08-28T06:00:00Z",
    read: false,
  },
  {
    id: "notif-005",
    title: "Verification Application Rejected",
    message: "Your application APP-2026-00030 was rejected. Reason: Incorrect type approval certificate uploaded.",
    type: "error",
    createdAt: "2026-07-28T16:45:00Z",
    read: true,
  }
];
