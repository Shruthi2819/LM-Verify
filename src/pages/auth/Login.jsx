import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES, ROLES } from "../../config/routes";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

/**
 * Login page.
 *
 * Integrates with AuthContext.login(email, password).
 * Includes an option to pre-fill credentials in development mode.
 */
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const redirectPath = await login(data.email, data.password);
      toast.success("Signed in successfully");
      const intended = location.state?.from?.pathname;
      navigate(intended || redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to prefill login forms for demo testing
  const handlePrefill = (role) => {
    setValue("email", `${role}@example.com`);
    setValue("password", "password123");
  };

  const showDevHelper = import.meta.env.VITE_USE_MOCK_DATA === "true" || import.meta.env.DEV;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
        <p className="text-sm text-slate-500 mt-1">
          Sign in to your LM Verify account
        </p>
      </div>

      {showDevHelper && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-700 mb-2">
            🛠 DEV DEMO — Click to Prefill Credentials
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { value: ROLES.BUSINESS, label: "Business" },
              { value: ROLES.LMO, label: "LMO" },
              { value: ROLES.GATC, label: "GATC" },
              { value: ROLES.ADMIN, label: "Admin" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handlePrefill(r.value)}
                className="py-1 px-1.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          leftIcon={<Lock size={15} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="pointer-events-auto text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600"
              {...register("remember")}
            />
            <span className="text-slate-600">Remember me</span>
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-blue-600 hover:text-blue-700 font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full" loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to={ROUTES.REGISTER} className="text-blue-600 hover:text-blue-700 font-medium">
          Register
        </Link>
      </p>
    </div>
  );
}

export default Login;
