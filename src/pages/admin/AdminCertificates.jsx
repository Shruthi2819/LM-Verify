import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Scroll, Award, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      try {
        const data = await adminService.getCertificates();
        setCertificates(data || []);
      } catch (err) {
        toast.error("Failed to load certificates directory.");
      } finally {
        setLoading(false);
      }
    }
    loadCertificates();
  }, []);

  const columns = [
    { key: "id", header: "Certificate ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "applicationId", header: "Application ID", render: (r) => <span className="font-mono text-xs">{r.applicationId}</span> },
    { key: "instrumentName", header: "Instrument Type" },
    { key: "issuedDate", header: "Issued Date", render: (r) => formatDate(r.issuedDate) },
    { key: "expiryDate", header: "Expiry Date", render: (r) => formatDate(r.expiryDate) },
    { key: "status", header: "Validity", render: (r) => <StatusBadge status={r.status} /> },
    { key: "blockchainHash", header: "Blockchain Registry", render: (r) => (
      <div className="flex flex-col gap-0.5 max-w-[150px]">
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-700">
          <CheckCircle size={10} /> Recorded
        </span>
        <span className="font-mono text-[9px] text-slate-400 truncate" title={r.blockchainHash}>
          {r.blockchainHash}
        </span>
      </div>
    )}
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Certificates" }]} />

      <div className="flex items-center gap-2">
        <Scroll className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Compliance Stamping Certificates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Registry of issued verification certificates and blockchain verification details</p>
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={7} /></div>
        ) : (
          <Table
            columns={columns}
            data={certificates}
            emptyTitle="No certificates registered"
            emptyDescription="Issued compliance certificates will display here once approved."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminCertificates;
