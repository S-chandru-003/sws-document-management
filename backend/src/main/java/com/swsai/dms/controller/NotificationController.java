package com.swsai.dms.controller;

import com.swsai.dms.model.Notification;
import com.swsai.dms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications
     * Returns all notifications ordered newest-first.
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    /**
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread()));
    }

    /**
     * PUT /api/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    /**
     * PUT /api/notifications/read-all
     * Marks every unread notification as read in one batch.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead() {
        int updated = notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("updated", updated));
    }
}
