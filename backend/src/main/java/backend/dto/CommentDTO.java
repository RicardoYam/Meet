package backend.dto;

import lombok.Data;

import java.util.Optional;

@Data
public class CommentDTO {

    private Integer blogId;

    private Optional<Integer> commentId;

    private Integer userId;

    private String content;
}
