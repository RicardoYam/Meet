package backend.repository;

import backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Integer> {
    boolean existsByTitle(String title);

    Tag findByTitle(String title);

    Optional<Tag> findById(Long id);
}
