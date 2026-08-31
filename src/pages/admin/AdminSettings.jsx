import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { Settings, Save, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form local state bindings
  const [systemName, setSystemName] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("");
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [nablComplianceRequired, setNablComplianceRequired] = useState(false);
  const [verificationWindowDays, setVerificationWindowDays] = useState(30);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [mfaRequired, setMfaRequired] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemSettings();
      setSettings(data);
      
      // Bind local states
      setSystemName(data.general.systemName);
      setSessionTimeout(data.general.sessionTimeout);
      setAutoAssignEnabled(data.workflow.autoAssignEnabled);
      setNablComplianceRequired(data.workflow.nablComplianceRequired);
      setVerificationWindowDays(data.workflow.verificationWindowDays);
      setEmailAlerts(data.notifications.emailAlerts);
      setSmsAlerts(data.notifications.smsAlerts);
      setMaxLoginAttempts(data.security.maxLoginAttempts);
      setMfaRequired(data.security.mfaRequired);
    } catch (err) {
      toast.error(err.message || "Failed to load system settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveTrigger = (e) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const executeSave = async () => {
    setSaving(true);
    try {
      const payload = {
        general: { systemName, environment: settings.general.environment, sessionTimeout },
        workflow: { autoAssignEnabled, nablComplianceRequired, verificationWindowDays: Number(verificationWindowDays) },
        notifications: { emailAlerts, smsAlerts, securityAlertsEnabled: settings.notifications.securityAlertsEnabled },
        security: { maxLoginAttempts: Number(maxLoginAttempts), minPasswordLength: settings.security.minPasswordLength, mfaRequired }
      };

      await adminService.updateSystemSettings(payload);
      toast.success("System configurations updated and audited successfully.");
      setModalOpen(false);
      fetchSettings();
    } catch (err) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "System Settings" }]} />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "System Settings" }]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="text-blue-700" size={24} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">System Configuration Panel</h1>
            <p className="text-sm text-slate-500 mt-0.5">Configure platform timeouts, auto-assignment rules, notification triggers, and security parameters</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveTrigger} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General & Workflow settings */}
        <div className="space-y-6">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm font-semibold text-slate-800">General settings</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              <Input
                label="System Name"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                required
              />
              <Input
                label="Session Timeout Limit"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                required
              />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Workflow Rules</h3>
            </Card.Header>
            <Card.Body className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">LMO Auto-Assignment</p>
                  <p className="text-[10px] text-slate-400">Automatically assign inspections to nearby officers</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoAssignEnabled}
                  onChange={(e) => setAutoAssignEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Accredited NABL Verifications Only</p>
                  <p className="text-[10px] text-slate-400">Force testing to be routed through GATC centres only</p>
                </div>
                <input
                  type="checkbox"
                  checked={nablComplianceRequired}
                  onChange={(e) => setNablComplianceRequired(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Input
                  label="Verification Window (Days)"
                  type="number"
                  value={verificationWindowDays}
                  onChange={(e) => setVerificationWindowDays(e.target.value)}
                  required
                />
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Security & Notification settings */}
        <div className="space-y-6">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Access & Security Settings</h3>
            </Card.Header>
            <Card.Body className="space-y-4 text-xs">
              <Input
                label="Maximum Login Attempts"
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                required
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Enforce Multi-Factor Authentication (MFA)</p>
                  <p className="text-[10px] text-slate-400">MFA validation required for LMO, GATC, and Admin</p>
                </div>
                <input
                  type="checkbox"
                  checked={mfaRequired}
                  onChange={(e) => setMfaRequired(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Notification Alerts</h3>
            </Card.Header>
            <Card.Body className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Send Email Notifications</p>
                  <p className="text-[10px] text-slate-400">Broadcast reminders for application schedules</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Send SMS Reminders</p>
                  <p className="text-[10px] text-slate-400">Broadcast SMS verifications to businesses</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </Card.Body>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" leftIcon={<Save size={16} />}>
              Save Configurations
            </Button>
          </div>
        </div>
      </form>

      {/* Save Settings Confirmation Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm System settings Change"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex gap-2">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-bold">Are you sure you want to change this workflow setting?</p>
              <p className="mt-1 leading-relaxed">
                Saving these settings will immediately update the system auto-assignment algorithms and authentication rules globally.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={executeSave}
            >
              Confirm Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminSettings;
