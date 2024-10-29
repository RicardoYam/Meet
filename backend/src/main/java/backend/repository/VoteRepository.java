package backend.repository;

import backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Integer> {
    Integer countVotesByUser_IdAndUpVoteIsTrue(Long userId);

}
