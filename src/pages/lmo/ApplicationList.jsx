import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lmoService } from "../../services/lmoService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { APPLICATION_STATUS_LABEL } from "../../utils/constants";
import toast from "react-hot-toast";

function ApplicationList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await lmoService.getApplications({ search, status, type, page, limit });
      setApplications(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  // Reset pagination page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, type]);

  useEffect(() => {
    loadApplications();
  }, [search, status, type, page, limit]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.LMO_APPLICATION_DETAIL, { applicationId: row.id }));
  };

  const columns = [
    { key: "id", header: "Application ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "businessName", header: "Business Name" },
    { key: "instrumentName", header: "Instrument" },
    { key: "type", header: "Type" },
    { key: "submittedDate", header: "Submitted", render: (r) => formatDate(r.submittedDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2 cursor-pointer"
            onClick={() => navigate(buildPath(ROUTES.LMO_APPLICATION_DETAIL, { applicationId: r.id }))}
          >
            Review
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.LMO_DASHBOARD }, { label: "Applications" }]} />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Assigned Applications</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review and stamp Legal Metrology registration files</p>
      </div>

      {/* Filter widgets */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by ID, business name, or serial number..."
            />
          </div>
          <Select
            label="Application Type"
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
          <div className="p-5"><TableSkeleton rows={5} cols={7} /></div>
        ) : (
          <>
            <Table
              columns={columns}
              data={applications}
              onRowClick={handleRowClick}
              emptyTitle="No assigned applications found"
              emptyDescription="Try a different application ID, business name, instrument ID, or serial number."
            />
            {applications.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500">
                  Showing {Math.min(applications.length, (page - 1) * limit + 1)} to{" "}
                  {Math.min(total, page * limit)} of {total} entries
                </span>
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(total / limit)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default ApplicationList;
