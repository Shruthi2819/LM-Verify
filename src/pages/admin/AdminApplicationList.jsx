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
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { APPLICATION_STATUS_LABEL } from "../../utils/constants";
import toast from "react-hot-toast";

function AdminApplicationList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await adminService.getApplications({ search, status, type });
      setApplications(response.items || []);
    } catch (err) {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [search, status, type]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.ADMIN_APPLICATION_DETAIL, { applicationId: row.id }));
  };

  const columns = [
    { key: "id", header: "Application ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "businessName", header: "Business Name" },
    { key: "instrumentName", header: "Instrument Type" },
    { key: "type", header: "Type" },
    { key: "submittedDate", header: "Submitted Date", render: (r) => formatDate(r.submittedDate) },
    { key: "assignedOfficer", header: "Assigned Officer/Centre", render: (r) => r.assignedOfficer || "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2"
            onClick={() => navigate(buildPath(ROUTES.ADMIN_APPLICATION_DETAIL, { applicationId: r.id }))}
          >
            Monitor
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Applications" }]} />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Verification Directory</h1>
        <p className="text-sm text-slate-500 mt-0.5">Central system directory for Legal Metrology certification files</p>
      </div>

      {/* Filter Section */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by ID, business name, serial or manufacturer..."
            />
          </div>
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "verification", label: "Verification" },
              { value: "re-verification", label: "Re-verification" }
            ]}
            placeholder="All Types"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={Object.entries(APPLICATION_STATUS_LABEL).map(([key, label]) => ({
              value: key,
              label: label
            }))}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      {/* Grid Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={6} cols={8} /></div>
        ) : (
          <Table
            columns={columns}
            data={applications}
            onRowClick={handleRowClick}
            emptyTitle="No applications found"
            emptyDescription="Verification submissions from businesses will display here."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminApplicationList;
