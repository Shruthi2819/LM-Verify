import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { certificateService } from "../../services/certificateService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Award } from "lucide-react";
import toast from "react-hot-toast";

function CertificateList() {
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getCertificates({ search, status });
      setCerts(data || []);
    } catch (err) {
      toast.error("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [search, status]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: row.id }));
  };

  const columns = [
    { key: "id", header: "Certificate ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "instrumentName", header: "Instrument Type" },
    { key: "businessName", header: "Business Name" },
    { key: "issuedDate", header: "Issued On", render: (r) => formatDate(r.issuedDate) },
    { key: "expiryDate", header: "Valid Until", render: (r) => formatDate(r.expiryDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2 cursor-pointer"
            onClick={() => navigate(buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: r.id }))}
          >
            View Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.GATC_DASHBOARD }, { label: "Certificates" }]} />

      <div className="flex items-center gap-2">
        <Award className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Laboratory Calibration Certificates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Directory of verification certificates processed through your laboratory</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by ID, instrument type, or serial number..."
            />
          </div>
          <Select
            label="Validity Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "valid", label: "Valid" },
              { value: "expired", label: "Expired" },
              { value: "revoked", label: "Revoked" }
            ]}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={7} /></div>
        ) : (
          <Table
            columns={columns}
            data={certs}
            onRowClick={handleRowClick}
            emptyTitle="No certificates found"
            emptyDescription="Stamping approvals for GATC-assigned scales will generate certificates here."
          />
        )}
      </Card>
    </div>
  );
}

export default CertificateList;
