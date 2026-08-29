import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Search } from "lucide-react";
import { certificateService } from "../../services/certificateService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { CERTIFICATE_STATUS } from "../../utils/constants";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

function CertificateList() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await certificateService.getCertificates({
        search,
        status
      });
      setCertificates(response || []);
    } catch (err) {
      toast.error("Failed to load certificates.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [search, status]);

  const handleRowClick = (row) => {
    navigate(buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: row.id }));
  };

  const columns = [
    { key: "id", header: "Certificate ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "instrumentName", header: "Instrument" },
    { key: "serialNumber", header: "Serial Number", render: (r) => <span className="font-mono text-xs">{r.serialNumber}</span> },
    { key: "issuedDate", header: "Issue Date", render: (r) => formatDate(r.issuedDate) },
    { key: "expiryDate", header: "Expiry Date", render: (r) => formatDate(r.expiryDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 h-7 py-0 px-2"
            onClick={() => navigate(buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: r.id }))}
          >
            View Certificate
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD }, { label: "Certificates" }]} />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Verification Certificates</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage and download your verified Legal Metrology records</p>
      </div>

      {/* Filter Options */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by certificate ID, device name, serial..."
            />
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={Object.values(CERTIFICATE_STATUS).map((s) => ({ value: s, label: s }))}
            placeholder="All Statuses"
          />
        </div>
      </Card>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={6} /></div>
        ) : (
          <Table
            columns={columns}
            data={certificates}
            onRowClick={handleRowClick}
            emptyTitle="No certificates registered"
            emptyDescription="Completed applications will automatically generate digital certificates here."
          />
        )}
      </Card>
    </div>
  );
}

export default CertificateList;
