import React, { useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   bar: "bg-surface-300",  text: "text-surface-700", bg: "bg-surface-100" },
  UPLOADING: { label: "Uploading", bar: "bg-brand-500",    text: "text-brand-700",   bg: "bg-brand-50"    },
  COMPLETE:  { label: "Complete",  bar: "bg-emerald-500",  text: "text-emerald-700", bg: "bg-emerald-50"  },
  FAILED:    { label: "Failed",    bar: "bg-red-500",      text: "text-red-700",     bg: "bg-red-50"      },
};

function FileRow({ item }) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
  return (
    <div className={`rounded-xl p-3.5 border border-surface-200 ${cfg.bg}
                     transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* PDF icon */}
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-100 flex items-center
                           justify-center text-[9px] font-bold text-red-600">
            PDF
          </span>
          <span className="text-xs font-600 text-surface-900 truncate max-w-[200px]">
            {item.fileName}
          </span>
          <span className="text-[10px] text-surface-700 flex-shrink-0">
            {fmtBytes(item.fileSize)}
          </span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                          ${cfg.text} ${cfg.bg} ring-1 ring-current/20`}>
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cfg.bar}
                      ${item.status === "UPLOADING" ? "animate-pulse-soft" : ""}`}
          style={{ width: `${item.progressPercent ?? 0}%` }}
        />
      </div>
      <div className="mt-1 flex justify-end">
        <span className="text-[10px] text-surface-700">
          {item.progressPercent ?? 0}%
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function UploadProgress({ items, batchMode, batchFileCount }) {
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  // ── Scenario B: Batch banner (> 3 files) ─────────────────────────────────
  if (batchMode) {
    const completed = items.filter((i) => i.status === "COMPLETE").length;
    const failed    = items.filter((i) => i.status === "FAILED").length;
    const uploading = items.filter((i) => i.status === "UPLOADING").length;
    const allDone   = completed + failed === batchFileCount;

    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 overflow-hidden">
        {/* Banner row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                          ${allDone ? "bg-emerald-100" : "bg-brand-100"}`}>
            {allDone ? (
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M4 10l4.5 4.5L16 6" stroke="#059669" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none"
                   className="w-4 h-4 text-brand-600 animate-spin">
                <path d="M10 3.5a6.5 6.5 0 1 1-6.5 6.5"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {allDone ? (
              <p className="text-sm font-600 text-emerald-700">
                {completed} file{completed !== 1 ? "s" : ""} uploaded successfully
                {failed > 0 && ` · ${failed} failed`}
              </p>
            ) : (
              <p className="text-sm font-600 text-brand-700">
                Upload in progress — processing {batchFileCount} files in background
              </p>
            )}
            <p className="text-xs text-surface-700 mt-0.5">
              {completed} complete · {uploading} uploading ·{" "}
              {items.filter((i) => i.status === "PENDING").length} pending
            </p>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-ghost text-brand-700 hover:bg-brand-100"
          >
            {expanded ? "Collapse" : "Details"}
            <svg viewBox="0 0 16 16" fill="none" className={`w-3 h-3 transition-transform
                  ${expanded ? "rotate-180" : ""}`}>
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Collapsible accordion */}
        {expanded && (
          <div className="px-4 pb-4 space-y-2 animate-fade-in border-t border-brand-100 pt-3">
            {items.map((item) => (
              <FileRow key={item.id || item.fileName} item={item} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Scenario A: Individual progress (≤ 3 files) ───────────────────────────
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <FileRow key={item.id || item.fileName} item={item} />
      ))}
    </div>
  );
}
