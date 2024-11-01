package backend.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class BlogResponseDTO {

    private Long id;

    private String title;

    private String content;

    private String author;

    private String authorAvatar;

    private List<String> tags;

    private List<String> categories;

    private Integer upVotes;

    private Integer downVotes;

    private List<CommentResponseDTO> comments;

    private Date createdTime;
}
