import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gatcService } from "../../services/gatcService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatusBadge from "../../components/feedback/StatusBadge";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await gatcService.getReports({ search, status, result });
      setReports(response.items || []);
    } catch (err) {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    setCurrentPage(1); // Reset page on filter change
  }, [search, status, result]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.GATC_REPORT_DETAIL, { reportId: row.id }));
  };

  const columns = [
    { key: "id", header: "Report ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "applicationId", header: "Application ID", render: (r) => <span className="font-mono text-xs text-slate-500">{r.applicationId}</span> },
    { key: "businessName", header: "Business" },
    { key: "instrumentName", header: "Instrument" },
    { key: "testDate", header: "Test Date", render: (r) => formatDate(r.testDate) },
    { key: "result", header: "Result", render: (r) => <StatusBadge status={r.result} /> },
    { key: "risk", header: "Risk", render: (r) => (
      <span className={["text-[10px] font-bold px-1.5 py-0.5 rounded border", r.risk === "LOW" ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"].join(" ")}>
        {r.risk}
      </span>
    )},
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2 cursor-pointer"
            onClick={() => navigate(buildPath(ROUTES.GATC_REPORT_DETAIL, { reportId: r.id }))}
          >
            Open Detail
          </Button>
        </div>
      )
    }
  ];

  // Paginated chunk calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.GATC_DASHBOARD }, { label: "Reports" }]} />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Calibration Test Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Archive list of submitted and finalized laboratory stamp reports</p>
      </div>

      {/* Filter panel */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by Report ID, App ID, or serial..."
            />
          </div>
          <Select
            label="Result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            options={[
              { value: "PASS", label: "PASS" },
              { value: "FAIL", label: "FAIL" }
            ]}
            placeholder="All Results"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "SUBMITTED", label: "SUBMITTED" },
              { value: "APPROVED", label: "APPROVED" }
            ]}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      {/* Table grid */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={5} cols={8} /></div>
        ) : (
          <div className="flex flex-col">
            <Table
              columns={columns}
              data={currentItems}
              onRowClick={handleRowClick}
              emptyTitle="No reports found"
              emptyDescription="Reports submitted to the district registry will appear here."
            />
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 select-none bg-white">
                <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, reports.length)} of {reports.length} entries</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-16"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={["h-8 w-8 rounded text-xs border font-medium transition-colors cursor-pointer", currentPage === i + 1 ? "bg-blue-600 border-blue-600 text-white" : "bg-white text-slate-600 border-slate-200 hover:border-slate-350"].join(" ")}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-16"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Reports;
