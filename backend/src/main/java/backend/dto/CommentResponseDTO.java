package backend.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class CommentResponseDTO {

    private Long id;

    private Long parentCommentId;

    private String content;

    private String author;

    private String authorAvatar;

    private Integer upVotes;

    private Integer downVotes;

    private List<CommentResponseDTO> replies;

    private Date createdTime;
}
