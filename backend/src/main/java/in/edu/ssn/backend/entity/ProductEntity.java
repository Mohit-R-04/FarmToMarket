package in.edu.ssn.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductEntity {
    @Id
    private String id;

    private String farmerId;
    private String farmerName;
    private String productName;
    private Double quantity;
    private String unit;
    private String productionLocation;
    private String qrCode;
    private String status;
    private String createdAt;
    private String currentLocation;

    private Double farmerPrice;
    private Double sellerPrice;

    private String sellerId;
    private String sellerName;
    private String sellerLocation;

    private String transporterId;
    private String transporterName;
    private Double transporterCharge;

    @Column(columnDefinition = "TEXT")
    private String journey; // Storing JSON as string
}
