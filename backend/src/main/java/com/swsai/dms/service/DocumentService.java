package com.swsai.dms.service;

import com.swsai.dms.model.Document;
import com.swsai.dms.model.Notification;
import com.swsai.dms.repository.DocumentRepository;
import com.swsai.dms.websocket.UploadProgressEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

   
    public List<Document> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadDateDesc();
    }

    @Transactional
    public void deleteDocument(Long id) throws IOException {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));

        Path filePath = Paths.get(doc.getFilePath());
        Files.deleteIfExists(filePath);
        documentRepository.delete(doc);
    }

   
    @Transactional
    public List<Document> initiateUpload(MultipartFile[] files) throws IOException {
        ensureUploadDir();
        List<Document> pendingDocs = new ArrayList<>();

        for (MultipartFile file : files) {
            // Save the physical file
            String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = resolveUploadDir().resolve(storedName);
            file.transferTo(destination.toFile());

            Document doc = Document.builder()
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .filePath(destination.toString())
                    .uploadDate(LocalDateTime.now())
                    .status(Document.DocumentStatus.PENDING)
                    .build();

            pendingDocs.add(documentRepository.save(doc));
        }

        // Fire-and-forget: process all files in background
        processFilesAsync(pendingDocs);
        return pendingDocs;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Async processing — simulates background work with realistic delays
    // ─────────────────────────────────────────────────────────────────────────

    @Async("uploadExecutor")
    public void processFilesAsync(List<Document> documents) {
        AtomicInteger completedCount = new AtomicInteger(0);
        int total = documents.size();

        for (Document doc : documents) {
            try {
                simulateUpload(doc);
                completedCount.incrementAndGet();
            } catch (Exception e) {
                log.error("Failed to process document {}: {}", doc.getId(), e.getMessage());
                failDocument(doc, e.getMessage());
            }
        }

        // Broadcast batch-complete summary
        int completed = completedCount.get();
        int failed = total - completed;
        String summary = buildBatchSummary(completed, failed);
        Notification.NotificationType type = failed == 0
                ? Notification.NotificationType.SUCCESS
                : Notification.NotificationType.INFO;

        notificationService.createAndBroadcast(summary, type);

        // Also push a dedicated batch-complete event so the frontend can show the toast
        UploadProgressEvent batchEvent = UploadProgressEvent.builder()
                .status(Document.DocumentStatus.COMPLETE)
                .batchCompletedCount(completed)
                .timestamp(LocalDateTime.now())
                .message(summary)
                .build();
        messagingTemplate.convertAndSend("/topic/upload-progress", batchEvent);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private void simulateUpload(Document doc) throws InterruptedException {
        // Mark UPLOADING
        updateStatus(doc, Document.DocumentStatus.UPLOADING);
        broadcastProgress(doc, 0);

        // Simulate chunked upload in ~5 steps
        int steps = 5;
        int delayPerStep = 600 + (int) (Math.random() * 600); // 600–1200 ms per step
        for (int step = 1; step <= steps; step++) {
            Thread.sleep(delayPerStep);
            int percent = (step * 100) / steps;
            broadcastProgress(doc, percent);
        }

        // Mark COMPLETE
        updateStatus(doc, Document.DocumentStatus.COMPLETE);
        broadcastProgress(doc, 100);

        notificationService.createAndBroadcast(
                "File \"" + doc.getFileName() + "\" uploaded successfully.",
                Notification.NotificationType.SUCCESS
        );
    }

    private void failDocument(Document doc, String reason) {
        updateStatus(doc, Document.DocumentStatus.FAILED);
        broadcastProgress(doc, 0);
        notificationService.createAndBroadcast(
                "Failed to upload \"" + doc.getFileName() + "\": " + reason,
                Notification.NotificationType.ERROR
        );
    }

    @Transactional
    public void updateStatus(Document doc, Document.DocumentStatus status) {
        doc.setStatus(status);
        documentRepository.save(doc);
    }

    private void broadcastProgress(Document doc, int percent) {
        UploadProgressEvent event = UploadProgressEvent.builder()
                .documentId(doc.getId())
                .fileName(doc.getFileName())
                .status(doc.getStatus())
                .progressPercent(percent)
                .timestamp(LocalDateTime.now())
                .build();
        messagingTemplate.convertAndSend("/topic/upload-progress", event);
    }

    private void ensureUploadDir() throws IOException {
        Path dir = resolveUploadDir();
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
    }

    private Path resolveUploadDir() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    private String buildBatchSummary(int completed, int failed) {
        if (failed == 0) {
            return completed + " file" + (completed > 1 ? "s" : "") + " uploaded successfully.";
        }
        return completed + " file" + (completed > 1 ? "s" : "") + " uploaded, " + failed + " failed.";
    }

    /** Resolve the physical path for download. */
    public Path resolveFilePath(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        return Paths.get(doc.getFilePath());
    }
}
