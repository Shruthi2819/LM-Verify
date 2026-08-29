import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatCard from "../../components/common/StatCard";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { ClipboardList, Users, ShieldAlert, Award, FileText, Layers } from "lucide-react";
import toast from "react-hot-toast";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [unassignedApps, setUnassignedApps] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await adminService.getDashboardStats();
        setStats(statsData);

        const apps = await adminService.getApplications();
        setUnassignedApps(apps.items.filter(a => a.status === "UNDER_REVIEW").slice(0, 5));

        const lmos = await adminService.getOfficers();
        setOfficers(lmos.slice(0, 4));
      } catch (err) {
        toast.error("Failed to load administration data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const appColumns = [
    { key: "id", header: "Application ID", render: (r) => (
      <Link to={buildPath(ROUTES.ADMIN_APPLICATION_DETAIL, { applicationId: r.id })} className="font-mono text-xs text-blue-700 hover:underline">
        {r.id}
      </Link>
    )},
    { key: "businessName", header: "Business Name" },
    { key: "instrumentName", header: "Instrument" },
    { key: "submittedDate", header: "Submitted", render: (r) => formatDate(r.submittedDate) },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 py-0 px-2"
          onClick={() => navigate(ROUTES.ADMIN_ASSIGNMENTS, { state: { assignAppId: r.id } })}
        >
          Assign Task
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Government Administration Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Central Legal Metrology administrative control panel</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCard key={i} loading={true} />)
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
        {/* Unassigned review queues */}
        <div className="lg:col-span-2 space-y-5">
          <Card noPadding>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-slate-400" />
                <h2 className="font-semibold text-slate-800 text-sm">Applications Awaiting Assignment</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.ADMIN_APPLICATIONS)}
              >
                Monitor All
              </Button>
            </div>
            {loading ? (
              <div className="p-5"><TableSkeleton rows={4} cols={5} /></div>
            ) : (
              <Table
                columns={appColumns}
                data={unassignedApps}
                emptyTitle="No applications awaiting assignment"
                emptyDescription="All submitted verification applications are correctly allocated."
              />
            )}
          </Card>
        </div>

        {/* LMO Officer workload */}
        <div>
          <Card>
            <Card.Header className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <h2 className="font-semibold text-slate-800 text-sm">LM Officer Workloads</h2>
              </div>
            </Card.Header>
            <Card.Body className="space-y-3">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-12 bg-slate-100 rounded" />
                  <div className="h-12 bg-slate-100 rounded" />
                </div>
              ) : (
                officers.map((o) => (
                  <div
                    key={o.officerId}
                    onClick={() => navigate(buildPath(ROUTES.ADMIN_OFFICER_DETAIL, { officerId: o.officerId }))}
                    className="flex justify-between items-center p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{o.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{o.jurisdiction}</p>
                    </div>
                    <div className="text-right">
                      <span className={[
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
                        o.workload > 4 ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"
                      ].join(" ")}>
                        {o.workload} active
                      </span>
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
                onClick={() => navigate(ROUTES.ADMIN_OFFICERS)}
              >
                Manage Officers
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
