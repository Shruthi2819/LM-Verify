import { useState, useEffect } from "react";
import { lmoService } from "../../services/lmoService";
import Card from "../../components/common/Card";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { User, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import toast from "react-hot-toast";

function LMOProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await lmoService.getProfile();
        setProfile(data);
      } catch (err) {
        toast.error("Failed to load LMO profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Breadcrumbs items={[{ label: "Dashboard", path: "/lmo/dashboard" }, { label: "Profile" }]} />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", path: "/lmo/dashboard" }, { label: "Profile" }]} />

      <div>
        <h1 className="text-xl font-bold text-slate-800">Officer Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your government credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Officer summary card */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                <ShieldCheck size={32} className="text-blue-700" />
              </div>
              <h2 className="text-base font-bold text-slate-800">{profile.name}</h2>
              <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                {profile.designation}
              </span>
            </div>
            <div className="border-t border-slate-100 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Officer ID:</span>
                <span className="font-mono text-slate-700">{profile.officerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jurisdiction:</span>
                <span className="font-semibold text-slate-700 text-right">{profile.jurisdiction}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Official Profile Credentials</h3>
            </Card.Header>
            <Card.Body className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 block">Department / Agency</span>
                  <span className="text-slate-800 font-semibold">{profile.department}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block">Jurisdiction Office Area</span>
                  <span className="text-slate-800 font-semibold">{profile.jurisdiction}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-slate-400 block">Email Address</span>
                  <span className="text-slate-800 font-semibold">{profile.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block">Official Contact</span>
                  <span className="text-slate-800 font-semibold">{profile.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-slate-400 block">Official Appointment Date</span>
                  <span className="text-slate-800 font-semibold">{new Date(profile.joiningDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-500 mt-4 leading-relaxed">
                👮 **Officer Credentials Information Notice:** These attributes are managed and validated through administrative services. Contact your division metrology lead to correct any inaccuracies.
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LMOProfile;
