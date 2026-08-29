import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES, ROLES } from "../config/routes";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import BusinessLayout from "../layouts/BusinessLayout";
import LMOLayout from "../layouts/LMOLayout";
import GATCLayout from "../layouts/GATCLayout";
import AdminLayout from "../layouts/AdminLayout";

// Public pages
import Home from "../pages/public/Home";
import VerifyCertificate from "../pages/public/VerifyCertificate";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Business pages
import BusinessDashboard from "../pages/business/BusinessDashboard";
import BusinessProfile from "../pages/business/BusinessProfile";
import InstrumentList from "../pages/business/InstrumentList";
import RegisterInstrument from "../pages/business/RegisterInstrument";
import InstrumentDetail from "../pages/business/InstrumentDetail";
import EditInstrument from "../pages/business/EditInstrument";
import ApplicationList from "../pages/business/ApplicationList";
import NewApplication from "../pages/business/NewApplication";
import ApplicationDetail from "../pages/business/ApplicationDetail";
import CertificateList from "../pages/business/CertificateList";
import CertificateDetail from "../pages/business/CertificateDetail";
import Notifications from "../pages/business/Notifications";

// LMO pages
import LMODashboard from "../pages/lmo/LMODashboard";
import LMOProfile from "../pages/lmo/LMOProfile";
import LMOApplicationList from "../pages/lmo/ApplicationList";
import LMOApplicationDetail from "../pages/lmo/ApplicationDetail";
import LMOScheduleList from "../pages/lmo/ScheduleList";
import LMOInspectionDetail from "../pages/lmo/InspectionDetail";
import LMOCertificateList from "../pages/lmo/CertificateList";
import LMOInspectionList from "../pages/lmo/InspectionList";
import LMOInstrumentDetail from "../pages/lmo/InstrumentDetail";

// GATC pages
import GATCDashboard from "../pages/gatc/GATCDashboard";
import GATCProfile from "../pages/gatc/GATCProfile";
import GATCApplicationList from "../pages/gatc/GATCApplicationList";
import GATCApplicationDetail from "../pages/gatc/GATCApplicationDetail";
import GATCInspectionDetail from "../pages/gatc/GATCInspectionDetail";
import GATCCertificateList from "../pages/gatc/CertificateList";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminApplicationList from "../pages/admin/AdminApplicationList";
import AdminApplicationDetail from "../pages/admin/AdminApplicationDetail";
import AdminAssignments from "../pages/admin/AdminAssignments";
import AdminOfficers from "../pages/admin/AdminOfficers";
import AdminGATCs from "../pages/admin/AdminGATCs";
import AdminJurisdictions from "../pages/admin/AdminJurisdictions";
import AdminInspections from "../pages/admin/AdminInspections";
import AdminCertificates from "../pages/admin/AdminCertificates";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";

// Placeholder page for unimplemented modules of other roles
import PlaceholderPage from "../pages/PlaceholderPage";

