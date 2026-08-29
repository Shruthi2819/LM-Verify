import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || "Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
          <Mail size={24} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Check your email</h2>
        <p className="text-sm text-slate-500">
          If an account exists with that email address, you will receive a password reset link shortly.
        </p>
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Forgot Password</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

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

        <Button type="submit" variant="primary" className="w-full" loading={loading} size="lg">
          Send Reset Link
        </Button>
      </form>

      <Link to={ROUTES.LOGIN} className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Back to Sign In
      </Link>
    </div>
  );
}

export default ForgotPassword;
