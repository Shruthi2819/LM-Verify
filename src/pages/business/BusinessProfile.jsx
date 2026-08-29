import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { businessService } from "../../services/businessService";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { INDIAN_STATES } from "../../utils/constants";
import { Building2, User, Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";

function BusinessProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await businessService.getProfile();
        setProfile(data);
        reset(data);
      } catch (err) {
        toast.error("Failed to load profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      const updated = await businessService.updateProfile(data);
      setProfile(updated.profile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    reset(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Breadcrumbs items={[{ label: "Dashboard", path: "/business/dashboard" }, { label: "Business Profile" }]} />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs items={[{ label: "Dashboard", path: "/business/dashboard" }, { label: "Business Profile" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Business Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your Legal Metrology credentials</p>
        </div>
        {!isEditing && (
          <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                <Building2 size={32} className="text-blue-700" />
              </div>
              <h2 className="text-base font-bold text-slate-800">{profile.businessName}</h2>
              <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                LMO LICENSE: {profile.licenseNumber}
              </span>
            </div>
            <div className="border-t border-slate-100 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Reg No:</span>
                <span className="font-mono text-slate-700">{profile.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License Expiry:</span>
                <span className="font-semibold text-slate-700">{profile.licenseExpiry}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit / View Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  required
                  disabled={!isEditing}
                  error={errors.businessName?.message}
                  {...register("businessName", { required: "Business name is required" })}
                />
                <Input
                  label="Contact Person"
                  required
                  disabled={!isEditing}
                  leftIcon={<User size={14} />}
                  error={errors.ownerName?.message}
                  {...register("ownerName", { required: "Contact person is required" })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  disabled={!isEditing}
                  leftIcon={<Mail size={14} />}
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" }
                  })}
                />
                <Input
                  label="Phone Number"
                  required
                  disabled={!isEditing}
                  leftIcon={<Phone size={14} />}
                  error={errors.phone?.message}
                  {...register("phone", { required: "Phone is required" })}
                />
              </div>

              <Input
                label="Address"
                required
                disabled={!isEditing}
                leftIcon={<MapPin size={14} />}
                error={errors.address?.message}
                {...register("address", { required: "Address is required" })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  required
                  disabled={!isEditing}
                  error={errors.city?.message}
                  {...register("city", { required: "City is required" })}
                />
                <Select
                  label="State"
                  required
                  disabled={!isEditing}
                  options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                  error={errors.state?.message}
                  {...register("state", { required: "State is required" })}
                />
                <Input
                  label="Pincode"
                  required
                  disabled={!isEditing}
                  error={errors.pincode?.message}
                  {...register("pincode", {
                    required: "Pincode is required",
                    pattern: { value: /^[1-9][0-9]{5}$/, message: "Enter valid 6-digit pin" }
                  })}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={submitLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" loading={submitLoading}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BusinessProfile;
