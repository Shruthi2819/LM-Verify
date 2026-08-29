import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";

function AdminJurisdictions() {
  const [jurisdictions, setJurisdictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await adminService.getJurisdictions();
        setJurisdictions(data || []);
      } catch (err) {
        toast.error("Failed to load jurisdictions.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const columns = [
    { key: "id", header: "Jurisdiction ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "name", header: "Division Name" },
    { key: "district", header: "District" },
    { key: "activeLMOs", header: "Active LMOs" },
    { key: "activeGATCs", header: "Active GATCs" },
    { key: "pendingApps", header: "Pending Applications", render: (r) => (
      <span className={["px-2 py-0.5 rounded text-xs font-bold", r.pendingApps > 2 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"].join(" ")}>
        {r.pendingApps} pending
      </span>
    )}
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Jurisdictions" }]} />

      <div className="flex items-center gap-2">
        <MapPin className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Regional Jurisdictions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Metrology workload distribution by zone division</p>
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={6} /></div>
        ) : (
          <Table
            columns={columns}
            data={jurisdictions}
            emptyTitle="No jurisdictions found"
            emptyDescription="District boundaries will appear here."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminJurisdictions;
