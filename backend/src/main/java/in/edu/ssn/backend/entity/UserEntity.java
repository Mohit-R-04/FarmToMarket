package in.edu.ssn.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class UserEntity {
    @Id
    private String id;

    private String role;

    @Column(columnDefinition = "TEXT")
    private String roleData; // Storing JSON as string for simplicity
}
