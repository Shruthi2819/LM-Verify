/**
 * VoiceService — central Web Speech API wrapper.
 * Provides cross-browser speech recognition support, listening controls,
 * and standard event dispatcher hooks.
 */
export class VoiceService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isSupported = !!this.recognition;

    if (this.isSupported) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-IN"; // English (India) as default locale
    }
  }

  startListening({ onStart, onResult, onError, onEnd }) {
    if (!this.isSupported) {
      if (onError) onError(new Error("Voice input is not supported in this browser."));
      return;
    }

    this.recognition.onstart = () => {
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      if (onResult) onResult(transcript, confidence);
    };

    this.recognition.onerror = (event) => {
      let errorMsg = "Voice processing failed. Please retry or enter manually.";
      if (event.error === "not-allowed") {
        errorMsg = "Microphone permission was denied. Please allow microphone access or enter the value manually.";
      } else if (event.error === "no-speech") {
        errorMsg = "Could not detect speech. Please try again.";
      }
      if (onError) onError(new Error(errorMsg));
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error("Stop listening error", err);
      }
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
