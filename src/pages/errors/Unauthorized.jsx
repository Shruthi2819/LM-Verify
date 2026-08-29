import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { ROUTES } from "../../config/routes";
import Button from "../../components/common/Button";

function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
          <p className="text-slate-500 text-sm mt-2">
            You do not have permission to view this page. This section requires a different role.
          </p>
          <p className="text-xs text-slate-400 mt-3 bg-slate-100 rounded-lg p-3">
            If you believe you should have access, please contact your administrator.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline">Sign In with Another Account</Button>
          </Link>
          <Link to={ROUTES.HOME}>
            <Button variant="primary">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
