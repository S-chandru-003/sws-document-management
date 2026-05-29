# SWS AI — Document Management Dashboard

A full-stack document management system with real-time WebSocket notifications, drag-and-drop PDF uploads, and a clean corporate UI.

---

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 18, Tailwind CSS, Livvic (Google Font)      |
| Backend   | Java 17, Spring Boot 3.2, Maven                   |
| Database  | MySQL 8+                                          |
| Real-Time | Spring WebSocket + STOMP over SockJS              |
| HTTP      | Axios (frontend) · Spring MVC REST (backend)      |

---

## Project Structure

```
sws-ai-dms/
├── database/
│   └── schema.sql                  ← DDL — run once before starting backend
│
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/swsai/dms/
│       │   ├── DmsApplication.java
│       │   ├── config/
│       │   │   ├── AsyncConfig.java
│       │   │   ├── CorsConfig.java
│       │   │   └── WebSocketConfig.java
│       │   ├── controller/
│       │   │   ├── DocumentController.java
│       │   │   └── NotificationController.java
│       │   ├── model/
│       │   │   ├── Document.java
│       │   │   └── Notification.java
│       │   ├── repository/
│       │   │   ├── DocumentRepository.java
│       │   │   └── NotificationRepository.java
│       │   ├── service/
│       │   │   ├── DocumentService.java
│       │   │   └── NotificationService.java
│       │   └── websocket/
│       │       └── UploadProgressEvent.java
│       └── resources/
│           └── application.properties
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.jsx
│       ├── styles/index.css
│       ├── services/api.js
│       ├── hooks/useWebSocket.js
│       └── components/
│           ├── Header.jsx
│           ├── DropZone.jsx
│           ├── UploadProgress.jsx
│           ├── DocumentGrid.jsx
│           └── ToastBanner.jsx
│
└── README.md
```

---

## Prerequisites

- **Java 17+** (`java -version`)
- **Maven 3.8+** (`mvn -version`)
- **Node.js 18+** + npm (`node -v`)
- **MySQL 8+** running locally

---

## Step-by-Step Local Setup

### 1 — Database

```sql
-- Connect to MySQL and run:
SOURCE /path/to/sws-ai-dms/database/schema.sql;
```

Or paste the contents of `database/schema.sql` directly in MySQL Workbench / DBeaver.

### 2 — Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Required — set to your MySQL password
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Optional — where uploaded files are stored (relative or absolute)
app.upload.dir=./uploads
```

All configurable keys:

| Key                          | Default                     | Description                              |
|------------------------------|-----------------------------|------------------------------------------|
| `server.port`                | `8080`                      | Spring Boot HTTP port                    |
| `spring.datasource.url`      | `jdbc:mysql://localhost:3306/swsai_dms…` | JDBC URL                    |
| `spring.datasource.username` | `root`                      | DB username                              |
| `spring.datasource.password` | *(required)*                | DB password                              |
| `app.upload.dir`             | `./uploads`                 | Local directory for uploaded files       |
| `app.cors.allowed-origins`   | `http://localhost:3000`     | Frontend origin for CORS                 |
| `app.async.core-pool-size`   | `4`                         | Background upload thread pool core size  |
| `app.async.max-pool-size`    | `8`                         | Max upload threads                       |

### 3 — Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 4 — Start the Frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000` in your browser.

---

## REST API Reference

### Documents

| Method | Endpoint                         | Description                                  |
|--------|----------------------------------|----------------------------------------------|
| GET    | `/api/documents`                 | List all documents (newest first)            |
| POST   | `/api/documents/upload`          | Upload one or multiple PDFs (multipart)      |
| GET    | `/api/documents/{id}/download`   | Stream the stored file                       |

**Upload example (curl):**
```bash
curl -X POST http://localhost:8080/api/documents/upload \
  -F "files=@report.pdf" \
  -F "files=@invoice.pdf"
```

### Notifications

