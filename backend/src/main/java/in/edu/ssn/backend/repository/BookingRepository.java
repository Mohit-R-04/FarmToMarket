package in.edu.ssn.backend.repository;

import in.edu.ssn.backend.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, String> {
    List<BookingEntity> findByBatchId(String batchId);

    List<BookingEntity> findByBatchIdAndStatus(String batchId, String status);

    void deleteByBatchId(String batchId);
}
