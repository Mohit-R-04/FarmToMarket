package in.edu.ssn.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "bookings")
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingEntity {
    @Id
    private String id;

    private String batchId;
    private String farmerId;
    private String transporterId;

    private Double farmerDemandedCharge;
    private Double transporterCharge;

    private String status;
    private String createdAt;

    private String selectedSellerId;
    private String transportDate;

    private String cancellationReason;
    private String cancellationStatus; // PENDING, APPROVED, REJECTED

    private Double kilometers;
}
