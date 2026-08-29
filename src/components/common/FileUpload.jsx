import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import Button from "./Button";

/**
 * FileUpload — drag-and-drop or click-to-browse file picker.
 *
 * @param {string} label
 * @param {boolean} required
 * @param {string} accept - MIME types or extensions e.g. ".pdf,.jpg"
 * @param {boolean} multiple
 * @param {function} onChange - (files: FileList) => void
 * @param {string} error
 * @param {string} helperText
 */
function FileUpload({ label, required, accept, multiple = false, onChange, error, helperText }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFiles = (incoming) => {
    const arr = Array.from(incoming);
    setFiles(arr);
    onChange?.(incoming);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragging
            ? "border-blue-500 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm text-slate-600">
          Drag & drop files here or{" "}
          <span className="text-blue-600 font-medium">browse</span>
        </p>
        {helperText && <p className="text-xs text-slate-400 mt-1">{helperText}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 rounded px-3 py-1.5">
              <FileText size={13} className="text-slate-400" />
              <span className="flex-1 truncate">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-600 flex items-center gap-1"><span>⚠</span> {error}</p>}
    </div>
  );
}

export default FileUpload;
