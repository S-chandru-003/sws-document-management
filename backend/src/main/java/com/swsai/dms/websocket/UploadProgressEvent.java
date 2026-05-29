package com.swsai.dms.websocket;

import com.swsai.dms.model.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Payload broadcast over /topic/upload-progress to all subscribers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadProgressEvent {

    /** The document whose state has changed. */
    private Long documentId;
    private String fileName;
    private Document.DocumentStatus status;

    /** 0-100; only meaningful while UPLOADING */
    private int progressPercent;

    /** How many files in this batch were completed (sent on final COMPLETE event). */
    private int batchCompletedCount;

    private LocalDateTime timestamp;
    private String message;
}
