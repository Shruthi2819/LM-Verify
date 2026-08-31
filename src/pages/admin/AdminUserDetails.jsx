import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Modal from "../../components/common/Modal";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { User, Landmark, Mail, Phone, Calendar, Clock, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import toast from "react-hot-toast";

function AdminUserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modification modals
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'status' | 'role'
  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingRole, setPendingRole] = useState("");
  const [roleReason, setRoleReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Mock related data
  const [userApps, setUserApps] = useState([]);
  const [userAudits, setUserAudits] = useState([]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUser(userId);
      setUser(data);

      // Grab applications and audits matching this user organization / name
      const appsResp = await adminService.getApplications();
      const filteredApps = (appsResp.items || []).filter(
        (app) => app.businessName.toLowerCase() === data.organisation.toLowerCase() ||
                 (app.assignedOfficer && app.assignedOfficer.toLowerCase().includes(data.name.toLowerCase()))
      );
      setUserApps(filteredApps);

      const auditsResp = await adminService.getAuditLogs();
      const filteredAudits = (auditsResp || []).filter(
        (log) => log.actorName.toLowerCase().includes(data.name.toLowerCase())
      );
      setUserAudits(filteredAudits);
    } catch (err) {
      toast.error(err.message || "Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [userId]);

  const handleStatusChangeTrigger = (newStatus) => {
    setPendingStatus(newStatus);
    setConfirmAction("status");
    setModalOpen(true);
  };

  const handleRoleChangeTrigger = (newRole) => {
    // Self-lockout check
    const storedUser = localStorage.getItem("lmv_user");
    if (storedUser) {
      const currUser = JSON.parse(storedUser);
      if (currUser.id === user.id && newRole !== "admin") {
        toast.error("Security Warning: You cannot remove administrative access from your own active account.");
        return;
      }
    }
    setPendingRole(newRole);
    setConfirmAction("role");
    setRoleReason("");
    setModalOpen(true);
  };

  const executeStatusChange = async () => {
    setActionLoading(true);
    try {
      await adminService.updateUserStatus(user.id, pendingStatus);
      toast.success(`User updated to ${pendingStatus}`);
      setModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const executeRoleChange = async () => {
    if (!roleReason.trim()) {
      toast.error("Justification reason is required.");
      return;
    }
    setActionLoading(true);
    try {
      await adminService.updateUserRole(user.id, pendingRole, roleReason);
      toast.success("Role modified and audited successfully.");
      setModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.message || "Failed to modify role.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Users", path: ROUTES.ADMIN_USERS }, { label: "Dossier Details" }]} />
        <PanelSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 space-y-3">
        <p className="text-slate-500 font-semibold">User record not found</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN_USERS)}>
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Users", path: ROUTES.ADMIN_USERS }, { label: user.name }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <User size={20} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{user.name}</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">User ID: {user.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={user.status}
            onChange={(e) => handleStatusChangeTrigger(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select
            value={user.role}
            onChange={(e) => handleRoleChangeTrigger(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="business">Business</option>
            <option value="lmo">LMO</option>
            <option value="gatc">GATC</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Credentials info */}
        <div className="space-y-6">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Account Credentials</h3>
            </Card.Header>
            <Card.Body className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block">System Role</span>
                <span className="uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 inline-block text-[10px]">
                  {user.role}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Organization</span>
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <Landmark size={14} className="text-slate-400" /> {user.organisation}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Email Address</span>
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {user.email}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Contact Phone</span>
                <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {user.phone}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Account Status</span>
                <div className="mt-1"><StatusBadge status={user.status} /></div>
              </div>
              <div className="space-y-1 border-t border-slate-100 pt-3">
                <span className="text-slate-400 block">Register Date</span>
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" /> {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Last Active Session</span>
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" /> {new Date(user.lastLogin).toLocaleString()}
                </span>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* History timelines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applications list */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Associated Applications ({userApps.length})</h3>
            </Card.Header>
            <Card.Body className="text-xs">
              {userApps.length === 0 ? (
                <p className="text-slate-400 italic">No applications associated with this user / organization.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {userApps.map((app) => (
                    <div key={app.id} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Link to={buildPath(ROUTES.ADMIN_APPLICATION_DETAIL, { applicationId: app.id })} className="font-mono text-blue-700 hover:underline font-semibold">
                          {app.id}
                        </Link>
                        <p className="text-[10px] text-slate-500">{app.instrumentName} (Serial: {app.instrumentSerial})</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{formatDate(app.submittedDate)}</span>
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Audit Logs */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Activity Audit trail</h3>
            </Card.Header>
            <Card.Body className="text-xs">
              {userAudits.length === 0 ? (
                <p className="text-slate-400 italic">No audit records logged for this user.</p>
              ) : (
                <div className="space-y-4">
                  {userAudits.map((log) => (
                    <div key={log.id} className="flex gap-3 border-l-2 border-slate-150 pl-3 relative">
                      <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{log.metadata}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Confirmation Modals */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={confirmAction === "status" ? "Modify User Account status" : "Change User Role Credentials"}
      >
        <div className="space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex gap-2">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-bold">Caution: Administrative Action Required</p>
              <p className="mt-1 leading-relaxed">
                Modifying user credentials will affect live session authorizations immediately.
              </p>
            </div>
          </div>

          {confirmAction === "status" ? (
            <p className="text-slate-600">
              Are you sure you want to change **{user.name}**'s status from **{user.status}** to **{pendingStatus}**?
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-600">
                Are you sure you want to change **{user.name}**'s system role from **{user.role}** to **{pendingRole}**?
              </p>
              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Justification / Reason for change *</label>
                <textarea
                  required
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  placeholder="Enter detailed reason for NABL audit traceability..."
                  className="w-full border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 text-xs"
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "status" ? "danger" : "primary"}
              size="sm"
              loading={actionLoading}
              onClick={confirmAction === "status" ? executeStatusChange : executeRoleChange}
            >
              Confirm Modification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminUserDetails;
