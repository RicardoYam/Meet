package backend.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class ProfileResponseDTO {

    private Long id;

    private String name;

    private List<BlogResponseDTO> blogs;

    private List<CategoryResponseDTO> categories;

    private List<TagResponseDTO> tags;

    private Integer totalUpVotes;

    private Integer totalReceivedUpVotes;

    private Integer totalComments;

    private Date createdTime;
}