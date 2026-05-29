import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const UploadCloudIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto">
    <circle cx="24" cy="24" r="24" fill="#eff6ff"/>
    <path d="M16 30c-3.314 0-6-2.686-6-6a6 6 0 0 1 5.775-5.993A8 8 0 0 1 32 20h1a5 5 0 0 1 5 5v1a4 4 0 0 1-4 4H16z"
          fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5"/>
    <path d="M24 34V24M20 28l4-4 4 4" stroke="#2563eb" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DropZone({ onFilesSelected, disabled }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    disabled,
    noClick: true,
  });

  const borderColor = isDragReject
    ? "border-red-400 bg-red-50"
    : isDragActive
    ? "border-brand-500 bg-brand-50/60"
    : "border-surface-300 bg-surface-50 hover:border-brand-400 hover:bg-brand-50/30";

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl border-2 border-dashed px-8 py-10
                  transition-all duration-200 select-none
                  ${borderColor}
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        {...getInputProps({
          accept: "application/pdf,.pdf",
          multiple: true,
        })}
      />

      <UploadCloudIcon />

      <div className="mt-4 text-center">
        {isDragActive && !isDragReject ? (
          <p className="text-sm font-600 text-brand-600">Drop files here…</p>
        ) : isDragReject ? (
          <p className="text-sm font-600 text-red-600">Only PDF files are accepted</p>
        ) : (
          <>
            <p className="text-sm font-600 text-surface-900">
              Drop one or multiple PDF files here
            </p>
            <button
              type="button"
              onClick={open}
              disabled={disabled}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-brand-600
                         px-4 py-2 text-xs font-700 text-white shadow-sm transition-colors
                         hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Select PDFs
            </button>
            <p className="mt-1 text-xs text-surface-700">
              Supports PDF files · Multiple selection allowed
            </p>
          </>
        )}
      </div>

      {/* Decorative corner accents */}
      <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-brand-300 rounded-tl-sm" />
      <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-brand-300 rounded-tr-sm" />
      <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-brand-300 rounded-bl-sm" />
      <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-brand-300 rounded-br-sm" />
    </div>
  );
}
