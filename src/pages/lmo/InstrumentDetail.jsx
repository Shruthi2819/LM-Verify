import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lmoService } from "../../services/lmoService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Scale, Calendar, User, FileText, CheckCircle2, History, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function InstrumentDetail() {
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDevice() {
      try {
        const data = await lmoService.getInstrument(instrumentId);
        setDevice(data);
      } catch (err) {
        toast.error("Failed to load instrument details.");
        navigate(ROUTES.LMO_DASHBOARD);
      } finally {
        setLoading(false);
      }
    }
    loadDevice();
  }, [instrumentId]);

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.LMO_DASHBOARD },
            { label: "Instruments" },
            { label: "Details" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  const isVerified = device.verificationStatus === "Verified";

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto pb-10">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.LMO_DASHBOARD },
          { label: "Instruments" },
          { label: device.id }
        ]}
      />

      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Scale size={24} className="text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-800">{device.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isVerified ? "bg-green-50 text-green-700 border-green-150" : "bg-amber-50 text-amber-700 border-amber-150"}`}>
                {device.verificationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Instrument ID: {device.id}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device profile card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Device Specifications</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <DetailField icon={<Scale size={13} />} label="Category" value={device.category} />
              <DetailField icon={<FileText size={13} />} label="Manufacturer" value={device.manufacturer} />
              <DetailField icon={<FileText size={13} />} label="Model Number" value={device.model} />
              <DetailField icon={<FileText size={13} />} label="Serial Number" value={device.serialNumber} />
              <DetailField icon={<Scale size={13} />} label="Max Capacity" value={device.capacity} />
              <DetailField icon={<Scale size={13} />} label="Accuracy Class" value={device.accuracyClass} />
              <DetailField icon={<Calendar size={13} />} label="Purchase Date" value={formatDate(device.purchaseDate)} />
              <DetailField icon={<User size={13} />} label="Registered Owner" value={device.businessName} />
              <div className="sm:col-span-2">
                <DetailField icon={<FileText size={13} />} label="Installation Address" value={device.location} />
              </div>
            </Card.Body>
          </Card>

          {/* Verification compliance parameters */}
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">Compliance & Verification Status</h2>
            </Card.Header>
            <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase block">Certificate Status</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">{device.certificateStatus}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase block">Certificate Expiry</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">{device.certificateExpiry ? formatDate(device.certificateExpiry) : "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase block">Last Verification Date</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">{device.lastVerifiedDate ? formatDate(device.lastVerifiedDate) : "Never Verified"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase block">Next Verification Due</span>
                <span className="font-semibold text-red-600 mt-0.5 block">{device.nextVerificationDue}</span>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Verification History / Lifecycle timeline placeholder */}
        <div className="space-y-6">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <History size={15} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-800">Verification History</h2>
              </div>
            </Card.Header>
            <Card.Body className="space-y-4 pt-1">
              {device.history && device.history.length > 0 ? (
                device.history.map((hist, idx) => (
                  <div key={idx} className="relative pl-6 pb-2 border-l border-slate-200 last:border-0 last:pb-0">
                    <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-blue-600" />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{formatDate(hist.date)}</span>
                        <span className="text-[9px] bg-green-50 text-green-700 font-bold border border-green-150 px-1 rounded">
                          {hist.result}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Inspector: {hist.officer}</p>
                      <p className="text-[10px] text-slate-550 italic leading-relaxed">&ldquo;{hist.remarks}&rdquo;</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <AlertCircle size={20} className="text-slate-350 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No previous verification logs found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
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
