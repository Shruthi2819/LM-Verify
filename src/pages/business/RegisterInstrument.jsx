import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { instrumentService } from "../../services/instrumentService";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import FormSection from "../../components/common/FormSection";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import {
  INSTRUMENT_TYPES,
  INSTRUMENT_CATEGORIES,
  ACCURACY_CLASSES,
  UNITS_OF_MEASUREMENT,
  INDIAN_STATES
} from "../../utils/constants";
import { ROUTES, buildPath } from "../../config/routes";
import toast from "react-hot-toast";

function RegisterInstrument() {
  const navigate = useNavigate();
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      type: "",
      category: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      capacity: "",
      accuracyClass: "",
      unit: "",
      purchaseDate: "",
      installationAddress: "",
      city: "",
      state: "",
      pincode: "",
      previousCertificate: ""
    }
  });

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      const response = await instrumentService.createInstrument(data);
      toast.success("Instrument registered successfully!");
      navigate(buildPath(ROUTES.BUSINESS_INSTRUMENT_DETAIL, { instrumentId: response.id }));
    } catch (err) {
      toast.error(err.message || "Failed to register instrument.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
          { label: "Instruments", path: ROUTES.BUSINESS_INSTRUMENTS },
          { label: "Register" }
        ]}
      />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Register Instrument</h1>
        <p className="text-sm text-slate-500 mt-0.5">Add a new weighing or measuring device to your dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Section 1: Basic Information */}
        <FormSection title="Basic Information" description="Device category and manufacturing details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Instrument Type"
              required
              options={INSTRUMENT_TYPES.map(t => ({ value: t, label: t }))}
              error={errors.type?.message}
              {...register("type", { required: "Instrument Type is required" })}
            />
            <Select
              label="Category"
              required
              options={INSTRUMENT_CATEGORIES.map(c => ({ value: c, label: c }))}
              error={errors.category?.message}
              {...register("category", { required: "Category is required" })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Manufacturer"
              required
              placeholder="e.g. Mettler Toledo"
              error={errors.manufacturer?.message}
              {...register("manufacturer", { required: "Manufacturer is required" })}
            />
            <Input
              label="Model Number"
              required
              placeholder="e.g. ICS465"
              error={errors.model?.message}
              {...register("model", { required: "Model number is required" })}
            />
          </div>
        </FormSection>

        {/* Section 2: Identification & Capacity */}
        <FormSection title="Technical Identification" description="Physical identification markings and capacities">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Serial Number"
              required
              placeholder="Manufacturer serial marking"
              error={errors.serialNumber?.message}
              {...register("serialNumber", { required: "Serial number is required" })}
            />
            <Input
              label="Date of Purchase"
              type="date"
              required
              error={errors.purchaseDate?.message}
              {...register("purchaseDate", { required: "Purchase date is required" })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Capacity"
              required
              placeholder="e.g. 150"
              error={errors.capacity?.message}
              {...register("capacity", { required: "Capacity is required" })}
            />
            <Select
              label="Unit of Measurement"
              required
              options={UNITS_OF_MEASUREMENT.map(u => ({ value: u, label: u }))}
              error={errors.unit?.message}
              {...register("unit", { required: "Unit of measurement is required" })}
            />
            <Select
              label="Accuracy Class"
              required
              options={ACCURACY_CLASSES.map(ac => ({ value: ac, label: ac }))}
              error={errors.accuracyClass?.message}
              {...register("accuracyClass", { required: "Accuracy class is required" })}
            />
          </div>
        </FormSection>

        {/* Section 3: Installation Details */}
        <FormSection title="Installation Details" description="Physical location of the measuring instrument">
          <Input
            label="Place of Installation / Installation Address"
            required
            placeholder="e.g. Unit 4, MIDC Industrial Area"
            error={errors.installationAddress?.message}
            {...register("installationAddress", { required: "Installation address is required" })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              required
              placeholder="City"
              error={errors.city?.message}
              {...register("city", { required: "City is required" })}
            />
            <Select
              label="State"
              required
              options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
              error={errors.state?.message}
              {...register("state", { required: "State is required" })}
            />
            <Input
              label="Pincode"
              required
              placeholder="6-digit PIN"
              error={errors.pincode?.message}
              {...register("pincode", {
                required: "Pincode is required",
                pattern: { value: /^[1-9][0-9]{5}$/, message: "Enter valid 6-digit PIN" }
              })}
            />
          </div>
        </FormSection>

        {/* Section 4: History */}
        <FormSection title="Verification History" description="Details of previous verification (optional)">
          <Input
            label="Previous Certificate Number (if any)"
            placeholder="e.g. CERT-2025-000021"
            error={errors.previousCertificate?.message}
            {...register("previousCertificate")}
          />
        </FormSection>

        {/* Form controls */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            variant="outline"
            disabled={submitLoading}
            onClick={() => navigate(ROUTES.BUSINESS_INSTRUMENTS)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitLoading}
          >
            Register Instrument
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RegisterInstrument;
