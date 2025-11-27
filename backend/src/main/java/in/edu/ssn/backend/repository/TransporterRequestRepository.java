package in.edu.ssn.backend.repository;

import in.edu.ssn.backend.entity.TransporterRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransporterRequestRepository extends JpaRepository<TransporterRequestEntity, String> {
    List<TransporterRequestEntity> findByTransporterId(String transporterId);

    List<TransporterRequestEntity> findByProductIdAndStatus(String productId, String status);

    List<TransporterRequestEntity> findByProductId(String productId);

    void deleteByProductId(String productId);
}
