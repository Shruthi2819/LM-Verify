import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lmoService } from "../../services/lmoService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Calendar, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";

function ScheduleList() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInspections() {
      try {
        const data = await lmoService.getInspections({ status: "SCHEDULED" });
        setInspections(data || []);
      } catch (err) {
        toast.error("Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    }
    fetchInspections();
  }, []);

  const columns = [
    { key: "id", header: "Inspection ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "businessName", header: "Business Name" },
    { key: "instrumentName", header: "Instrument" },
    { key: "scheduledDate", header: "Date", render: (r) => formatDate(r.scheduledDate) },
    { key: "scheduledTime", header: "Time", render: (r) => (
      <span className="flex items-center gap-1"><Clock size={11} className="text-slate-400" /> {r.scheduledTime}</span>
    )},
    { key: "location", header: "Location", render: (r) => (
      <span className="flex items-center gap-1 max-w-[200px] truncate"><MapPin size={11} className="text-slate-400 flex-shrink-0" /> {r.location}</span>
    )},
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <Button
          variant="primary"
          size="sm"
          className="text-xs h-7 py-0 px-2"
          onClick={() => navigate(buildPath(ROUTES.LMO_INSPECTION_DETAIL, { inspectionId: r.id }))}
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.LMO_DASHBOARD }, { label: "Schedule" }]} />

      <div className="flex items-center gap-2">
        <Calendar className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Inspection Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and execute scheduled field observations</p>
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={7} /></div>
        ) : (
          <Table
            columns={columns}
            data={inspections}
            emptyTitle="No inspections scheduled"
            emptyDescription="All assigned verification events are completed or unassigned."
          />
        )}
      </Card>
    </div>
  );
}

export default ScheduleList;
