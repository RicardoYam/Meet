package backend.service;

import backend.dto.BlogDTO;
import backend.dto.BlogResponseDTO;
import backend.dto.CategoryDTO;
import backend.dto.TagDTO;
import backend.entity.Blog;
import backend.entity.Category;
import backend.entity.Tag;
import backend.entity.User;
import backend.repository.BlogRepository;
import backend.repository.CategoryRepository;
import backend.repository.TagRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private UserRepository userRepository;


    public boolean createCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setTitle(categoryDTO.getTitle());
        category.setDescription(categoryDTO.getDescription());
        category.setCreatedTime(new Date());
        categoryRepository.save(category);
        return true;
    }


    public boolean createTag(TagDTO tagDTO) {
        Tag tag = new Tag();
        tag.setTitle(tagDTO.getTitle());
        tag.setDescription(tagDTO.getDescription());
        tag.setCreatedTime(new Date());
        tagRepository.save(tag);
        return true;
    }


    public boolean createBlog(BlogDTO blogDTO) {
        Blog blog = new Blog();
        blog.setTitle(blogDTO.getTitle());
        blog.setContent(blogDTO.getContent());

        User user = userRepository.findUserByUsername(blogDTO.getAuthorName()).orElseThrow(() -> new RuntimeException("User not found"));
        blog.setUser(user);

        // find and set categories
        List<Category> categories = new ArrayList<>();
        for (String title : blogDTO.getCategories()) {
            Category category = categoryRepository.findByTitle(title);
            categories.add(category);
        }
        blog.setCategories(categories);

        // find and set tags
        List<Tag> tags = new ArrayList<>();
        for (String title : blogDTO.getTags()) {
            Tag tag = tagRepository.findByTitle(title);
            tags.add(tag);
        }
        blog.setTags(tags);

        blog.setCreatedTime(new Date());
        blog.setUpdatedTime(new Date());
        blogRepository.save(blog);
        return true;
    }


    public Page<BlogResponseDTO> getAllBlogs(Pageable pageable) {
        Page<Blog> blogPage = blogRepository.findAll(pageable);
        return blogPage.map(this::convertBlogToDTO);
    }


    // convert Blog to BlogResponseDTO
    private BlogResponseDTO convertBlogToDTO(Blog blog) {
        BlogResponseDTO dto = new BlogResponseDTO();
        dto.setId(blog.getId());
        dto.setTitle(blog.getTitle());
        dto.setContent(blog.getContent());
        dto.setAuthor(blog.getUser().getUsername());
        dto.setAvatar(blog.getUser().getAvatarData());
        dto.setCategories(blog.getCategories().stream().map(Category::getTitle).collect(Collectors.toList()));
        dto.setTags(blog.getTags().stream().map(Tag::getTitle).collect(Collectors.toList()));
        dto.setUpVotes(blog.getVotes().size());
        dto.setComments(blog.getComments().size());
        dto.setCreatedTime(blog.getCreatedTime());
        return dto;
    }
}
