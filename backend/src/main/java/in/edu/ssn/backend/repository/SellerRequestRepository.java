package in.edu.ssn.backend.repository;

import in.edu.ssn.backend.entity.SellerRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerRequestRepository extends JpaRepository<SellerRequestEntity, String> {
    List<SellerRequestEntity> findByProductIdAndFarmerIdAndStatus(String productId, String farmerId, String status);

    List<SellerRequestEntity> findByProductIdAndStatus(String productId, String status);

    List<SellerRequestEntity> findByProductId(String productId);

    void deleteByProductId(String productId);
}
