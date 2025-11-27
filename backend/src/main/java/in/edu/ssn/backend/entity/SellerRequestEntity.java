package in.edu.ssn.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "seller_requests")
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SellerRequestEntity {
    @Id
    private String id;

    private String productId;
    private String farmerId;
    private String sellerId;

    private Double farmerPrice;
    private Double sellingPrice;

    private String status;
    private String createdAt;
}
