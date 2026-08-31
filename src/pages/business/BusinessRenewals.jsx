import React, { useState, useEffect } from "react";
import { ShieldAlert, Search, Filter, RefreshCw, Calendar, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import ExpiryHeatmap from "../../components/common/ExpiryHeatmap";
import PredictionExplanationModal from "../../components/common/PredictionExplanationModal";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES } from "../../config/routes";
import { complianceService } from "../../services/complianceService";
import { RISK_LEVELS } from "../../utils/predictiveCompliance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function BusinessRenewals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [horizonFilter, setHorizonFilter] = useState("");

  // Modal explanation
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, list] = await Promise.all([
        complianceService.getComplianceOverview(),
        complianceService.getExpiringCertificates({
          search: search.trim(),
          risk: riskFilter,
          horizon: horizonFilter
        })
      ]);
      setOverview(ov);
      setCertificates(list || []);
    } catch (err) {
      toast.error("Failed to load renewal and compliance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [riskFilter, horizonFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleStartReverification = (pred) => {
    navigate(`${ROUTES.BUSINESS_APPLICATIONS_NEW}?instrumentId=${pred.instrumentId}&type=RENEWAL`);
  };

  const columns = [
    {
      key: "certificateId",
      header: "Certificate",
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400 block">{r.certificateId}</span>
          <span className="text-[10px] text-slate-400">{r.instrumentId}</span>
        </div>
      )
    },
    {
      key: "instrumentName",
      header: "Instrument",
      render: (r) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{r.instrumentName}</span>
    },
    {
      key: "expiryDate",
      header: "Expiry Date",
      render: (r) => (
        <div>
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">{r.expiryDate}</span>
          <span className={`text-[10px] font-bold ${r.daysRemaining <= 0 ? "text-red-600" : r.daysRemaining <= 15 ? "text-amber-600" : "text-slate-400"}`}>
            {r.daysRemaining <= 0 ? "EXPIRED" : `${r.daysRemaining} days left`}
          </span>
        </div>
      )
    },
    {
      key: "recommendedStartDate",
      header: "Recommended Action Date",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {r.recommendedStartDate}
        </span>
      )
    },
    {
      key: "riskLevel",
      header: "Compliance Risk",
      render: (r) => {
        const meta = RISK_LEVELS[r.riskLevel] || RISK_LEVELS.LOW;
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeClass}`}>
            {r.riskLevel}
          </span>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] h-7 py-0 px-2"
            onClick={() => {
              setSelectedPrediction(r);
              setModalOpen(true);
            }}
          >
            Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="text-[11px] h-7 py-0 px-2"
            onClick={() => handleStartReverification(r)}
          >
            Renew
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
          { label: "Predictive Compliance & Renewals" }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 dark:bg-slate-800 dark:border-slate-700">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Predictive Compliance & Instrument Renewals
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Intelligent lead-time forecasting to prevent operational expiry and metrology non-compliance
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw size={12} />}>
          Refresh Analytics
        </Button>
      </div>

      {/* Summary Stat Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Expiring in 30 Days</span>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 block mt-1">
              {overview.expiringWithin30Days}
            </span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-red-500 uppercase font-semibold">Critical Risk</span>
            <span className="text-xl font-bold text-red-600 block mt-1">
              {overview.criticalCount}
            </span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-amber-500 uppercase font-semibold">Action Overdue</span>
            <span className="text-xl font-bold text-amber-600 block mt-1">
              {overview.highCount}
            </span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] text-blue-500 uppercase font-semibold">Avg Processing Time</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400 block mt-1">
              {overview.avgProcessingTimeDays} days
            </span>
          </div>
        </div>
      )}

      {/* Expiry Heatmap */}
      {overview && (
        <Card noPadding className="p-4">
          <ExpiryHeatmap
            heatmap={overview.heatmap}
            selectedHorizon={horizonFilter}
            onSelectHorizon={setHorizonFilter}
          />
        </Card>
      )}

      {/* Filter and Search Bar */}
      <Card noPadding className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by Certificate ID, Instrument Name, or Serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </Select>
          </div>
          <Button type="submit" variant="primary">
            Filter
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={4} cols={6} />
          </div>
        ) : (
          <Table
            columns={columns}
            data={certificates}
            emptyTitle="No instruments approaching expiry"
            emptyDescription="All active registered instruments have sufficient compliance buffer."
          />
        )}
      </Card>

      <PredictionExplanationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prediction={selectedPrediction}
        onStartReverification={handleStartReverification}
      />
    </div>
  );
}

export default BusinessRenewals;
