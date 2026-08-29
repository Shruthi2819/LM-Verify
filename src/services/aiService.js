import api from "./api";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const aiService = {
  /**
   * Analyze active inspection parameters using the database and dynamic entries.
   */
  async analyzeInspection(payload) {
    if (USE_MOCK) {
      await delay(800);
      const {
        inspectionId,
        instrumentId,
        instrumentType = "Digital Weighing Scale",
        serialNumber = "",
        checklist = [],
        measurements = [],
        observations = "",
        photos = []
      } = payload;

      // 1. Determine instrument-specific checks
      const type = (instrumentType || "Digital Weighing Scale").toLowerCase();
      let dynamicChecks = [];
      if (type.includes("flow")) {
        dynamicChecks = [
          "Verify flow direction indicator alignment with piping.",
          "Check magnetic housing lead seal condition.",
          "Perform double-pulse frequency dial readability test."
        ];
      } else if (type.includes("platform")) {
        dynamicChecks = [
          "Check bubble level indicator center positioning on platform base.",
          "Verify structural load cell corner alignment clearances.",
          "Inspect stamping seal wire attachment node."
        ];
      } else {
        dynamicChecks = [
          "Verify zero calibration status with no load.",
          "Inspect LCD digit display backlighting and segments.",
          "Verify calibration stamp seal lead stamping detail."
        ];
      }

      // 2. Compute evidence requirements completeness
      const requiredPhotos = [
        { key: "overall", label: "Overall Instrument Photo", match: "overall" },
        { key: "serial", label: "Serial Plate Photo", match: "serial" },
        { key: "seal", label: "Lead Wire Seal Photo", match: "seal" }
      ];

      const evidenceRecommendations = requiredPhotos.map((req) => {
        const fileMatch = photos.some((p) =>
          p.name.toLowerCase().includes(req.match) ||
          p.name.toLowerCase().includes("photo") ||
          p.name.toLowerCase().includes("img")
        );
        return {
          key: req.key,
          label: req.label,
          completed: fileMatch || photos.length > requiredPhotos.indexOf(req), // dynamic fallback
          severity: "MEDIUM"
        };
      });

      const evidenceCount = evidenceRecommendations.filter(r => r.completed).length;
      const evidenceCompleteness = Math.round((evidenceCount / requiredPhotos.length) * 100);

      // 3. Serial mismatch check (Application vs Database)
      const warnings = [];
      
      // Simulate serial mismatch dynamically for specific test scenarios
      if (serialNumber && (serialNumber.includes("mismatch") || serialNumber.toLowerCase() === "sn-67890")) {
        warnings.push({
          id: "warn-serial-mismatch",
          severity: "CRITICAL",
          title: "Potential Serial Number Mismatch",
          what: "The physical device serial number differs from the registered application.",
          why: "Application records state serial 'SN-12345' but the field entry states 'SN-67890'.",
          todo: "Verify the serial stamping physically and adjust the field index if typed incorrectly.",
          status: "OPEN"
        });
      }

      // 4. Inconsistent measurements check
      const measurementFindings = [];
      measurements.forEach((m) => {
        const obs = parseFloat(m.observedValue);
        const std = parseFloat(m.standardValue);
        if (!isNaN(obs) && !isNaN(std)) {
          const deviation = Math.abs(obs - std);
          // Flag large outliers/anomalies (possible typo)
          if (deviation > (std * 0.5) && std > 0) {
            warnings.push({
              id: `warn-measurement-anomaly-${m.id}`,
              severity: "HIGH",
              title: `Anomalous Calibration Value on ${m.testName}`,
              what: "Observed value deviates significantly from standard weight calibration.",
              why: `Standard weight is ${std} but observed entry is ${obs}. Outlier deviation of ${deviation.toFixed(2)} detected.`,
              todo: "Verify if this is a transcription error (decimal mismatch) before final report.",
              status: "OPEN"
            });
          } else if (deviation > 0.2) {
            measurementFindings.push({
              testId: m.id,
              testName: m.testName,
              deviation: deviation.toFixed(2),
              verdict: "Potential deviation warning. Review tolerances.",
              severity: "MEDIUM"
            });
          }
        }
      });

      // 5. Readiness & Risk Level
      const checklistComplete = checklist.length > 0 && checklist.every((c) => c.value);
      const measurementsComplete = measurements.length > 0 && measurements.every((m) => m.observedValue !== null && m.observedValue !== "");
      
      let readiness = "PARTIALLY_READY";
      if (checklistComplete && measurementsComplete && photos.length >= 2) {
        readiness = "READY";
      } else if (checklist.length === 0) {
        readiness = "NOT_READY";
      }

      let riskLevel = "MEDIUM";
      if (warnings.some(w => w.severity === "CRITICAL")) {
        riskLevel = "HIGH";
      } else if (readiness === "READY" && warnings.length === 0) {
        riskLevel = "LOW";
      }

      // 6. Confidence rating
      let confidence = 75;
      if (checklistComplete) confidence += 10;
      if (measurementsComplete) confidence += 10;
      if (photos.length >= 2) confidence += 5;
      confidence = Math.min(confidence, 98);

      // 7. Dynamic Actions
      const recommendations = [];
      if (!checklistComplete) recommendations.push("Complete all items on physical verification checklist");
      if (!measurementsComplete) recommendations.push("Provide observed values for all calibration checkpoints");
      if (photos.length === 0) recommendations.push("Acknowledge seal check and upload overall device photograph");
      if (warnings.length > 0) recommendations.push("Review and sign off on active validation alerts");
      if (recommendations.length === 0) recommendations.push("Review calibration summary report and sign digital stamp");

      return {
        readiness,
        riskLevel,
        confidence,
        checklistRecommendations: dynamicChecks,
        warnings,
        measurementFindings,
        evidenceRecommendations,
        evidenceCompleteness,
        recommendations,
        summary: `Inspection parameters verified for ${instrumentType}. Physical checklist completeness stands at ${checklistComplete ? "100%" : "Partial"}. Outlier anomaly alerts: ${warnings.length}. Ready for LMO sign-off.`,
        modelName: "LM-Verify Assistant Core v1.4 (Llama-3-Rules-Engine)",
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await api.post("/ai/inspection/analyze", payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "AI Analysis endpoint failed.");
    }
  }
};

export default aiService;
