import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "./components/Header";
import DropZone from "./components/DropZone";
import UploadProgress from "./components/UploadProgress";
import DocumentGrid from "./components/DocumentGrid";
import ToastBanner from "./components/ToastBanner";
import { useWebSocket } from "./hooks/useWebSocket";
import {
  fetchDocuments,
  fetchNotifications,
  uploadDocuments,
} from "./services/api";
import "./styles/index.css";

// ── Tiny ID generator ─────────────────────────────────────────────────────────
let _id = 0;
const uid = () => ++_id;

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Notification state ────────────────────────────────────────────────────
  const [notifications, setNotifications]   = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  // ── Document library ──────────────────────────────────────────────────────
  const [documents, setDocuments]       = useState([]);
  const [docsLoading, setDocsLoading]   = useState(true);

  // ── Upload state ──────────────────────────────────────────────────────────
  const [uploadItems, setUploadItems]   = useState([]);   // per-file tracking
  const [batchMode, setBatchMode]       = useState(false);
  const [batchFileCount, setBatchFileCount] = useState(0);
  const [uploading, setUploading]       = useState(false);

  // ── Toast queue ───────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const pendingBatchRef = useRef(null); // holds { count, completedIds }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error("Failed to load documents", e);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const notifs = await fetchNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadNotifications();
  }, [loadDocuments, loadNotifications]);

  // ── Unread count ──────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── WebSocket handlers ────────────────────────────────────────────────────

  const handleUploadProgress = useCallback(
    (event) => {
      const { documentId, fileName, status, progressPercent, batchCompletedCount, message, timestamp } = event;

      // Batch-complete broadcast (no documentId)
      if (!documentId && batchCompletedCount != null) {
        setToasts((prev) => [
          ...prev,
          {
            id: uid(),
            message: message || `${batchCompletedCount} files uploaded successfully`,
            type: "SUCCESS",
            timestamp,
          },
        ]);
        loadDocuments(); // refresh table
        setUploading(false);
        return;
      }

      // Per-file progress update
      setUploadItems((prev) =>
        prev.map((item) =>
          item.serverId === documentId
            ? { ...item, status, progressPercent }
            : item
        )
      );

      // If a doc just completed, refresh library row
      if (status === "COMPLETE" || status === "FAILED") {
        loadDocuments();
      }
    },
    [loadDocuments]
  );

  const handleNotification = useCallback((notif) => {
    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.find((n) => n.id === notif.id)) return prev;
      return [notif, ...prev];
    });
  }, []);

  useWebSocket({
    onUploadProgress: handleUploadProgress,
    onNotification:   handleNotification,
  });

  // ── File selection & upload ───────────────────────────────────────────────

  const handleFilesSelected = useCallback(
    async (files) => {
      const fileList = Array.from(files);
      const isBatch  = fileList.length > 3;

      setBatchMode(isBatch);
      setBatchFileCount(fileList.length);
      setUploading(true);

      // Build client-side tracking items
      const items = fileList.map((f) => ({
        localId:        uid(),
        serverId:       null,
        fileName:       f.name,
        fileSize:       f.size,
        status:         "PENDING",
        progressPercent: 0,
      }));
      setUploadItems(items);

      try {
        const response = await uploadDocuments(fileList);
        const serverDocs = response.data.documents || [];

        // Link server IDs to local items by position
        setUploadItems((prev) =>
          prev.map((item, i) => ({
            ...item,
            serverId: serverDocs[i]?.id ?? null,
          }))
        );
      } catch (err) {
        console.error("Upload initiation failed", err);
        setUploadItems((prev) =>
          prev.map((item) => ({ ...item, status: "FAILED" }))
        );
        setUploading(false);
        setToasts((t) => [
          ...t,
          {
            id: uid(),
            message: "Upload failed. Please try again.",
            type: "ERROR",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    },
    []
  );

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      {/* Sticky header */}
      <Header
        notifications={notifications}
        unreadCount={unreadCount}
        isOpen={notifPanelOpen}
        onToggle={setNotifPanelOpen}
        onNotificationsUpdate={setNotifications}
      />

      {/* Toast banners */}
      <ToastBanner toasts={toasts} onDismiss={dismissToast} />

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-12">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-700 text-surface-900 tracking-tight">
            Document Management
          </h1>
          <p className="text-sm text-surface-700 mt-1">
            Upload, track, and manage your PDF documents in real time.
          </p>
        </div>

        {/* Upload card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-700 text-surface-900">Upload Files</h2>
            {uploading && (
              <span className="text-xs font-500 text-brand-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"/>
                Processing…
              </span>
            )}
          </div>

          <DropZone
            onFilesSelected={handleFilesSelected}
            disabled={uploading}
          />

          {/* Progress section */}
          {uploadItems.length > 0 && (
            <div className="mt-4">
              <UploadProgress
                items={uploadItems}
                batchMode={batchMode}
                batchFileCount={batchFileCount}
              />
            </div>
          )}
        </div>

        {/* Document library card */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b
                          border-surface-100">
            <h2 className="text-base font-700 text-surface-900">Document Library</h2>
            <button
              onClick={loadDocuments}
              className="btn-ghost"
              title="Refresh"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13.5 2v3h-3" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </button>
          </div>

          <DocumentGrid documents={documents} loading={docsLoading} />
        </div>
      </main>
    </div>
  );
}
