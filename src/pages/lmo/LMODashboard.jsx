import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { lmoService } from "../../services/lmoService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatCard from "../../components/common/StatCard";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { ClipboardList, Calendar, ClipboardCheck, Clock, MapPin } from "lucide-react";
import toast from "react-hot-toast";

function LMODashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await lmoService.getDashboardStats();
        setStats(statsData);

        const inspections = await lmoService.getInspections();
        setSchedule(inspections.filter(i => i.status === "SCHEDULED").slice(0, 3));

        const appsResult = await lmoService.getApplications();
        setPendingApps(appsResult.items.filter(a => a.status === "UNDER_REVIEW").slice(0, 5));
      } catch (err) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const appColumns = [
    { key: "id", header: "Application ID", render: (r) => (
      <Link to={buildPath(ROUTES.LMO_APPLICATION_DETAIL, { applicationId: r.id })} className="font-mono text-xs text-blue-700 hover:underline">
        {r.id}
      </Link>
    )},
    { key: "businessName", header: "Business" },
    { key: "instrumentName", header: "Instrument" },
    { key: "submittedDate", header: "Submitted", render: (r) => formatDate(r.submittedDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      <div>
        <h1 className="text-xl font-bold text-slate-800">LMO Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage assigned verification applications and field inspections</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCard key={i} loading={true} />)
        ) : (
          stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
            />
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Today's Schedule */}
        <div>
          <Card>
            <Card.Header className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Today&apos;s Schedule</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">{new Date().toDateString()}</p>
              </div>
              <Calendar size={16} className="text-slate-400" />
            </Card.Header>
            <Card.Body className="space-y-3">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-20 bg-slate-100 rounded-lg" />
                  <div className="h-20 bg-slate-100 rounded-lg" />
                </div>
              ) : schedule.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No inspections scheduled for today.</p>
              ) : (
                schedule.map((ins) => (
                  <div
                    key={ins.id}
                    onClick={() => navigate(buildPath(ROUTES.LMO_INSPECTION_DETAIL, { inspectionId: ins.id }))}
                    className="p-3 rounded-lg border border-slate-200 space-y-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">{ins.id}</span>
                      <StatusBadge status={ins.status} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">{ins.businessName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{ins.instrumentName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-0.5"><Clock size={10} />{ins.scheduledTime}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={10} />{ins.location.split(",")[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
            <Card.Footer className="pt-3 border-t border-slate-100 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(ROUTES.LMO_SCHEDULE)}
              >
                View Full Schedule
              </Button>
            </Card.Footer>
          </Card>
        </div>

        {/* Assigned Pending Applications */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-slate-400" />
                <h2 className="font-semibold text-slate-800 text-sm">Applications Requiring Review</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.LMO_APPLICATIONS)}
              >
                View All
              </Button>
            </div>
            {loading ? (
              <div className="p-5"><TableSkeleton rows={4} cols={5} /></div>
            ) : (
              <Table
                columns={appColumns}
                data={pendingApps}
                emptyTitle="No applications in review"
                emptyDescription="New applications assigned to you will show up here."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LMODashboard;
