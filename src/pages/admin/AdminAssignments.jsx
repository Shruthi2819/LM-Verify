import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { Briefcase, Clipboard, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

function AdminAssignments() {
  const navigate = useNavigate();
  const location = useLocation();

  // Master lists
  const [unassignedApps, setUnassignedApps] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [gatcs, setGatcs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [appId, setAppId] = useState("");
  const [assigneeType, setAssigneeType] = useState("LMO"); // LMO, GATC
  const [assigneeId, setAssigneeId] = useState("");
  const [remarks, setRemarks] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const appsResult = await adminService.getApplications();
        const unassigned = appsResult.items.filter((a) => a.status === "UNDER_REVIEW" || !a.assignedOfficer);
        setUnassignedApps(unassigned);

        const lmos = await adminService.getOfficers();
        setOfficers(lmos.filter((o) => o.status === "Active"));

        const centres = await adminService.getGATCs();
        setGatcs(centres.filter((c) => c.status === "Active"));

        // Prefill from state
        const prefilledAppId = location.state?.assignAppId;
        if (prefilledAppId) {
          setAppId(prefilledAppId);
        }
      } catch (err) {
        toast.error("Failed to load assignment directories.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [location.state]);

  const handleAssignTypeChange = (type) => {
    setAssigneeType(type);
    setAssigneeId("");
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!appId) {
      toast.error("Please select an application.");
      return;
    }
    if (!assigneeId) {
      toast.error("Please select a handler.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleAssignment = async () => {
    setSubmitLoading(true);
    try {
      await adminService.assignApplication(appId, assigneeId, assigneeType, remarks);
      toast.success("Application assigned successfully!");
      setConfirmOpen(false);
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch (err) {
      toast.error(err.message || "Failed to complete assignment.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Assignments" }]} />
        <PanelSkeleton />
      </div>
    );
  }

  const selectedApp = unassignedApps.find((a) => a.id === appId);
  const handlerList = assigneeType === "LMO" ? officers : gatcs;
  const selectedHandler = handlerList.find((h) => (h.officerId || h.gatcId) === assigneeId);

  return (
    <div className="space-y-6 page-enter max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "Assignments" }]} />

      <div className="flex items-center gap-2">
        <Briefcase className="text-blue-700" size={24} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Verification Assignment</h1>
          <p className="text-sm text-slate-500 mt-0.5">Allocate submitted applications to field officers or testing labs</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleConfirm} className="space-y-4 text-xs">
          <Select
            label="Pending Application"
            required
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            options={unassignedApps.map((a) => ({
              value: a.id,
              label: `${a.id} — ${a.businessName} (${a.instrumentName} serial: ${a.instrumentSerial})`
            }))}
            placeholder="Select application file"
          />

          {selectedApp && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 grid grid-cols-2 gap-2 font-medium">
              <p>Instrument Type: <span className="font-semibold text-slate-800">{selectedApp.instrumentName}</span></p>
              <p>Serial Number: <span className="font-mono font-semibold text-slate-800">{selectedApp.instrumentSerial}</span></p>
              <p>Installation Address: <span className="font-semibold text-slate-800 block truncate">{selectedApp.installationAddress}</span></p>
              <p>Submission Category: <span className="font-semibold text-slate-800">{selectedApp.type}</span></p>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">Handler Allocation Category</span>
            <div className="flex gap-2">
              {["LMO", "GATC"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAssignTypeChange(type)}
                  className={[
                    "flex-1 py-2 rounded text-xs font-bold border transition-colors cursor-pointer",
                    assigneeType === type
                      ? "bg-blue-700 border-blue-700 text-white"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                  ].join(" ")}
                >
                  {type === "LMO" ? "Legal Metrology Officer (LMO)" : "Approved Test Centre (GATC)"}
                </button>
              ))}
            </div>
          </div>

          <Select
            label={`Select ${assigneeType === "LMO" ? "Officer" : "Test Centre"}`}
            required
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={handlerList.map((h) => ({
              value: h.officerId || h.gatcId,
              label: `${h.name} (${h.jurisdiction} · workload: ${h.workload} active)`
            }))}
            placeholder={`Choose ${assigneeType === "LMO" ? "officer" : "test centre"}`}
          />

          <Textarea
            label="Assignment remarks"
            placeholder="Add assignment directions or specific metrology SLA warnings..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Assign Application
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Verification Assignment">
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
            <p>Application ID: <span className="font-bold text-slate-800">{appId}</span></p>
            <p>Allocated Handler Type: <span className="font-semibold text-slate-800">{assigneeType}</span></p>
            <p>Handler Assigned: <span className="font-bold text-slate-800">{selectedHandler?.name}</span></p>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Verify the information. Stamping assignments automatically alert the corresponding handler.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignment} loading={submitLoading}>
              Confirm Allocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminAssignments;
