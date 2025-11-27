package in.edu.ssn.backend.controller;

import in.edu.ssn.backend.entity.NotificationEntity;
import in.edu.ssn.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/user/{userId}")
    public List<NotificationEntity> getUserNotifications(@PathVariable String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/{id}/read")
    public NotificationEntity markAsRead(@PathVariable String id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setStatus("READ");
            return notificationRepository.save(notification);
        }).orElse(null);
    }

    @PostMapping("/create")
    public NotificationEntity createNotification(@RequestBody NotificationEntity notification) {
        if (notification.getId() == null) {
            notification.setId(UUID.randomUUID().toString());
        }
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(java.time.Instant.now().toString());
        }
        if (notification.getStatus() == null) {
            notification.setStatus("UNREAD");
        }
        return notificationRepository.save(notification);
    }
}
