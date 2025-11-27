package in.edu.ssn.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "notifications")
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NotificationEntity {
    @Id
    private String id;

    private String userId; // Recipient
    private String message;
    private String type; // INFO, ALERT, CANCELLATION_REQUEST
    private String relatedEntityId; // Booking ID, Product ID, etc.
    private String status; // UNREAD, READ, ACTION_REQUIRED
    private String createdAt;

    // For cancellation requests
    private String actionStatus; // PENDING, ACCEPTED, REJECTED
}
