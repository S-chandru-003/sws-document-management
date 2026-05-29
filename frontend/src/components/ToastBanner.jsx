import React, { useEffect } from "react";
import { format } from "date-fns";

export default function ToastBanner({ toasts, onDismiss }) {
  return (
    <div className="fixed top-16 inset-x-0 z-50 flex flex-col items-center gap-2 px-4
                    pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === "SUCCESS";

  return (
    <div className="pointer-events-auto w-full max-w-md animate-slide-down">
      <div className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-panel
                       border text-sm font-500
                       ${isSuccess
                         ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                         : "bg-brand-50 border-brand-200 text-brand-800"}`}>

        {/* Icon */}
        <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center
                          justify-center
                          ${isSuccess ? "bg-emerald-200" : "bg-brand-200"}`}>
          {isSuccess ? (
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.5"
                    strokeLinecap="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <circle cx="6" cy="6" r="4" stroke="#2563eb" strokeWidth="1.5"/>
              <path d="M6 4v3M6 8.5v.5" stroke="#2563eb" strokeWidth="1.5"
                    strokeLinecap="round"/>
            </svg>
          )}
        </span>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p>{toast.message}</p>
          {toast.timestamp && (
            <p className="text-[10px] opacity-70 mt-0.5">
              {format(new Date(toast.timestamp), "HH:mm:ss")}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
