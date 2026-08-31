import { useState, useEffect } from "react";
import { gatcService } from "../../services/gatcService";
import { useTheme } from "../../context/ThemeContext";
import Card from "../../components/common/Card";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ShieldCheck, Award, Mail, Phone, Calendar, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

function GATCProfile() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await gatcService.getProfile();
        setProfile(data);
      } catch (err) {
        toast.error("Failed to load GATC profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        <Breadcrumbs items={[{ label: "Dashboard", path: "/gatc/dashboard" }, { label: "Profile" }]} />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", path: "/gatc/dashboard" }, { label: "Profile" }]} />

      {profile && new Date(profile.accreditationExpiry) < new Date() && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-750 flex flex-col gap-1.5 shadow-sm">
          <span className="font-bold flex items-center gap-1">⚠️ NABL LICENSE ACCREDITATION EXPIRED</span>
          <p>Your Government Approved Test Centre authorization has expired. Official calibration testing actions are restricted. Please contact administrative authority.</p>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-slate-800">Test Centre Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage calibration facility parameters and NABL accreditations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Centre profile card */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                <Award size={32} className="text-blue-700" />
              </div>
              <h2 className="text-base font-bold text-slate-800">{profile.name}</h2>
              <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                ACCREDITATION: {profile.accreditationNumber}
              </span>
            </div>
            <div className="border-t border-slate-100 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Centre ID:</span>
                <span className="font-mono text-slate-700">{profile.centreId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accreditation Expiry:</span>
                <span className="font-semibold text-slate-700">{profile.accreditationExpiry}</span>
              </div>
            </div>
          </Card>

          {/* Theme appearance settings */}
          <Card>
            <div className="border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Appearance Settings</h3>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500">Choose your preferred interface theme style.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    theme === "light"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-750 hover:bg-slate-50"
                  }`}
                >
                  <Sun size={13} /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    theme === "dark"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-750 hover:bg-slate-50"
                  }`}
                >
                  <Moon size={13} /> Dark
                </button>
              </div>
              <div className="text-[9px] text-slate-400 font-medium">
                Active theme: <span className="capitalize font-bold text-slate-700">{theme}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Accreditation & Lab Details</h3>
            </Card.Header>
            <Card.Body className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 block">NABL Accrediting Body</span>
                  <span className="text-slate-800 font-semibold">{profile.department}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block">Jurisdiction District</span>
                  <span className="text-slate-800 font-semibold">{profile.jurisdiction}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-slate-400 block">Lab Manager</span>
                  <span className="text-slate-800 font-semibold">{profile.labManager}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block">Contact Phone</span>
                  <span className="text-slate-800 font-semibold">{profile.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-slate-400 block">Contact Email</span>
                  <span className="text-slate-800 font-semibold">{profile.email}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-500 mt-4 leading-relaxed">
                🔬 **Accredited Calibration Facility Notice:** GATC operations, standards checks, and calibration devices are audited under NABL specifications. Contact the department administration office to request license modifications.
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default GATCProfile;
