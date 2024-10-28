package backend.dto;

import backend.entity.Category;
import backend.entity.Tag;
import lombok.Data;

import java.util.List;

@Data
public class BlogDTO {

    private String title;

    private String content;

    private String authorName;

    private List<String> categories;

    private List<String> tags;
}
