import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import { markNotificationRead, markAllNotificationsRead } from "../services/api";

// ── Icons (inline SVG) ────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
       strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CheckAllIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
       strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const LogoIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
    <rect width="32" height="32" rx="8" fill="#2563eb"/>
    <path d="M8 10h10a6 6 0 0 1 0 12H8V10z" fill="white" opacity=".9"/>
    <circle cx="22" cy="16" r="3" fill="#bfdbfe"/>
  </svg>
);

// ── Type badge helpers ─────────────────────────────────────────────────────────

const TYPE_STYLES = {
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  ERROR:   "bg-red-50 text-red-700 ring-1 ring-red-200",
  INFO:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
};

const TYPE_DOT = {
  SUCCESS: "bg-emerald-500",
  ERROR:   "bg-red-500",
  INFO:    "bg-blue-500",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Header({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onNotificationsUpdate,
}) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onToggle(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onToggle]);

  const handleMarkRead = async (id) => {
    const updated = await markNotificationRead(id);
    onNotificationsUpdate((prev) =>
      prev.map((n) => (n.id === id ? updated : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    onNotificationsUpdate((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white/80 backdrop-blur-md
                       border-b border-surface-200">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

        {/* Logo + Brand */}
        <div className="flex items-center gap-2.5">
          <LogoIcon />
          <div>
            <span className="text-base font-700 tracking-tight text-surface-900 leading-none">
              SWS AI
            </span>
            <span className="ml-1.5 text-base font-400 text-brand-600">
              Document Hub
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs font-medium text-surface-700 bg-surface-100
                           px-2.5 py-1 rounded-full">
            v1.0
          </span>

          {/* Bell button + panel */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => onToggle(!isOpen)}
              className="relative p-2 rounded-xl text-surface-700 hover:text-brand-600
                         hover:bg-brand-50 transition-colors duration-150"
              aria-label="Open notification center"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center
                                 justify-center rounded-full bg-brand-600 text-[9px]
                                 font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-[380px] animate-slide-down
                              rounded-2xl bg-white shadow-float border border-surface-200
                              overflow-hidden">

                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3
                                border-b border-surface-100 bg-surface-50">
                  <div>
                    <p className="text-sm font-700 text-surface-900">Notifications</p>
                    {unreadCount > 0 && (
                      <p className="text-xs text-surface-700">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="btn-ghost text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                    >
                      <CheckAllIcon />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="overflow-y-auto max-h-[420px]">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-sm text-surface-700">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 border-b border-surface-100
                                    transition-colors duration-150 group
                                    ${n.isRead ? "bg-white" : "bg-brand-50/40"}`}
                      >
                        {/* Type dot */}
                        <div className="mt-1 flex-shrink-0">
                          <span className={`block w-2 h-2 rounded-full mt-0.5
                                           ${TYPE_DOT[n.type] || "bg-slate-400"}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-relaxed
                                        ${n.isRead ? "text-surface-700" : "text-surface-900 font-500"}`}>
                            {n.message}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className={`status-badge ${TYPE_STYLES[n.type]}`}>
                              {n.type}
                            </span>
                            <span className="text-[10px] text-surface-700">
                              {format(new Date(n.timestamp), "MMM d, HH:mm")}
                            </span>
                          </div>
                        </div>

                        {/* Mark read */}
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100
                                       text-brand-600 hover:text-brand-800 transition-opacity
                                       text-[10px] font-semibold mt-0.5"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 bg-surface-50 border-t border-surface-100">
                  <p className="text-[10px] text-surface-700 text-center">
                    Real-time updates via WebSocket
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
