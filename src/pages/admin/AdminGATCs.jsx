import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { adminService } from "../../services/adminService";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/feedback/StatusBadge";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import Modal from "../../components/common/Modal";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { Award, Plus } from "lucide-react";
import toast from "react-hot-toast";

function AdminGATCs() {
  const [gatcs, setGatcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadGatcs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getGATCs();
      setGatcs(data || []);
    } catch (err) {
      toast.error("Failed to load GATCs directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGatcs();
  }, []);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await adminService.createGATC(data);
      toast.success("GATC registered successfully!");
      setAddModalOpen(false);
      reset();
      loadGatcs();
    } catch (err) {
      toast.error(err.message || "GATC registration failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    { key: "gatcId", header: "GATC ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.gatcId}</span> },
    { key: "name", header: "Centre Name" },
    { key: "labManager", header: "Lab Manager" },
    { key: "jurisdiction", header: "Jurisdiction" },
    { key: "accreditationNumber", header: "Accreditation" },
    { key: "workload", header: "Workload", render: (r) => `${r.workload} active` },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD }, { label: "GATCs" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="text-blue-700" size={24} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Government Approved Test Centres</h1>
            <p className="text-sm text-slate-500 mt-0.5">NABL accredited calibration laboratories inventory</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setAddModalOpen(true)}
        >
          Add GATC
        </Button>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5"><TableSkeleton rows={4} cols={7} /></div>
        ) : (
          <Table
            columns={columns}
            data={gatcs}
            emptyTitle="No test centres registered"
            emptyDescription="Registered test centres from regional offices will display here."
          />
        )}
      </Card>

      {/* Add GATC Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register NABL Approved GATC">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs" noValidate>
          <Input
            label="Centre Name"
            required
            placeholder="e.g. Pune Metrology Calibration Lab"
            error={errors.name?.message}
            {...register("name", { required: "Centre name is required" })}
          />
          <Input
            label="Lab Manager"
            required
            placeholder="e.g. Anand Verma"
            error={errors.labManager?.message}
            {...register("labManager", { required: "Manager is required" })}
          />
          <Input
            label="Accreditation Number"
            required
            placeholder="e.g. NABL-C-1294"
            error={errors.accreditationNumber?.message}
            {...register("accreditationNumber", { required: "Accreditation number is required" })}
          />
          <Input
            label="Jurisdiction District"
            required
            placeholder="e.g. Pune District"
            error={errors.jurisdiction?.message}
            {...register("jurisdiction", { required: "Jurisdiction is required" })}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitLoading}>
              Register Centre
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminGATCs;
