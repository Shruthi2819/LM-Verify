import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, HelpCircle, ArrowRight, Calendar } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PredictionExplanationModal from "./PredictionExplanationModal";
import { calculatePredictiveCompliance, RISK_LEVELS } from "../../utils/predictiveCompliance";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

export function PredictiveComplianceCard({
  certificate,
  className = "",
  showActionButton = true
}) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (certificate) {
      setPrediction(calculatePredictiveCompliance(certificate));
    }
  }, [certificate]);

  if (!prediction) return null;

  const riskMeta = RISK_LEVELS[prediction.riskLevel] || RISK_LEVELS.LOW;

  const handleStartReverification = () => {
    navigate(`${ROUTES.BUSINESS_APPLICATIONS_NEW}?instrumentId=${prediction.instrumentId}&type=RENEWAL`);
  };

  return (
    <>
      <Card className={`border border-slate-200 dark:border-slate-800 ${className}`}>
        <Card.Header className="border-b border-slate-100 pb-2.5 mb-3 flex justify-between items-center dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-blue-700 dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Predictive Compliance & Expiry
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskMeta.badgeClass}`}>
            {prediction.riskLevel} RISK
          </span>
        </Card.Header>

        <Card.Body className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/70 rounded-lg border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Days Remaining</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {prediction.daysRemaining > 0 ? `${prediction.daysRemaining} days` : "EXPIRED"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Recommended Start</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {prediction.recommendedStartDate}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {prediction.recommendation}
          </p>

          <div className="flex gap-2 pt-1 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
              leftIcon={<HelpCircle size={12} />}
            >
              Why this recommendation?
            </Button>
            {showActionButton && prediction.daysRemaining <= prediction.totalRequiredLeadTime && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartReverification}
                rightIcon={<ArrowRight size={12} />}
              >
                Start Re-verification
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <PredictionExplanationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prediction={prediction}
        onStartReverification={handleStartReverification}
      />
    </>
  );
}

export default PredictiveComplianceCard;
