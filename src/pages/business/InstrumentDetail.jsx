import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Scale, Pencil, BadgeCheck, FileText, Calendar, Compass, Layers, ShieldCheck } from "lucide-react";
import { instrumentService } from "../../services/instrumentService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

function InstrumentDetail() {
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInstrument() {
      try {
        const data = await instrumentService.getInstrument(instrumentId);
        setInstrument(data);
      } catch (err) {
        toast.error("Failed to load instrument details.");
        navigate(ROUTES.BUSINESS_INSTRUMENTS);
      } finally {
        setLoading(false);
      }
    }
    loadInstrument();
  }, [instrumentId]);

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
            { label: "Instruments", path: ROUTES.BUSINESS_INSTRUMENTS },
            { label: "Details" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  const historyColumns = [
    { key: "id", header: "Record ID", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "type", header: "Verification Type" },
    { key: "officerName", header: "Inspecting Officer" },
    { key: "inspectionDate", header: "Date", render: (r) => formatDate(r.inspectionDate) },
    { key: "result", header: "Result", render: (r) => (
      <span className={["px-2 py-0.5 rounded text-xs font-semibold", r.result === "Passed" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"].join(" ")}>
        {r.result}
      </span>
    )},
    {
      key: "certificate",
      header: "Certificate",
      render: (r) => r.certificateId ? (
        <Link to={buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: r.certificateId })} className="font-mono text-xs text-blue-700 hover:underline">
          {r.certificateId}
        </Link>
      ) : "—"
    }
  ];

  return (
    <div className="space-y-6 page-enter max-w-5xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
          { label: "Instruments", path: ROUTES.BUSINESS_INSTRUMENTS },
          { label: instrument.id }
        ]}
      />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Scale size={24} className="text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-800">{instrument.type}</h1>
              <StatusBadge status={instrument.verificationStatus} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Serial: {instrument.serialNumber} · ID: {instrument.id}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Pencil size={14} />}
            onClick={() => navigate(buildPath(ROUTES.BUSINESS_INSTRUMENT_EDIT, { instrumentId: instrument.id }))}
          >
            Edit Device
          </Button>
          {instrument.verificationStatus !== "Pending" && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BadgeCheck size={14} />}
              onClick={() => navigate(ROUTES.BUSINESS_APPLICATIONS_NEW, { state: { prefilledInstrumentId: instrument.id } })}
            >
              Apply for Verification
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Information Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Technical Specifications</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <DetailField icon={<Compass size={13} />} label="Manufacturer" value={instrument.manufacturer} />
              <DetailField icon={<Layers size={13} />} label="Model Number" value={instrument.model} />
              <DetailField icon={<Scale size={13} />} label="Capacity" value={`${instrument.capacity} ${instrument.unit}`} />
              <DetailField icon={<BadgeCheck size={13} />} label="Accuracy Class" value={instrument.accuracyClass} />
              <DetailField icon={<Calendar size={13} />} label="Purchase Date" value={formatDate(instrument.purchaseDate)} />
              <DetailField icon={<FileText size={13} />} label="Category" value={instrument.category} />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Installation Address</h2>
            </Card.Header>
            <Card.Body className="text-xs space-y-2">
              <p className="font-medium text-slate-800">{instrument.installationAddress}</p>
              <p className="text-slate-500">{instrument.city}, {instrument.state} - {instrument.pincode}</p>
            </Card.Body>
          </Card>
        </div>

        {/* Certificate Sidebar Card */}
        <div>
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Current Certificate</h2>
            </Card.Header>
            <Card.Body className="text-xs space-y-4">
              {instrument.certificateId ? (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                    <ShieldCheck size={16} className="text-green-700" />
                    <div>
                      <p className="font-semibold text-green-800">Active Certificate</p>
                      <Link
                        to={buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: instrument.certificateId })}
                        className="font-mono text-[11px] text-green-700 hover:underline block mt-0.5"
                      >
                        {instrument.certificateId}
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valid Until:</span>
                      <span className="font-semibold text-slate-700">{formatDate(instrument.certificateExpiry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Days Remaining:</span>
                      <span className={["font-semibold", instrument.daysToExpiry <= 30 ? "text-amber-600" : "text-slate-700"].join(" ")}>
                        {instrument.daysToExpiry} days
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(buildPath(ROUTES.BUSINESS_CERTIFICATE_DETAIL, { certificateId: instrument.certificateId }))}
                  >
                    View Verification details
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400">No active certificate registered.</p>
                  {instrument.previousCertificate && (
                    <p className="text-[10px] text-slate-400 mt-1">Previous ID: {instrument.previousCertificate}</p>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => navigate(ROUTES.BUSINESS_APPLICATIONS_NEW, { state: { prefilledInstrumentId: instrument.id } })}
                  >
                    Verify Device Now
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* History table */}
      <Card noPadding>
        <Card.Header className="px-5 pt-5 pb-3">
          <h2 className="text-sm font-bold text-slate-800">Verification History</h2>
        </Card.Header>
        <Table
          columns={historyColumns}
          data={instrument.verificationHistory || []}
          emptyTitle="No verification records found"
          emptyDescription="This instrument has not completed any Legal Metrology inspection reviews."
        />
      </Card>
    </div>
  );
}

function DetailField({ icon, label, value }) {
  return (
    <div className="flex gap-2">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-slate-800 font-semibold mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

export default InstrumentDetail;
