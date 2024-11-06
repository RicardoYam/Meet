package backend.repository;

import backend.entity.User;
import backend.entity.Verification;
import ch.qos.logback.core.status.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, Long> {

    boolean existsByCodeAndExpirationTimeIsAfterAndStatus(String code, Date currentTime, Verification.Status status);

    Optional<Verification> findByUserAndStatusAndExpirationTimeAfter(User user, Verification.Status status,
                                                                     Date currentTime);

    boolean existsByUserAndStatusAndExpirationTimeAfter(User user, Verification.Status status,
                                                                     Date currentTime);

    Verification findByCode(String code);
}
