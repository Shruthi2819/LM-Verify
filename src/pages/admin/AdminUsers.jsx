import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Users, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // 'status' | 'role'
  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingRole, setPendingRole] = useState("");
  const [roleReason, setRoleReason] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ search, role, status });
      setUsers(data.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    setPage(1); // Reset page on filter change
  }, [search, role, status]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.ADMIN_USER_DETAIL, { userId: row.id }));
  };

  const handleStatusChangeTrigger = (user, newStatus) => {
    setSelectedUser(user);
    setPendingStatus(newStatus);
    setConfirmAction("status");
    setModalOpen(true);
  };

  const handleRoleChangeTrigger = (user, newRole) => {
    // Self-lockout warning check
    const storedUser = localStorage.getItem("lmv_user");
    if (storedUser) {
      const currUser = JSON.parse(storedUser);
      if (currUser.id === user.id && newRole !== "admin") {
        toast.error("Security Warning: You cannot remove administrative access from your own active account.");
        return;
      }
    }

    setSelectedUser(user);
    setPendingRole(newRole);
    setConfirmAction("role");
    setRoleReason("");
    setModalOpen(true);
  };

  const executeStatusChange = async () => {
    setActionLoading(true);
    try {
      await adminService.updateUserStatus(selectedUser.id, pendingStatus);
      toast.success(`User successfully updated to ${pendingStatus}`);
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update user status.");
    } finally {
      setActionLoading(false);
    }
  };

  const executeRoleChange = async () => {
    if (!roleReason.trim()) {
      toast.error("Please enter a justification reason for modifying user roles.");
      return;
    }
    setActionLoading(true);
    try {
      await adminService.updateUserRole(selectedUser.id, pendingRole, roleReason);
      toast.success("User role modified and audited successfully.");
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to modify user role.");
    } finally {
      setActionLoading(false);
    }
  };

  // Pagination logic
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const columns = [
    { key: "id", header: "User ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "name", header: "Name" },
    { key: "email", header: "Email Address" },
    { key: "phone", header: "Phone" },
    { key: "role", header: "Role", render: (r) => (
      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
        {r.role}
      </span>
    )},
    { key: "organisation", header: "Associated Org" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "Created", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      header: "Administrative Actions",
      render: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            value={r.status}
            onChange={(e) => handleStatusChangeTrigger(r, e.target.value)}
            className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select
            value={r.role}
            onChange={(e) => handleRoleChangeTrigger(r, e.target.value)}
            className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700"
          >
            <option value="business">Business</option>
            <option value="lmo">LMO</option>
            <option value="gatc">GATC</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Users" }]} />

      <div className="flex items-center gap-2">
        <Users className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Identity & Access Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage administrative credentials, workloads, and access control states</p>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by ID, name, email or organization..."
            />
          </div>
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "business", label: "Business" },
              { value: "lmo", label: "Legal Metrology Officer" },
              { value: "gatc", label: "GATC Laboratory" },
              { value: "admin", label: "Administrator" }
            ]}
            placeholder="All Roles"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Suspended", label: "Suspended" }
            ]}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      {/* Table view */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={5} cols={9} /></div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedUsers}
              onRowClick={handleRowClick}
              emptyTitle="No system users found"
              emptyDescription="Adjust your search query or filters to find registered platform accounts."
            />
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 select-none">
                <span>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, users.length)} of {users.length} users
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Access Action Confirmation Modals */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={confirmAction === "status" ? "Modify User Account status" : "Change User Role Credentials"}
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex gap-2">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold">Caution: Administrative Action Required</p>
                <p className="mt-1 leading-relaxed">
                  You are about to modify the {confirmAction === "status" ? "access status" : "role permissions"} of account **{selectedUser.name}** ({selectedUser.email}).
                </p>
              </div>
            </div>

            {confirmAction === "status" ? (
              <p className="text-slate-600">
                Are you sure you want to change this user's state from **{selectedUser.status}** to **{pendingStatus}**?
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600">
                  Changing user role from **{selectedUser.role}** to **{pendingRole}** alters their dashboard capabilities immediately.
                </p>
                <div className="space-y-1">
                  <label className="block font-medium text-slate-700">Justification / Reason for change *</label>
                  <textarea
                    required
                    value={roleReason}
                    onChange={(e) => setRoleReason(e.target.value)}
                    placeholder="Enter NABL or department reference reason..."
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
        )}
      </Modal>
    </div>
  );
}

export default AdminUsers;