| Method | Endpoint                            | Description                  |
|--------|-------------------------------------|------------------------------|
| GET    | `/api/notifications`                | All notifications             |
| GET    | `/api/notifications/unread-count`   | `{ "count": N }`             |
| PUT    | `/api/notifications/{id}/read`      | Mark one as read             |
| PUT    | `/api/notifications/read-all`       | Mark all as read             |

---

## WebSocket Topics

Connect via SockJS at `ws://localhost:8080/ws`.

| Topic                    | Payload Type          | When fired                              |
|--------------------------|-----------------------|-----------------------------------------|
| `/topic/upload-progress` | `UploadProgressEvent` | Each status change during file upload   |
| `/topic/notifications`   | `Notification`        | When a new notification is created      |

**UploadProgressEvent fields:**
```json
{
  "documentId": 42,
  "fileName": "report.pdf",
  "status": "UPLOADING",
  "progressPercent": 60,
  "batchCompletedCount": 0,
  "timestamp": "2024-05-15T14:23:01",
  "message": null
}
```

---

## UI Feature Behaviour

| Scenario             | Trigger         | Behaviour                                                                           |
|----------------------|-----------------|-------------------------------------------------------------------------------------|
| **≤ 3 files**        | file drop/click | Individual progress bars per file with filename, size, %, status badge             |
| **> 3 files**        | file drop/click | Top banner: *"Upload in progress — processing X files in background"*; collapsible accordion |
| **Batch complete**   | WebSocket event | Toast: *"X files uploaded successfully"* with timestamp; auto-dismisses after 6 s  |
| **Notification bell**| click           | Floating dropdown with type-coloured rows; per-row ✓ and global "Mark all read"    |
| **Unread badge**     | real-time       | Badge count updates instantly via `/topic/notifications`                            |

---

## Git Commit Plan (15-Minute Increments)

Use this schedule to maintain a consistent incremental commit history:

```
Step 01 — feat(db): add schema.sql with documents and notifications DDL
Step 02 — chore(backend): initialize Spring Boot project with pom.xml dependencies
Step 03 — feat(backend): add application.properties with MySQL and upload config
Step 04 — feat(backend): add Document and Notification JPA entities
Step 05 — feat(backend): add DocumentRepository and NotificationRepository
Step 06 — feat(backend): configure WebSocket STOMP broker on /topic
Step 07 — feat(backend): configure CORS and async thread pool beans
Step 08 — feat(backend): implement NotificationService with WebSocket broadcast
Step 09 — feat(backend): implement DocumentService with async upload processing
Step 10 — feat(backend): add DocumentController REST endpoints
Step 11 — feat(backend): add NotificationController REST endpoints
Step 12 — chore(frontend): initialize React app with package.json and Tailwind config
Step 13 — feat(frontend): add Livvic font, global CSS, and Tailwind theme tokens
Step 14 — feat(frontend): implement API service layer (axios)
Step 15 — feat(frontend): implement useWebSocket hook (STOMP over SockJS)
Step 16 — feat(frontend): build Header component with notification bell dropdown
Step 17 — feat(frontend): build DropZone drag-and-drop component
Step 18 — feat(frontend): build UploadProgress component (Scenario A and B)
Step 19 — feat(frontend): build ToastBanner for WebSocket batch-complete alerts
Step 20 — feat(frontend): build DocumentGrid table with download links
Step 21 — feat(frontend): wire all components in App.jsx with full state management
Step 22 — docs: add comprehensive README with setup, API reference, and Git plan
```

---

## Troubleshooting

**Backend won't start — "Access denied for user 'root'"**
→ Check `spring.datasource.password` in `application.properties`.

**Backend won't start — "Table 'documents' doesn't exist"**
→ Run `database/schema.sql` against MySQL first.

**Frontend shows "Network Error" on upload**
→ Confirm backend is running on port 8080 and `REACT_APP_API_URL` (if set) is correct. The `proxy` in `package.json` handles this in dev automatically.

**WebSocket not connecting**
→ Ensure the backend is running and no firewall blocks port 8080. Check browser console for SockJS errors.

**Files not downloading**
→ Confirm `app.upload.dir` directory exists and is writable. The backend auto-creates it on first upload.
