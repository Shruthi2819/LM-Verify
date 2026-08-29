import { useReducer, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { instrumentService } from "../../services/instrumentService";
import { applicationService } from "../../services/applicationService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import FileUpload from "../../components/common/FileUpload";
import DocumentList from "../../components/common/DocumentList";
import FormStepper from "../../components/common/FormStepper";
import Breadcrumbs from "../../components/navigation/Breadcrumbs";
import StatusBadge from "../../components/feedback/StatusBadge";
import { PanelSkeleton } from "../../components/common/SkeletonLoader";
import { ROUTES, buildPath } from "../../config/routes";
import { APPLICATION_TYPES, ACCEPTED_DOC_TYPES } from "../../utils/constants";
import { ShieldCheck, CheckCircle2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Select Instrument", "Application Type", "Add Details", "Upload Documents", "Review", "Submit"];

const initialState = {
  step: 1,
  instrumentId: "",
  instrument: null,
  applicationType: "",
  notes: "",
  documents: [],
  submittedApplication: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SELECT_INSTRUMENT":
      return { ...state, instrumentId: action.payload.id, instrument: action.payload };
    case "SET_TYPE":
      return { ...state, applicationType: action.payload };
    case "SET_NOTES":
      return { ...state, notes: action.payload };
    case "ADD_DOCUMENTS":
      return { ...state, documents: [...state.documents, ...action.payload] };
    case "REMOVE_DOCUMENT":
      return { ...state, documents: state.documents.filter((d) => d.id !== action.payload) };
    case "SUBMIT_SUCCESS":
      return { ...state, submittedApplication: action.payload, step: 6 };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function NewApplication() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [instruments, setInstruments] = useState([]);
  const [instrumentsLoading, setInstrumentsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch instruments for dropdown selection
  useEffect(() => {
    async function loadInstruments() {
      try {
        const response = await instrumentService.getInstruments({ limit: 100 });
        const list = response.items || [];
        setInstruments(list);

        // Pre-fill if navigated from Instrument details
        const prefilledId = location.state?.prefilledInstrumentId;
        if (prefilledId) {
          const matched = list.find((ins) => ins.id === prefilledId);
          if (matched) dispatch({ type: "SELECT_INSTRUMENT", payload: matched });
        }
      } catch (err) {
        toast.error("Failed to load registered instruments.");
      } finally {
        setInstrumentsLoading(false);
      }
    }
    loadInstruments();
  }, [location.state]);

  const handleInstrumentChange = (e) => {
    const matched = instruments.find((ins) => ins.id === e.target.value);
    if (matched) {
      dispatch({ type: "SELECT_INSTRUMENT", payload: matched });
    }
  };

  const handleFileUpload = async (files) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((f) =>
        applicationService.uploadApplicationDocument("new-draft", f)
      );
      const results = await Promise.all(uploadPromises);
      dispatch({ type: "ADD_DOCUMENTS", payload: results });
      toast.success("Documents uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to upload documents.");
    } finally {
      setUploading(false);
    }
  };

  const nextStep = () => {
    if (state.step === 1 && !state.instrumentId) {
      toast.error("Please select an instrument.");
      return;
    }
    if (state.step === 2 && !state.applicationType) {
      toast.error("Please select an application type.");
      return;
    }
    if (state.step === 4 && state.documents.length === 0) {
      toast.error("Please upload at least one supporting document.");
      return;
    }
    dispatch({ type: "SET_STEP", payload: state.step + 1 });
  };

  const prevStep = () => {
    dispatch({ type: "SET_STEP", payload: state.step - 1 });
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      const payload = {
        instrumentId: state.instrumentId,
        instrumentName: state.instrument.type,
        instrumentSerial: state.instrument.serialNumber,
        type: state.applicationType,
        notes: state.notes,
        documents: state.documents,
      };
      const response = await applicationService.createApplication(payload);
      dispatch({ type: "SUBMIT_SUCCESS", payload: response });
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to submit application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (instrumentsLoading) {
    return (
      <div className="space-y-6 page-enter max-w-3xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
            { label: "Applications", path: ROUTES.BUSINESS_APPLICATIONS },
            { label: "New" }
          ]}
        />
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-3xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD },
          { label: "Applications", path: ROUTES.BUSINESS_APPLICATIONS },
          { label: "New" }
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Verification Application</h1>
        <p className="text-sm text-slate-500 mt-0.5">Submit an instrument for certification review</p>
        <FormStepper steps={STEPS} currentStep={state.step} />
      </div>

      {/* Step Components */}
      <div className="min-h-64">
        {state.step === 1 && (
          <Card className="space-y-4">
            <Card.Header>
              <h2 className="text-sm font-bold text-slate-800">Select Instrument</h2>
              <p className="text-xs text-slate-500">Choose from your registered Legal Metrology instruments</p>
            </Card.Header>
            <Card.Body className="space-y-4 pt-2">
              <Select
                label="Registered Device"
                required
                value={state.instrumentId}
                onChange={handleInstrumentChange}
                options={instruments.map((ins) => ({
                  value: ins.id,
                  label: `${ins.type} (Serial: ${ins.serialNumber} · ID: ${ins.id})`,
                }))}
                placeholder="Choose an instrument"
              />

              {state.instrument && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2 mt-4">
                  <p className="font-semibold text-slate-700">Device Specifications</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <p>Manufacturer: <span className="font-medium text-slate-800">{state.instrument.manufacturer}</span></p>
                    <p>Model: <span className="font-medium text-slate-800">{state.instrument.model}</span></p>
                    <p>Capacity: <span className="font-medium text-slate-800">{state.instrument.capacity}</span></p>
                    <p>Status: <span className="font-medium text-slate-800">{state.instrument.verificationStatus}</span></p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {state.step === 2 && (
          <Card className="space-y-4">
            <Card.Header>
              <h2 className="text-sm font-bold text-slate-800">Application Type</h2>
              <p className="text-xs text-slate-500">Specify whether this is a new device or re-verification renewal</p>
            </Card.Header>
            <Card.Body className="space-y-4 pt-2">
              <Select
                label="Application Category"
                required
                value={state.applicationType}
                onChange={(e) => dispatch({ type: "SET_TYPE", payload: e.target.value })}
                options={APPLICATION_TYPES}
                placeholder="Select category"
              />
            </Card.Body>
          </Card>
        )}

        {state.step === 3 && (
          <Card className="space-y-4">
            <Card.Header>
              <h2 className="text-sm font-bold text-slate-800">Additional Details</h2>
              <p className="text-xs text-slate-500">Provide any specific requests or instructions for the officer (optional)</p>
            </Card.Header>
            <Card.Body className="space-y-4 pt-2">
              <Textarea
                label="Submission Notes / Comments"
                placeholder="Include details about installation environment, preferred schedules, or previous inspection findings..."
                rows={5}
                value={state.notes}
                onChange={(e) => dispatch({ type: "SET_NOTES", payload: e.target.value })}
              />
            </Card.Body>
          </Card>
        )}

        {state.step === 4 && (
          <Card className="space-y-4">
            <Card.Header>
              <h2 className="text-sm font-bold text-slate-800">Supporting Documents</h2>
              <p className="text-xs text-slate-500">Upload purchase invoices, specifications sheets, or previous certificates</p>
            </Card.Header>
            <Card.Body className="space-y-4 pt-2">
              <FileUpload
                label="Attachments"
                required
                accept={ACCEPTED_DOC_TYPES}
                helperText="Upload files in PDF, PNG, or JPG formats (Max 10MB per file)"
                onChange={handleFileUpload}
                loading={uploading}
              />
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Uploaded Document Attachments</p>
                <DocumentList
                  documents={state.documents}
                  onRemove={(id) => dispatch({ type: "REMOVE_DOCUMENT", payload: id })}
                />
              </div>
            </Card.Body>
          </Card>
        )}

        {state.step === 5 && (
          <Card className="space-y-4">
            <Card.Header>
              <h2 className="text-sm font-bold text-slate-800">Review Application</h2>
              <p className="text-xs text-slate-500">Verify information before submitting to the Legal Metrology department</p>
            </Card.Header>
            <Card.Body className="space-y-4 pt-2 text-xs divide-y divide-slate-100">
              <div className="py-2">
                <p className="font-semibold text-slate-500 uppercase tracking-wider mb-2">Selected Instrument</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p>Type: <span className="font-medium text-slate-900">{state.instrument?.type}</span></p>
                  <p>Serial Number: <span className="font-medium text-slate-900">{state.instrument?.serialNumber}</span></p>
                </div>
              </div>
              <div className="py-3">
                <p className="font-semibold text-slate-500 uppercase tracking-wider mb-2">Application Specifications</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p>Category: <span className="font-medium text-slate-900 capitalize">{state.applicationType}</span></p>
                  <p>Notes: <span className="font-medium text-slate-900">{state.notes || "No notes added"}</span></p>
                </div>
              </div>
              <div className="py-3">
                <p className="font-semibold text-slate-500 uppercase tracking-wider mb-2">Attachments ({state.documents.length})</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {state.documents.map((doc) => (
                    <li key={doc.id}>{doc.name} ({doc.size})</li>
                  ))}
                </ul>
              </div>
            </Card.Body>
          </Card>
        )}

        {state.step === 6 && state.submittedApplication && (
          <Card className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Application Submitted</h2>
              <p className="text-xs text-slate-500 mt-1">Your verification application was submitted successfully</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-sm mx-auto text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Application ID:</span>
                <span className="font-mono font-bold text-slate-800">{state.submittedApplication.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Instrument Serial:</span>
                <span className="font-mono text-slate-800">{state.submittedApplication.instrumentSerial}</span>
              </div>
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.BUSINESS_DASHBOARD)}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  navigate(
                    buildPath(ROUTES.BUSINESS_APPLICATION_DETAIL, {
                      applicationId: state.submittedApplication.id,
                    })
                  )
                }
              >
                Track Application
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      {state.step < 6 && (
        <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ChevronLeft size={14} />}
            disabled={state.step === 1 || submitLoading}
            onClick={prevStep}
          >
            Back
          </Button>

          {state.step < 5 ? (
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              onClick={nextStep}
              disabled={uploading}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              loading={submitLoading}
              onClick={handleSubmit}
            >
              Submit Application
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default NewApplication;