// Error pages
import NotFound from "../pages/errors/NotFound";
import Unauthorized from "../pages/errors/Unauthorized";

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.VERIFY} element={<VerifyCertificate />} />
        <Route path={ROUTES.VERIFY_CERT} element={<VerifyCertificate />} />
      </Route>

      {/* ── Auth ────────────────────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      </Route>

      {/* ── Business ────────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.BUSINESS]}>
            <BusinessLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.BUSINESS_DASHBOARD} element={<BusinessDashboard />} />
        <Route path={ROUTES.BUSINESS_PROFILE} element={<BusinessProfile />} />
        
        {/* Instruments */}
        <Route path={ROUTES.BUSINESS_INSTRUMENTS} element={<InstrumentList />} />
        <Route path={ROUTES.BUSINESS_INSTRUMENTS_REGISTER} element={<RegisterInstrument />} />
        <Route path={ROUTES.BUSINESS_INSTRUMENT_DETAIL} element={<InstrumentDetail />} />
        <Route path={ROUTES.BUSINESS_INSTRUMENT_EDIT} element={<EditInstrument />} />

        {/* Applications */}
        <Route path={ROUTES.BUSINESS_APPLICATIONS} element={<ApplicationList />} />
        <Route path={ROUTES.BUSINESS_APPLICATIONS_NEW} element={<NewApplication />} />
        <Route path={ROUTES.BUSINESS_APPLICATION_DETAIL} element={<ApplicationDetail />} />

        {/* Certificates */}
        <Route path={ROUTES.BUSINESS_CERTIFICATES} element={<CertificateList />} />
        <Route path={ROUTES.BUSINESS_CERTIFICATE_DETAIL} element={<CertificateDetail />} />

        {/* Reminders & Notifications */}
        <Route path={ROUTES.BUSINESS_RENEWALS} element={<PlaceholderPage title="Renewals" description="Certificate renewal reminders will be implemented in Part 2." />} />
        <Route path={ROUTES.BUSINESS_NOTIFICATIONS} element={<Notifications />} />
      </Route>

      {/* ── LMO ─────────────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.LMO]}>
            <LMOLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.LMO_DASHBOARD} element={<LMODashboard />} />
        <Route path={ROUTES.LMO_APPLICATIONS} element={<LMOApplicationList />} />
        <Route path={ROUTES.LMO_APPLICATION_DETAIL} element={<LMOApplicationDetail />} />
        <Route path={ROUTES.LMO_SCHEDULE} element={<LMOScheduleList />} />
        <Route path={ROUTES.LMO_INSPECTIONS} element={<LMOInspectionList />} />
        <Route path={ROUTES.LMO_INSPECTION_DETAIL} element={<LMOInspectionDetail />} />
        <Route path={ROUTES.LMO_INSTRUMENT_DETAIL} element={<LMOInstrumentDetail />} />
        <Route path={ROUTES.LMO_HISTORY} element={<LMOInspectionList defaultTab="history" />} />
        <Route path={ROUTES.LMO_CERTIFICATES} element={<LMOCertificateList />} />
        <Route path={ROUTES.LMO_CERTIFICATE_DETAIL} element={<CertificateDetail />} />
        <Route path={ROUTES.LMO_NOTIFICATIONS} element={<PlaceholderPage title="Notifications" description="Notification centre will be implemented in Part 2." />} />
        <Route path={ROUTES.LMO_PROFILE} element={<LMOProfile />} />
      </Route>

      {/* ── GATC ────────────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.GATC]}>
            <GATCLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.GATC_DASHBOARD} element={<GATCDashboard />} />
        <Route path={ROUTES.GATC_APPLICATIONS} element={<GATCApplicationList />} />
        <Route path={ROUTES.GATC_APPLICATION_DETAIL} element={<GATCApplicationDetail />} />
        <Route path={ROUTES.GATC_SCHEDULE} element={<PlaceholderPage title="Testing Schedule" description="Scheduling calendar will be implemented in Part 5." />} />
        <Route path={ROUTES.GATC_INSPECTIONS} element={<PlaceholderPage title="Testing queue" description="Active lab queue will be implemented in Part 5." />} />
        <Route path={ROUTES.GATC_INSPECTION_DETAIL} element={<GATCInspectionDetail />} />
        <Route path={ROUTES.GATC_CERTIFICATES} element={<GATCCertificateList />} />
        <Route path={ROUTES.GATC_CERTIFICATE_DETAIL} element={<CertificateDetail />} />
        <Route path={ROUTES.GATC_NOTIFICATIONS} element={<PlaceholderPage title="Notifications" description="Notification centre will be implemented in Part 5." />} />
        <Route path={ROUTES.GATC_PROFILE} element={<GATCProfile />} />
      </Route>

      {/* ── Admin ───────────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_APPLICATIONS} element={<AdminApplicationList />} />
        <Route path={ROUTES.ADMIN_APPLICATION_DETAIL} element={<AdminApplicationDetail />} />
        <Route path={ROUTES.ADMIN_ASSIGNMENTS} element={<AdminAssignments />} />
        <Route path={ROUTES.ADMIN_OFFICERS} element={<AdminOfficers />} />
        <Route path={ROUTES.ADMIN_OFFICER_DETAIL} element={<PlaceholderPage title="Officer detail" description="Officer profiles registry details will be implemented in Part 5." />} />
        <Route path={ROUTES.ADMIN_GATCS} element={<AdminGATCs />} />
        <Route path={ROUTES.ADMIN_GATC_DETAIL} element={<PlaceholderPage title="Centre detail" description="Centre profiles registry details will be implemented in Part 5." />} />
        <Route path={ROUTES.ADMIN_JURISDICTIONS} element={<AdminJurisdictions />} />
        <Route path={ROUTES.ADMIN_INSPECTIONS} element={<AdminInspections />} />
        <Route path={ROUTES.ADMIN_CERTIFICATES} element={<AdminCertificates />} />
        <Route path={ROUTES.ADMIN_CERTIFICATE_DETAIL} element={<CertificateDetail />} />
        <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AdminAuditLogs />} />
        <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<PlaceholderPage title="Notifications" description="Notification warnings will be implemented in Part 5." />} />
        <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfile />} />
      </Route>

      {/* ── Error pages ─────────────────────────────────────────────── */}
      <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
