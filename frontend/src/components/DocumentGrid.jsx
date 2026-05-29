import React from "react";
import { format } from "date-fns";
import { downloadUrl } from "../services/api";

const fmtBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const STATUS_STYLES = {
  PENDING:   "bg-surface-100 text-surface-700 ring-surface-300",
  UPLOADING: "bg-blue-50 text-blue-700 ring-blue-300",
  COMPLETE:  "bg-emerald-50 text-emerald-700 ring-emerald-300",
  FAILED:    "bg-red-50 text-red-700 ring-red-300",
};

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
    <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function DocumentGrid({ documents, loading, onDelete }) {
  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent
                        rounded-full animate-spin"/>
        <p className="mt-3 text-sm text-surface-700">Loading documents…</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-surface-100 flex items-center
                        justify-center mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-surface-700">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor" strokeWidth="1.5"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="text-sm font-500 text-surface-900">No documents yet</p>
        <p className="text-xs text-surface-700 mt-1">Upload a PDF to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200">
            <th className="text-left py-3 px-4 text-xs font-600 text-surface-700
                           uppercase tracking-wide">
              File Name
            </th>
            <th className="text-left py-3 px-4 text-xs font-600 text-surface-700
                           uppercase tracking-wide hidden sm:table-cell">
              Size
            </th>
            <th className="text-left py-3 px-4 text-xs font-600 text-surface-700
                           uppercase tracking-wide hidden md:table-cell">
              Uploaded
            </th>
            <th className="text-left py-3 px-4 text-xs font-600 text-surface-700
                           uppercase tracking-wide">
              Status
            </th>
            <th className="text-right py-3 px-4 text-xs font-600 text-surface-700
                           uppercase tracking-wide">
              Download
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, i) => (
            <tr
              key={doc.id}
              className={`border-b border-surface-100 transition-colors duration-150
                          hover:bg-surface-50
                          ${i % 2 === 0 ? "" : "bg-surface-50/40"}`}
            >
              {/* Name */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 border
                                   border-red-100 flex items-center justify-center
                                   text-[9px] font-bold text-red-600">
                    PDF
                  </span>
                  <span className="font-500 text-surface-900 truncate max-w-[200px]"
                        title={doc.fileName}>
                    {doc.fileName}
                  </span>
                </div>
              </td>

              {/* Size */}
              <td className="py-3 px-4 text-surface-700 hidden sm:table-cell">
                {fmtBytes(doc.fileSize)}
              </td>

              {/* Date */}
              <td className="py-3 px-4 text-surface-700 hidden md:table-cell">
                {doc.uploadDate
                  ? format(new Date(doc.uploadDate), "MMM d, yyyy HH:mm")
                  : "—"}
              </td>

              {/* Status */}
              <td className="py-3 px-4">
                <span className={`status-badge ring-1 ${STATUS_STYLES[doc.status] || ""}`}>
                  {doc.status}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3 px-4 text-right">
                <div className="inline-flex items-center gap-3 justify-end">
                  {doc.status === "COMPLETE" ? (
                    <a
                      href={downloadUrl(doc.id)}
                      download={doc.fileName}
                      className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800
                                 font-500 text-xs transition-colors duration-150"
                    >
                      <DownloadIcon />
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-surface-300">—</span>
                  )}

                  <button
                    onClick={() => onDelete && onDelete(doc.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-500 px-2 py-1 rounded-md
                               border border-red-100 bg-red-50/40 transition-colors duration-150"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
