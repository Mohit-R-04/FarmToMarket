package in.edu.ssn.backend.repository;

import in.edu.ssn.backend.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, String> {
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    List<NotificationEntity> findByUserIdAndRelatedEntityIdAndType(String userId, String relatedEntityId, String type);

    List<NotificationEntity> findByRelatedEntityId(String relatedEntityId);

    void deleteByRelatedEntityId(String relatedEntityId);
}
