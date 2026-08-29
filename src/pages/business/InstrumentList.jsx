import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Scale } from "lucide-react";
import { instrumentService } from "../../services/instrumentService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { INSTRUMENT_TYPES, INSTRUMENT_STATUS } from "../../utils/constants";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

function InstrumentList() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const response = await instrumentService.getInstruments({
        search,
        type,
        status,
        page,
        limit,
      });
      setInstruments(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      toast.error("Failed to load instruments.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, [search, type, status, page, limit]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.BUSINESS_INSTRUMENT_DETAIL, { instrumentId: row.id }));
  };

  const columns = [
    { key: "id", header: "Instrument ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "type", header: "Instrument Type" },
    { key: "manufacturer", header: "Manufacturer" },
    { key: "serialNumber", header: "Serial Number", render: (r) => <span className="font-mono text-xs">{r.serialNumber}</span> },
    { key: "capacity", header: "Capacity" },
    { key: "verificationStatus", header: "Status", render: (r) => <StatusBadge status={r.verificationStatus} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2"
            onClick={() => navigate(buildPath(ROUTES.BUSINESS_INSTRUMENT_DETAIL, { instrumentId: r.id }))}
          >
            View
          </Button>
          {r.verificationStatus !== "Pending" && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 py-0 px-2"
              onClick={() => navigate(ROUTES.BUSINESS_APPLICATIONS_NEW, { state: { prefilledInstrumentId: r.id } })}
            >
              Verify
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD }, { label: "Instruments" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Registered Instruments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage weighing & measuring devices</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => navigate(ROUTES.BUSINESS_INSTRUMENTS_REGISTER)}
        >
          Register Instrument
        </Button>
      </div>

      {/* Filters section */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by ID, serial, manufacturer, model..."
            />
          </div>
          <Select
            label="Instrument Type"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            options={INSTRUMENT_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="All Types"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={Object.values(INSTRUMENT_STATUS).map((s) => ({ value: s, label: s }))}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      {/* Table section */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={5} cols={6} /></div>
        ) : (
          <>
            <Table
              columns={columns}
              data={instruments}
              onRowClick={handleRowClick}
              emptyTitle="No instruments registered"
              emptyDescription="Register your weighing and measuring devices to manage their verification cycle."
            />
            {instruments.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500">
                  Showing {Math.min(instruments.length, (page - 1) * limit + 1)} to{" "}
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

export default InstrumentList;
