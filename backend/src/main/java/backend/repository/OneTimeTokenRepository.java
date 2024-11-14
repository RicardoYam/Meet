package backend.repository;

import backend.entity.OneTimeToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OneTimeTokenRepository extends JpaRepository<OneTimeToken, Long> {
    boolean existsByTokenAndExpiredFalse(String token);

    OneTimeToken findByToken(String token);
}
