package backend.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class ProfileResponseDTO {

    private Long id;

    private String name;

    private String avatar;

    private String banner;

    private String bio;

    private List<BlogResponseDTO> blogs;

    private List<CategoryResponseDTO> categories;

    private List<TagResponseDTO> tags;

    private List<VoteResponseDTO> votes;

    private List<FollowResponseDTO> following;

    private List<FollowResponseDTO> follower;

    private Integer totalUpVotes;

    private Integer totalReceivedUpVotes;

    private Integer totalComments;

    private Date createdTime;
}
