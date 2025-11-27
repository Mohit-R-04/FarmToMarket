package in.edu.ssn.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "transporter_requests")
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransporterRequestEntity {
    @Id
    private String id;

    private String productId; // batchId
    private String farmerId;
    private String transporterId;

    private String sellerId; // Accepted seller for this batch
    private String sellerLocation; // Destination for transport

    private Double farmerDemandedCharge;
    private String transportDate;

    private String status; // PENDING, ACCEPTED, REJECTED
    private String createdAt;
}
