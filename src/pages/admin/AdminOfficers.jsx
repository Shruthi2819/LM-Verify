import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";

function AdminOfficers() {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOfficers() {
      try {
        const data = await adminService.getOfficers();
        setOfficers(data || []);
      } catch (err) {
        toast.error("Failed to load officers directory.");
      } finally {
        setLoading(false);
      }
    }
    loadOfficers();
  }, []);

  const columns = [
    { key: "officerId", header: "Officer ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.officerId}</span> },
    { key: "name", header: "Officer Name" },
    { key: "designation", header: "Designation" },
    { key: "jurisdiction", header: "Jurisdiction Division" },
    { key: "workload", header: "Active Workload", render: (r) => (
      <span className={["px-2 py-0.5 rounded text-xs font-semibold border", r.workload > 3 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-green-50 text-green-700 border-green-100"].join(" ")}>
        {r.workload} active applications
      </span>
    )},
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "LM Officers" }]} />

      <div className="flex items-center gap-2">
        <ShieldCheck className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Legal Metrology Officers Registry</h1>
          <p className="text-sm text-slate-500 mt-0.5">Directory of operational inspectors and divisions workload</p>
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={6} /></div>
        ) : (
          <Table
            columns={columns}
            data={officers}
            emptyTitle="No LMO officers registered"
            emptyDescription="Contact department HR to register operational officers."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminOfficers;
