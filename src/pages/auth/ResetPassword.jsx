import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "mock-token";

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success("Password reset successfully. Please sign in.");
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(err.message || "Unable to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter and confirm your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="New Password"
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
          label="Confirm New Password"
          type={showConfirm ? "text" : "password"}
          required
          placeholder="Re-enter new password"
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

        <Button type="submit" variant="primary" className="w-full" loading={loading} size="lg">
          Reset Password
        </Button>
      </form>

      <Link to={ROUTES.LOGIN} className="flex items-center justify-center text-sm text-slate-500 hover:text-slate-700">
        Back to Sign In
      </Link>
    </div>
  );
}

export default ResetPassword;
