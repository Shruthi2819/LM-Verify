/**
 * Compliance Service
 * Backend communication layer for Predictive Compliance, Expiry Heatmaps, and Risk Analysis.
 */
import api from "./api";
import { localCertificates } from "./publicVerificationService";
import { mockCertificates } from "../mock/certificateData";
import { calculatePredictiveCompliance, EXPIRY_HORIZONS } from "../utils/predictiveCompliance";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const complianceService = {
  /**
   * Get overall predictive compliance dashboard statistics and expiry heatmap distribution
   */
  async getComplianceOverview(params = {}) {
    if (USE_MOCK) {
      await delay(500);
      const certs = (localCertificates && localCertificates.length > 0) ? localCertificates : mockCertificates;
      
      const analyzed = certs.map(c => calculatePredictiveCompliance(c));

      // Calculate Heatmap distribution
      const heatmap = EXPIRY_HORIZONS.map(h => {
        const matching = analyzed.filter(a => a.horizon.key === h.key);
        return {
          key: h.key,
          label: h.label,
          count: matching.length,
          color: h.color
        };
      });

      const expiredCount = analyzed.filter(a => a.daysRemaining <= 0).length;
      const criticalCount = analyzed.filter(a => a.riskLevel === "CRITICAL").length;
      const highCount = analyzed.filter(a => a.riskLevel === "HIGH").length;
      const mediumCount = analyzed.filter(a => a.riskLevel === "MEDIUM").length;
      const expiringSoonCount = analyzed.filter(a => a.daysRemaining > 0 && a.daysRemaining <= 30).length;
      const recommendedActionCount = criticalCount + highCount;

      return {
        totalCertificates: certs.length,
        expiringWithin30Days: expiringSoonCount,
        expiredCount,
        criticalCount,
        highCount,
        mediumCount,
        recommendedActionCount,
        avgProcessingTimeDays: 11.8,
        medianProcessingDays: 10.0,
        historicalDelayRatePercent: 14.5,
        avgDelayDays: 3.8,
        heatmap,
        lastAnalyzedAt: new Date().toISOString()
      };
    }

    try {
      const response = await api.get("/compliance/overview", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch predictive compliance overview.");
    }
  },

  /**
   * Get list of certificates with full predictive risk scores and filtering
   */
  async getExpiringCertificates(params = {}) {
    if (USE_MOCK) {
      await delay(500);
      const { search, risk, horizon, status } = params;
      const certs = (localCertificates && localCertificates.length > 0) ? localCertificates : mockCertificates;
      
      let list = certs.map(c => calculatePredictiveCompliance(c));

      if (search) {
        const q = search.toLowerCase();
        list = list.filter(item =>
          item.certificateId.toLowerCase().includes(q) ||
          item.instrumentName.toLowerCase().includes(q) ||
          item.instrumentId.toLowerCase().includes(q) ||
          item.businessName.toLowerCase().includes(q)
        );
      }

      if (risk) {
        list = list.filter(item => item.riskLevel.toLowerCase() === risk.toLowerCase());
      }

      if (horizon) {
        list = list.filter(item => item.horizon.key.toLowerCase() === horizon.toLowerCase());
      }

      if (status) {
        list = list.filter(item => item.status.toLowerCase() === status.toLowerCase());
      }

      // Sort by daysRemaining ascending (most urgent first)
      list.sort((a, b) => a.daysRemaining - b.daysRemaining);

      return list;
    }

    try {
      const response = await api.get("/compliance/expiring-certificates", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch expiring certificates.");
    }
  },

  /**
   * Get single certificate predictive dossier
   */
  async getCertificatePrediction(certificateId) {
    if (USE_MOCK) {
      await delay(300);
      const certs = (localCertificates && localCertificates.length > 0) ? localCertificates : mockCertificates;
      const cert = certs.find(c => c.id.toUpperCase() === certificateId.toUpperCase()) || certs[0];
      return calculatePredictiveCompliance(cert);
    }

    try {
      const response = await api.get(`/compliance/certificates/${certificateId}/prediction`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch certificate prediction details.");
    }
  }
};

export default complianceService;
