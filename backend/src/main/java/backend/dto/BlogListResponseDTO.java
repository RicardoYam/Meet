package backend.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class BlogListResponseDTO {

    private Long id;

    private String title;

    private String content;

    private String author;

    private String avatar;

    private List<String> categories;

    private List<String> tags;

    private Integer upVotes;

    private Integer comments;

    private Date createdTime;
}
