import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Plus, BadgeCheck, ClipboardList, AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { businessService } from "../../services/businessService";
import { applicationService } from "../../services/applicationService";
import { certificateService } from "../../services/certificateService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/feedback/StatusBadge";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatCard from "../../components/common/StatCard";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { formatDate } from "../../utils/helpers";
import { ROUTES, buildPath } from "../../config/routes";
import toast from "react-hot-toast";

function BusinessDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [expiringCerts, setExpiringCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsData = await businessService.getDashboardStats();
        setStats(statsData);

        const appsResult = await applicationService.getApplications({ page: 1, limit: 5 });
        setRecentApps(appsResult.items || []);

        const certsData = await certificateService.getCertificates();
        const expiring = certsData.filter(c => c.status === "Valid" && c.daysToExpiry <= 30 && c.daysToExpiry >= 0);
        setExpiringCerts(expiring.slice(0, 3));
      } catch (err) {
        toast.error("Error loading dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const columns = [
    { key: "id", header: "Application ID", render: (r) => (
      <Link to={buildPath(ROUTES.BUSINESS_APPLICATION_DETAIL, { applicationId: r.id })} className="font-mono text-xs text-blue-700 hover:underline">
        {r.id}
      </Link>
    )},
    { key: "instrumentName", header: "Instrument" },
    { key: "type", header: "Type" },
    { key: "submittedDate", header: "Submitted", render: (r) => formatDate(r.submittedDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Good morning, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{user?.organisation}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Scale size={14} />}
            onClick={() => navigate(ROUTES.BUSINESS_INSTRUMENTS_REGISTER)}
          >
            Register Instrument
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => navigate(ROUTES.BUSINESS_APPLICATIONS_NEW)}
          >
            Apply for Verification
          </Button>
        </div>
      </div>

      {/* Stat cards */}
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
        {/* Recent applications */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 text-sm">Recent Applications</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.BUSINESS_APPLICATIONS)}>
                View All
              </Button>
            </div>
            {loading ? (
              <div className="p-5"><TableSkeleton rows={3} cols={4} /></div>
            ) : (
              <Table
                columns={columns}
                data={recentApps}
                emptyTitle="No applications submitted yet"
                emptyDescription="Submit your first instrument verification application to get started."
              />
            )}
          </Card>
        </div>

        {/* Expiring certificates */}
        <div>
          <Card>
            <Card.Header className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 text-sm">Expiring Soon</h2>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100 font-semibold">
                Action Required
              </span>
            </Card.Header>
            <Card.Body className="space-y-3 pt-2">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-16 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : expiringCerts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No expiring certificates in the next 30 days.
                </p>
              ) : (
                expiringCerts.map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => navigate(buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: cert.id }))}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100 cursor-pointer hover:bg-amber-50 transition-colors"
                  >
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700 truncate">{cert.instrumentName}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">ID: {cert.id}</p>
                      <p className="text-[10px] text-amber-700 font-semibold mt-1">
                        Expires: {formatDate(cert.expiryDate)} ({cert.daysToExpiry} days left)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
            <Card.Footer className="border-t border-slate-100 pt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(ROUTES.BUSINESS_CERTIFICATES)}
              >
                View All Certificates
              </Button>
            </Card.Footer>
          </Card>

          {/* Quick links */}
          <Card className="mt-4">
            <Card.Header>
              <h2 className="font-semibold text-slate-800 text-sm">Quick Links</h2>
            </Card.Header>
            <Card.Body className="space-y-2">
              {[
                { label: "My Business Profile", path: ROUTES.BUSINESS_PROFILE, icon: Scale },
                { label: "Registered Instruments", path: ROUTES.BUSINESS_INSTRUMENTS, icon: Scale },
                { label: "Certificate Verifier", path: ROUTES.VERIFY, icon: BadgeCheck },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded border border-slate-200 hover:bg-slate-50 text-left text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <link.icon size={13} className="text-blue-700" />
                    {link.label}
                  </span>
                  <span className="text-[10px] text-slate-400">→</span>
                </button>
              ))}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboard;
