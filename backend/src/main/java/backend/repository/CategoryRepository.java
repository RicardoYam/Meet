package backend.repository;

import backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByTitle(String title);

    Category findByTitle(String title);

    Optional<Category> findById(Long id);
}
