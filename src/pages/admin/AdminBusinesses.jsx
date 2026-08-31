import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { Briefcase, Eye } from "lucide-react";
import toast from "react-hot-toast";

function AdminBusinesses() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBusinesses({ search });
      setBusinesses(data.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load businesses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, [search]);

  const columns = [
    { key: "id", header: "Business ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "businessName", header: "Business Name", render: (r) => <span className="font-semibold text-slate-800">{r.businessName}</span> },
    { key: "contactPerson", header: "Contact Person" },
    { key: "email", header: "Email Address" },
    { key: "phone", header: "Phone" },
    { key: "registrationStatus", header: "NABL Registry Status", render: (r) => (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
        r.registrationStatus === "Approved"
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      }`}>
        {r.registrationStatus}
      </span>
    )},
    { key: "instrumentsCount", header: "Instruments", render: (r) => <span className="font-semibold text-slate-700">{r.instrumentsCount} registered</span> },
    { key: "applicationsCount", header: "Applications", render: (r) => <span className="font-semibold text-slate-700">{r.applicationsCount} files</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 py-0 px-2"
          onClick={() => navigate(ROUTES.ADMIN_APPLICATIONS, { state: { filterBusiness: r.businessName } })}
        >
          View Files
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Business Accounts" }]} />

      <div className="flex items-center gap-2">
        <Briefcase className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Business Accounts Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Central legal registry monitoring instruments verification activity across business accounts</p>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by business ID, name, email or contact..."
        />
      </Card>

      {/* Table view */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={10} /></div>
        ) : (
          <Table
            columns={columns}
            data={businesses}
            emptyTitle="No businesses registered"
            emptyDescription="Platform businesses will appear here once registered under department compliance rules."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminBusinesses;
