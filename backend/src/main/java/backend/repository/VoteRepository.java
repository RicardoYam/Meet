package backend.repository;

import backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Integer> {
    Integer countVotesByUser_IdAndUpVoteIsTrueAndStatusIsTrue(Long userId);

    Optional<Vote> findVoteByBlog_IdAndUser_Id(Long blogId, Long userId);

}
