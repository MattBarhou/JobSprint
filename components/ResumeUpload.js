"use client";

import { useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export default function ResumeUpload({
  resumeText,
  onResumeTextChange,
  disabled,
  hasError,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  async function processFile(file) {
    setParseError("");

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setParseError("Only PDF files are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setParseError("File must be 5 MB or smaller.");
      return;
    }

    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setParseError(data.error || "Could not read this PDF.");
        return;
      }

      onResumeTextChange(data.text);
      setUploadedFile({
        name: data.fileName,
        pageCount: data.pageCount,
      });
    } catch {
      setParseError("Network error while uploading. Please try again.");
    } finally {
      setIsParsing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e) {
    processFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isParsing) {
      return;
    }
    processFile(e.dataTransfer.files?.[0]);
  }

  function handleManualEdit(e) {
    onResumeTextChange(e.target.value);
    if (parseError) {
      setParseError("");
    }
  }

  function clearUpload() {
    onResumeTextChange("");
    setUploadedFile(null);
    setParseError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="form-control">
      <label className="label py-1" htmlFor="resumeText">
        <span className="label-text font-semibold text-base-content">Resume</span>
        <span className="text-xs font-semibold text-error">Required</span>
      </label>

      <input
        ref={inputRef}
        id="resumeFile"
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isParsing}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isParsing) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : hasError
              ? "border-error/50 bg-error/5"
              : "border-base-300 bg-base-200/30"
        }`}
      >
        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 text-base-content/70">
              <UploadIcon />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-base-content">
                Upload your resume PDF
              </p>
              <p className="text-xs text-base-content/75 mt-0.5">
                Drag and drop, or browse — max 5 MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isParsing}
            className="btn btn-outline btn-sm h-9 min-h-9 shrink-0"
          >
            {isParsing ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                Extracting…
              </>
            ) : (
              "Choose PDF"
            )}
          </button>
        </div>
      </div>

      {uploadedFile && (
        <div className="flex items-center justify-between gap-3 mt-3 px-3 py-2 rounded-lg border border-base-300 bg-base-200/40">
          <div className="flex items-center gap-2 min-w-0 text-sm text-base-content/85">
            <FileIcon />
            <span className="truncate">{uploadedFile.name}</span>
            <span className="text-xs text-base-content/65 shrink-0">
              {uploadedFile.pageCount} page
              {uploadedFile.pageCount === 1 ? "" : "s"}
            </span>
          </div>
          <button
            type="button"
            onClick={clearUpload}
            disabled={disabled || isParsing}
            className="btn btn-ghost btn-xs h-7 min-h-7 text-base-content/70"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-base-300" />
        <span className="text-[11px] uppercase tracking-wider text-base-content/60 font-medium">
          or paste text
        </span>
        <div className="h-px flex-1 bg-base-300" />
      </div>

      <textarea
        id="resumeText"
        name="resumeText"
        className={`textarea textarea-bordered h-40 w-full text-base-content placeholder:text-base-content/45 focus:textarea-primary ${hasError ? "textarea-error" : ""}`}
        placeholder="Paste your resume here if you don't have a PDF handy…"
        value={resumeText}
        onChange={handleManualEdit}
        disabled={disabled || isParsing}
      />

      {parseError && (
        <label className="label py-1">
          <span className="text-sm font-medium text-error">{parseError}</span>
        </label>
      )}
    </div>
  );
}
