import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  timeout: 30000,
});

// ── Documents ─────────────────────────────────────────────────────────────────

export const fetchDocuments = () =>
  api.get("/api/documents").then((r) => r.data);

export const uploadDocuments = (files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return api.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const downloadUrl = (id) =>
  `${api.defaults.baseURL}/api/documents/${id}/download`;

// ── Notifications ─────────────────────────────────────────────────────────────

export const fetchNotifications = () =>
  api.get("/api/notifications").then((r) => r.data);

export const fetchUnreadCount = () =>
  api.get("/api/notifications/unread-count").then((r) => r.data.count);

export const markNotificationRead = (id) =>
  api.put(`/api/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  api.put("/api/notifications/read-all").then((r) => r.data);
