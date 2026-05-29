package com.swsai.dms.service;

import com.swsai.dms.model.Notification;
import com.swsai.dms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /** Persist a notification and immediately push it over WebSocket. */
    @Transactional
    public Notification createAndBroadcast(String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .message(message)
                .type(type)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        // Broadcast the new notification so the UI badge updates in real time
        messagingTemplate.convertAndSend("/topic/notifications", saved);
        return saved;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByTimestampDesc();
    }

    public long countUnread() {
        return notificationRepository.countByIsReadFalse();
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public int markAllAsRead() {
        return notificationRepository.markAllAsRead();
    }
}
