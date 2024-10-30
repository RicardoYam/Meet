package backend.dto;

import lombok.Data;

@Data
public class VoteResponseDTO {

    private Long id;

    private boolean upVote;

    private Long blogId;

    private Long commentId;
}
