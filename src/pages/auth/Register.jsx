import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Building2, Lock, Eye, EyeOff, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { ROUTES } from "../../config/routes";
import { STAKEHOLDER_TYPES, INDIAN_STATES } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success("Registration submitted! Please sign in.");
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto py-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
        <p className="text-sm text-slate-500 mt-1">
          Register to access the LM Verify platform
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Personal Info */}
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Details</h3>
        </div>

        <Input
          label="Full Name"
          required
          placeholder="Your full name"
          leftIcon={<User size={15} />}
          error={errors.fullName?.message}
          {...register("fullName", { required: "Full name is required" })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@example.com"
            leftIcon={<Mail size={15} />}
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            })}
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="+91 98765 43210"
            leftIcon={<Phone size={15} />}
            error={errors.phone?.message}
            {...register("phone", {
              required: "Phone number is required",
              pattern: { value: /^[+\d\s-]{10,}$/, message: "Enter a valid phone number" },
            })}
          />
        </div>

        {/* Business Info */}
        <div className="border-b border-slate-200 pb-2 pt-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Business Details</h3>
        </div>

        <Input
          label="Organisation / Business Name"
          required
          placeholder="Your organisation name"
          leftIcon={<Building2 size={15} />}
          error={errors.organisation?.message}
          {...register("organisation", { required: "Organisation name is required" })}
        />

        <Select
          label="Stakeholder Type"
          required
          placeholder="Select your role"
          options={STAKEHOLDER_TYPES}
          error={errors.stakeholderType?.message}
          {...register("stakeholderType", { required: "Please select a stakeholder type" })}
        />

        <Input
          label="Business Address"
          required
          placeholder="Building, street name, area"
          leftIcon={<MapPin size={15} />}
          error={errors.address?.message}
          {...register("address", { required: "Business address is required" })}
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
            placeholder="Select State"
            options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
            error={errors.state?.message}
            {...register("state", { required: "State is required" })}
          />

          <Input
            label="Pincode"
            required
            placeholder="6-digit pincode"
            error={errors.pincode?.message}
            {...register("pincode", {
              required: "Pincode is required",
              pattern: { value: /^[1-9][0-9]{5}$/, message: "Enter valid 6-digit pin" }
            })}
          />
        </div>

        {/* Security */}
        <div className="border-b border-slate-200 pb-2 pt-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security</h3>
        </div>

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Min. 8 characters"
          leftIcon={<Lock size={15} />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="pointer-events-auto text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Minimum 8 characters" },
          })}
        />

        <Input
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          required
          placeholder="Re-enter password"
          leftIcon={<Lock size={15} />}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="pointer-events-auto text-slate-400 hover:text-slate-600">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (val) => val === password || "Passwords do not match",
          })}
        />

        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md p-3">
          After registration, your account will require approval from a Legal Metrology administrator before you can sign in.
        </p>

        <Button type="submit" variant="primary" className="w-full" loading={loading} size="lg">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700 font-medium">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default Register;
