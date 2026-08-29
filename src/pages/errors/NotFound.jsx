import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { ROUTES } from "../../config/routes";
import Button from "../../components/common/Button";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="text-8xl font-bold text-slate-200 leading-none">404</div>
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <FileQuestion size={28} className="text-slate-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
          <p className="text-slate-500 text-sm mt-2">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>
        <Link to={ROUTES.HOME}>
          <Button variant="primary">Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
