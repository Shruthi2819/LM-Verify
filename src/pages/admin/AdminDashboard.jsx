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
      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <Card.Header className="pb-2 border-b border-slate-100 mb-3 flex items-center gap-1.5">
            <ClipboardList size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Applications by Status</h3>
          </Card.Header>
          <Card.Body className="space-y-3.5 text-[11px] font-medium text-slate-600">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Under Review</span>
                <span className="font-semibold text-slate-800">12 (10%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Assigned</span>
                <span className="font-semibold text-slate-800">18 (15%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "15%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Scheduled</span>
                <span className="font-semibold text-slate-800">24 (19%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: "19%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-semibold text-slate-800">70 (56%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "56%" }} />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header className="pb-2 border-b border-slate-100 mb-3 flex items-center gap-1.5">
            <Award size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Certificates Issued (Growth)</h3>
          </Card.Header>
          <Card.Body className="h-[140px] flex items-end justify-between gap-2 pt-2 px-2 text-[10px] text-slate-400 font-semibold select-none">
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full bg-blue-100 rounded-t h-[20px] dark:bg-blue-900/40 relative group cursor-pointer hover:bg-blue-200">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white px-1 rounded text-[8px]">15</span>
              </div>
              <span>Apr</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full bg-blue-200 rounded-t h-[35px] dark:bg-blue-800/40 relative group cursor-pointer hover:bg-blue-300">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white px-1 rounded text-[8px]">22</span>
              </div>
              <span>May</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full bg-blue-300 rounded-t h-[55px] dark:bg-blue-700/40 relative group cursor-pointer hover:bg-blue-400">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white px-1 rounded text-[8px]">30</span>
              </div>
              <span>Jun</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full bg-blue-400 rounded-t h-[80px] dark:bg-blue-600/40 relative group cursor-pointer hover:bg-blue-500">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white px-1 rounded text-[8px]">45</span>
              </div>
              <span>Jul</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full bg-blue-600 rounded-t h-[110px] dark:bg-blue-500 relative group cursor-pointer hover:bg-blue-700">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white px-1 rounded text-[8px]">87</span>
              </div>
              <span>Aug</span>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header className="pb-2 border-b border-slate-100 mb-3 flex items-center gap-1.5">
            <Users size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Roles Allocation</h3>
          </Card.Header>
          <Card.Body className="space-y-3.5 text-[11px] font-medium text-slate-600">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Businesses</span>
                <span className="font-semibold text-slate-800">50%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "50%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Legal Metrology Officers</span>
                <span className="font-semibold text-slate-800">25%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: "25%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>GATC Test Centres</span>
                <span className="font-semibold text-slate-800">15%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: "15%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Administrators</span>
                <span className="font-semibold text-slate-800">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className="bg-slate-500 h-2.5 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </Card.Body>
        </Card>
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
