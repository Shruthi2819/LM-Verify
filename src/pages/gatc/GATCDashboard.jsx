import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gatcService } from "../../services/gatcService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatCard from "../../components/common/StatCard";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Briefcase, Calendar, Clock, MapPin, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

function GATCDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await gatcService.getDashboardStats();
        setStats(statsData);

        const tests = await gatcService.getInspections();
        setSchedule(tests.filter(t => t.status === "SCHEDULED").slice(0, 3));

        const apps = await gatcService.getApplications();
        setPendingApps(apps.items.filter(a => a.status === "UNDER_REVIEW").slice(0, 5));
      } catch (err) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const columns = [
    { key: "id", header: "Application ID", render: (r) => (
      <Link to={buildPath(ROUTES.GATC_APPLICATION_DETAIL, { applicationId: r.id })} className="font-mono text-xs text-blue-700 hover:underline">
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
        <h1 className="text-xl font-bold text-slate-800">GATC Calibration Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage assigned calibration tests and laboratory assessments</p>
      </div>

      {/* KPI Cards */}
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
        {/* Today's schedule */}
        <div>
          <Card>
            <Card.Header className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Today&apos;s Tests</h2>
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
                <p className="text-xs text-slate-500 py-6 text-center">No calibration tests scheduled today.</p>
              ) : (
                schedule.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(buildPath(ROUTES.GATC_INSPECTION_DETAIL, { inspectionId: t.id }))}
                    className="p-3 rounded-lg border border-slate-200 space-y-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">{t.id}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">{t.businessName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.instrumentName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-0.5"><Clock size={10} />{t.scheduledTime}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={10} />{t.location.split(",")[0]}</span>
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
                onClick={() => navigate(ROUTES.GATC_SCHEDULE)}
              >
                View Full Schedule
              </Button>
            </Card.Footer>
          </Card>
        </div>

        {/* Assigned Pending Tasks */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-slate-400" />
                <h2 className="font-semibold text-slate-800 text-sm">Assigned Tasks Review</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.GATC_APPLICATIONS)}
              >
                View All
              </Button>
            </div>
            {loading ? (
              <div className="p-5"><TableSkeleton rows={4} cols={5} /></div>
            ) : (
              <Table
                columns={columns}
                data={pendingApps}
                emptyTitle="No calibration tasks assigned"
                emptyDescription="Applications allocated to your centre by administrative oversight will list here."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default GATCDashboard;
