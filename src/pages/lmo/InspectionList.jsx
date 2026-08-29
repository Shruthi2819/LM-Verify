import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lmoService } from "../../services/lmoService";
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
import { Search, Calendar, ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";

function InspectionList({ defaultTab = "active" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(defaultTab || "active");
  
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("");

  const loadInspections = async () => {
    setLoading(true);
    try {
      // Query scheduled or completed based on active tab
      const statusParam = activeTab === "active" ? "SCHEDULED" : "COMPLETED";
      let data = await lmoService.getInspections({ status: statusParam });

      // Apply search filters locally in mock mode
      if (search) {
        const query = search.toLowerCase();
        data = data.filter(
          (i) =>
            i.id.toLowerCase().includes(query) ||
            i.applicationId.toLowerCase().includes(query) ||
            i.businessName.toLowerCase().includes(query) ||
            i.instrumentSerial.toLowerCase().includes(query)
        );
      }

      if (resultFilter) {
        data = data.filter((i) => i.result === resultFilter);
      }

      setInspections(data || []);
    } catch (err) {
      toast.error("Failed to load inspections registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
  }, [activeTab, search, resultFilter]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.LMO_INSPECTION_DETAIL, { inspectionId: row.id }));
  };

  const columns = [
    { key: "id", header: "Inspection ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "applicationId", header: "Application ID", render: (r) => (
      <span className="font-mono text-xs text-blue-700 font-semibold">{r.applicationId}</span>
    )},
    { key: "businessName", header: "Business Name" },
    { key: "instrumentName", header: "Instrument Type" },
    { key: "scheduledDate", header: "Scheduled On", render: (r) => formatDate(r.scheduledDate) },
    ...(activeTab === "history"
      ? [
          {
            key: "result",
            header: "Result Outcome",
            render: (r) => (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${r.result === "PASS" ? "bg-green-50 text-green-700 border-green-150" : "bg-red-50 text-red-700 border-red-150"}`}>
                {r.result || "PENDING"}
              </span>
            )
          }
        ]
      : [
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> }
        ]
    ),
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2 cursor-pointer"
            onClick={() => navigate(buildPath(ROUTES.LMO_INSPECTION_DETAIL, { inspectionId: r.id }))}
          >
            {activeTab === "active" ? "Inspect" : "View Report"}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.LMO_DASHBOARD }, { label: "Inspections" }]} />

      <div className="flex items-center gap-2">
        <Search className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Verification Inspections</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track active scheduled reviews and historical calibration audits</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={["py-2.5 px-4 font-semibold text-xs border-b-2 cursor-pointer", activeTab === "active" ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"].join(" ")}
          onClick={() => { setActiveTab("active"); setResultFilter(""); }}
        >
          Scheduled inspections
        </button>
        <button
          className={["py-2.5 px-4 font-semibold text-xs border-b-2 cursor-pointer", activeTab === "history" ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"].join(" ")}
          onClick={() => { setActiveTab("history"); setResultFilter(""); }}
        >
          Audit History
        </button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by Inspection ID, Application ID, or Serial number..."
            />
          </div>
          {activeTab === "history" ? (
            <Select
              label="Calibration Outcome"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              options={[
                { value: "PASS", label: "PASS — Verification Approved" },
                { value: "FAIL", label: "FAIL — Verification Rejected" }
              ]}
              placeholder="All Outcomes"
            />
          ) : (
            <div className="text-xs text-slate-400 font-medium self-center pl-2">
              📅 Filtering active scheduled queue entries
            </div>
          )}
        </div>
      </Card>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={7} /></div>
        ) : (
          <Table
            columns={columns}
            data={inspections}
            onRowClick={handleRowClick}
            emptyTitle={activeTab === "active" ? "No scheduled inspections" : "No completed inspection history"}
            emptyDescription={activeTab === "active" ? "Scheduling assigned application verification visits will list inspections here." : "Calibration verification outcomes will display here."}
          />
        )}
      </Card>
    </div>
  );
}

export default InspectionList;
