package backend.repository;

import backend.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long>, JpaSpecificationExecutor<Blog> {
    @Query("SELECT b FROM Blog b LEFT JOIN b.votes v GROUP BY b.id ORDER BY COUNT(v) DESC")
    Page<Blog> findAllOrderByVotes(Pageable pageable);
}
