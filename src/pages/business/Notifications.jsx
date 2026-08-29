import { useState, useEffect } from "react";
import { notificationService } from "../../services/notificationService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { formatDate } from "../../utils/helpers";
import { Bell, Check, Clock, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      toast.error("Failed to update notification.");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-600" />;
      case "error":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getBg = (type, read) => {
    if (read) return "bg-white border-slate-200";
    switch (type) {
      case "success":
        return "bg-green-50/40 border-green-100";
      case "warning":
        return "bg-amber-50/40 border-amber-100";
      case "error":
        return "bg-red-50/40 border-red-100";
      default:
        return "bg-blue-50/40 border-blue-100";
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD }, { label: "Notifications" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Stay updated on your verification processes</p>
        </div>
      </div>

      {loading ? (
        <PanelSkeleton />
      ) : notifications.length === 0 ? (
        <Card className="text-center py-10 space-y-3">
          <Bell size={32} className="text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">You have no notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={[
                "flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 shadow-sm",
                getBg(notif.type, notif.read)
              ].join(" ")}
            >
              <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <p className={["text-sm", notif.read ? "text-slate-700" : "font-bold text-slate-800"].join(" ")}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="flex-shrink-0 p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-700 transition-colors"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
