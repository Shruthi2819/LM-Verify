/**
 * voiceParser — parses natural language inspection observations.
 * Matches spoken transcript segments against active measurements and checklists.
 */

// Convert text-based numeric descriptors into digit strings
function normalizeSpokenNumbers(text) {
  let lower = text.toLowerCase();
  
  const replacements = {
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10",
    "minus": "-",
    "negative": "-",
    "point": "."
  };

  // Safe token replacements to preserve decimal shapes
  Object.keys(replacements).forEach((word) => {
    // Replace word matches with boundaries
    const regex = new RegExp(`\\b${word}\\b`, "g");
    lower = lower.replace(regex, replacements[word]);
  });

  // Strip whitespaces inside numbers (e.g. "- 0 . 2" -> "-0.2")
  lower = lower.replace(/(-\s*)/g, "-");
  lower = lower.replace(/(\.\s*)/g, ".");
  lower = lower.replace(/(\d+)\s*\.\s*(\d+)/g, "$1.$2");
  lower = lower.replace(/(-\d+)\s*\.\s*(\d+)/g, "$1.$2");

  return lower;
}

export const voiceParser = {
  /**
   * Matches raw transcript text against current parameters.
   * @param {string} transcript - Speech text
   * @param {Array} parameters - List of GATC/LMO parameters (checklist + measurements)
   */
  parseObservation(transcript, parameters = []) {
    const rawText = transcript.trim();
    const normalizedText = normalizeSpokenNumbers(rawText);
    const words = normalizedText.split(/\s+/);

    // 1. Identify Parameter Match using overlap scoring
    let bestMatch = null;
    let maxScore = 0;

    const stopWords = new Set(["is", "are", "the", "a", "an", "condition", "check", "value", "test", "verification", "and", "or", "to", "be"]);

    parameters.forEach((param) => {
      const label = (param.label || param.testName || "").toLowerCase();
      const labelWords = label.split(/\s+/).filter(w => !stopWords.has(w));
      
      let score = 0;
      labelWords.forEach((lw) => {
        // Direct matching
        if (normalizedText.includes(lw)) score += 2;
        // Prefix matching
        else if (words.some(w => w.startsWith(lw) || lw.startsWith(w))) score += 1;
      });

      // Special synonym boosts
      if (label.includes("seal") && (normalizedText.includes("seal") || normalizedText.includes("sealing") || normalizedText.includes("intact"))) {
        score += 3;
      }
      if (label.includes("mark") && (normalizedText.includes("marking") || normalizedText.includes("plate") || normalizedText.includes("label"))) {
        score += 3;
      }
      if (label.includes("zero") && (normalizedText.includes("zero") || normalizedText.includes("balance") || normalizedText.includes("calibrate"))) {
        score += 3;
      }
      if (label.includes("half") && (normalizedText.includes("half") || normalizedText.includes("50%") || normalizedText.includes("500") || normalizedText.includes("250"))) {
        score += 3;
      }
      if (label.includes("full") && (normalizedText.includes("full") || normalizedText.includes("100%") || normalizedText.includes("1000") || normalizedText.includes("500"))) {
        score += 3;
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = param;
      }
    });

    // Determine parameter matching threshold confidence
    const confidence = maxScore > 0 ? Math.min(Math.round((maxScore / 8) * 100), 98) : 0;

    // 2. Value extraction
    let numericValue = null;
    const valueMatch = normalizedText.match(/(-?\d+(\.\d+)?)/);
    if (valueMatch) {
      numericValue = parseFloat(valueMatch[0]);
    }

    // 3. Unit extraction
    let unit = null;
    if (normalizedText.includes("kilogram") || normalizedText.includes("kilograms") || normalizedText.includes("kg")) {
      unit = "kg";
    } else if (normalizedText.includes("gram") || normalizedText.includes("grams") || normalizedText.includes("g")) {
      unit = "g";
    } else if (normalizedText.includes("milligram") || normalizedText.includes("milligrams") || normalizedText.includes("mg")) {
      unit = "mg";
    } else if (normalizedText.includes("millilitre") || normalizedText.includes("millilitres") || normalizedText.includes("ml")) {
      unit = "mL";
    } else if (normalizedText.includes("litre") || normalizedText.includes("litres") || normalizedText.includes("liters") || normalizedText.includes("liter") || normalizedText.includes("l")) {
      unit = "L";
    } else if (normalizedText.includes("cubic meters") || normalizedText.includes("cubic metres") || normalizedText.includes("m3") || normalizedText.includes("m³")) {
      unit = "m³";
    } else if (normalizedText.includes("meter") || normalizedText.includes("meters") || normalizedText.includes("metres") || normalizedText.includes("metre") || normalizedText.includes("m")) {
      unit = "m";
    }

    // 4. PASS/FAIL extraction
    let result = null;
    const passWords = ["satisfactory", "acceptable", "normal", "intact", "good condition", "working properly", "clear", "legible", "pass"];
    const failWords = ["damaged", "broken", "failed", "not satisfactory", "not acceptable", "illegible", "fail"];

    const hasPass = passWords.some(w => normalizedText.includes(w));
    const hasFail = failWords.some(w => normalizedText.includes(w));

    if (hasPass && !hasFail) {
      result = "PASS";
    } else if (hasFail && !hasPass) {
      result = "FAIL";
    }

    // Return the extracted model structure (Rule G)
    return {
      parameterId: bestMatch?.id || null,
      parameterLabel: bestMatch?.label || bestMatch?.testName || null,
      parameterType: bestMatch && ("standardValue" in bestMatch) ? "measurement" : "checklist",
      value: numericValue,
      unit: unit,
      result: result,
      confidence: bestMatch ? Math.max(confidence, 60) : 0,
      source: "voice",
      transcript: rawText
    };
  }
};
export default voiceParser;
