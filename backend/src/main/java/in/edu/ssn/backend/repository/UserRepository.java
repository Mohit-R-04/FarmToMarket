package in.edu.ssn.backend.repository;

import in.edu.ssn.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    List<UserEntity> findByRole(String role);
}
