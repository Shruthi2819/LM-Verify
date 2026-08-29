import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { CalendarRange } from "lucide-react";
import toast from "react-hot-toast";

function AdminInspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInspections() {
      try {
        const data = await adminService.getInspections();
        setInspections(data || []);
      } catch (err) {
        toast.error("Failed to load inspections directory.");
      } finally {
        setLoading(false);
      }
    }
    loadInspections();
  }, []);

  const columns = [
    { key: "id", header: "Inspection ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "applicationId", header: "Application ID", render: (r) => <span className="font-mono text-xs">{r.applicationId}</span> },
    { key: "handlerName", header: "Assigned Inspector" },
    { key: "scheduledDate", header: "Scheduled Date", render: (r) => formatDate(r.scheduledDate) },
    { key: "location", header: "Location Area" },
    { key: "status", header: "Inspection Status", render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Inspections" }]} />

      <div className="flex items-center gap-2">
        <CalendarRange className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Field Inspections Monitor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Audit scheduling details and verification logs across divisions</p>
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={6} /></div>
        ) : (
          <Table
            columns={columns}
            data={inspections}
            emptyTitle="No field inspections found"
            emptyDescription="Active inspections scheduled by LMOs or GATCs will display here."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminInspections;
