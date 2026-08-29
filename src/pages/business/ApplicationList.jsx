import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { applicationService } from "../../services/applicationService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { APPLICATION_STATUS, APPLICATION_STATUS_LABEL } from "../../utils/constants";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

function ApplicationList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationService.getApplications({
        search,
        type,
        status,
        page,
        limit
      });
      setApplications(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      toast.error("Failed to load applications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, type, status, page, limit]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.BUSINESS_APPLICATION_DETAIL, { applicationId: row.id }));
  };

  const columns = [
    { key: "id", header: "Application ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "instrumentName", header: "Instrument" },
    { key: "instrumentSerial", header: "Serial Number", render: (r) => <span className="font-mono text-xs">{r.instrumentSerial}</span> },
    { key: "type", header: "Type" },
    { key: "submittedDate", header: "Submitted", render: (r) => formatDate(r.submittedDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2"
            onClick={() => navigate(buildPath(ROUTES.BUSINESS_APPLICATION_DETAIL, { applicationId: r.id }))}
          >
            Track
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD }, { label: "Applications" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Verification Applications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track status of Metrology verifications</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => navigate(ROUTES.BUSINESS_APPLICATIONS_NEW)}
        >
          New Application
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by ID, instrument name, serial..."
            />
          </div>
          <Select
            label="Application Type"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            options={[
              { value: "verification", label: "Verification" },
              { value: "re-verification", label: "Re-verification" }
            ]}
            placeholder="All Types"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={Object.keys(APPLICATION_STATUS).map((k) => ({
              value: k,
              label: APPLICATION_STATUS_LABEL[k] || k
            }))}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      {/* Table Section */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={5} cols={6} /></div>
        ) : (
          <>
            <Table
              columns={columns}
              data={applications}
              onRowClick={handleRowClick}
              emptyTitle="No applications found"
              emptyDescription="Apply for certificate verification to list applications."
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
