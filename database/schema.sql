-- SWS AI Document Management System — Schema Init
-- Run this against your MySQL instance before starting the backend.

CREATE DATABASE IF NOT EXISTS swsai_dms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE swsai_dms;

-- ─────────────────────────────────────────────
-- Table: documents
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name   VARCHAR(255)  NOT NULL,
    file_size   BIGINT        NOT NULL COMMENT 'Size in bytes',
    file_path   VARCHAR(1024) NOT NULL,
    upload_date DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      ENUM('PENDING','UPLOADING','COMPLETE','FAILED') NOT NULL DEFAULT 'PENDING',
    INDEX idx_documents_status      (status),
    INDEX idx_documents_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: notifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    message   TEXT         NOT NULL,
    type      ENUM('SUCCESS','ERROR','INFO') NOT NULL DEFAULT 'INFO',
    timestamp DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read   BOOLEAN      NOT NULL DEFAULT FALSE,
    INDEX idx_notifications_is_read  (is_read),
    INDEX idx_notifications_timestamp(timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
