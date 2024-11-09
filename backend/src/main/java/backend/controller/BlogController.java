package backend.controller;

import backend.dto.*;
import backend.entity.User;
import backend.repository.*;
import backend.service.BlogService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin("*")
@Log4j2
public class BlogController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;


    @PostMapping("/categories")
    public ResponseEntity<String> addCategory(@RequestBody CategoryDTO categoryDTO) {
        if (categoryDTO.getTitle() == null || categoryDTO.getTitle().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid title", HttpStatus.BAD_REQUEST);
        }

        if (categoryDTO.getDescription() == null || categoryDTO.getDescription().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid description", HttpStatus.BAD_REQUEST);
        }

        if (categoryRepository.existsByTitle(categoryDTO.getTitle())) {
            return new ResponseEntity<>("Category already exists", HttpStatus.CONFLICT);
        }

        try {
            if (blogService.createCategory(categoryDTO)) {
                return new ResponseEntity<>("Category created", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Category already exists", HttpStatus.CONFLICT);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        try {
            List<CategoryResponseDTO> categories = blogService.getCategories();
            if (categories.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/categories/{categoryId}")
    public ResponseEntity<?> followACategory(@PathVariable Integer categoryId, @RequestParam Integer userId) {
        if (categoryId == null || userId == null) {
            return new ResponseEntity<>("Please provide a valid category", HttpStatus.BAD_REQUEST);
        }
        try {
            if (blogService.followACategory(categoryId, userId)) {
                return new ResponseEntity<>("category followed", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("category not followed", HttpStatus.CONFLICT);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<String> unfollowACategory(@PathVariable Integer categoryId, @RequestParam Integer userId) {
        if (categoryId == null || userId == null) {
            return new ResponseEntity<>("Please provide a valid category", HttpStatus.BAD_REQUEST);
        }
        try {
            if (blogService.unFollowACategory(categoryId, userId)) {
                return new ResponseEntity<>("category unfollowed", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("category not unfollowed", HttpStatus.CONFLICT);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


    @PostMapping("/tags")
    public ResponseEntity<String> addTag(@RequestBody TagDTO tagDTO) {
        if (tagDTO.getTitle() == null || tagDTO.getTitle().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid title", HttpStatus.BAD_REQUEST);
        }

        if (tagDTO.getDescription() == null || tagDTO.getDescription().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid description", HttpStatus.BAD_REQUEST);
        }

        if (tagRepository.existsByTitle(tagDTO.getTitle())) {
            return new ResponseEntity<>("Tag already exists", HttpStatus.CONFLICT);
        }

        try {
            if (blogService.createTag(tagDTO)) {
                return new ResponseEntity<>("Tag added", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Tag already exists", HttpStatus.CONFLICT);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


    @GetMapping("/tags")
    public ResponseEntity<List<TagResponseDTO>> getAllTags() {
        try {
            List<TagResponseDTO> tags = blogService.getTags();
            if (tags.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(tags, HttpStatus.OK);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/tags/{tagId}")
    public ResponseEntity<?> followATag(@PathVariable Integer tagId, @RequestParam Integer userId) {
        if (tagId == null || userId == null) {
            return new ResponseEntity<>("Please provide a valid tag", HttpStatus.BAD_REQUEST);
        }
        try {
            if (blogService.followATag(tagId, userId)) {
                return new ResponseEntity<>("Tag followed", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Tag not followed", HttpStatus.CONFLICT);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


    @DeleteMapping("/tags/{tagId}")
    public ResponseEntity<String> unfollowATag(@PathVariable Integer tagId, @RequestParam Integer userId) {
        if (tagId == null || userId == null) {
            return new ResponseEntity<>("Please provide a valid tag", HttpStatus.BAD_REQUEST);
        }
        try {
            if (blogService.unFollowATag(tagId, userId)) {
                return new ResponseEntity<>("Tag unfollowed", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Tag not unfollowed", HttpStatus.CONFLICT);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }


    @PostMapping("/posts")
    public ResponseEntity<?> createBlog(@RequestBody BlogDTO blogDTO) {
        if (blogDTO.getTitle() == null || blogDTO.getTitle().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid title", HttpStatus.BAD_REQUEST);
        }

        if (blogDTO.getContent() == null || blogDTO.getContent().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid content", HttpStatus.BAD_REQUEST);
        }

        if (blogDTO.getAuthorName() == null || blogDTO.getAuthorName().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid author name", HttpStatus.BAD_REQUEST);
        }

        try {
            if (blogService.createBlog(blogDTO)) {
                return new ResponseEntity<>("Blog created", HttpStatus.CREATED);
            }
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/posts")
    public ResponseEntity<?> getAllBlogs(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "5") int size,
                                         @RequestParam(required = false) String category,
                                         @RequestParam(required = false) String tag,
                                         @RequestParam(defaultValue = "createdTime") String sortBy,
                                         @RequestParam(defaultValue = "desc") String sortDir) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<BlogListResponseDTO> blogs = blogService.getAllBlogs(pageable, category, tag);
        if (!blogs.hasContent()) {
            return new ResponseEntity<>("No blogs found", HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(blogs, HttpStatus.OK);
    }


    @GetMapping("/posts/search")
    public ResponseEntity<?> searchBlogs(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "5") int size,
                                         @RequestParam String searchTerm) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BlogListResponseDTO> blogs = blogService.searchBlogs(pageable, searchTerm);

        if (!blogs.hasContent()) {
            return new ResponseEntity<>("No blogs found", HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(blogs, HttpStatus.OK);
    }


    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getOneBlog(@PathVariable int id) {
        if (id <= 0) {
            return new ResponseEntity<>("Please provide a valid id", HttpStatus.BAD_REQUEST);
        }

        try {
            BlogResponseDTO blog = blogService.getOneBlog(id);
            if (blog == null) {
                return new ResponseEntity<>("Blog not found", HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(blog, HttpStatus.OK);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/vote")
    public ResponseEntity<?> upVoteBlog(@RequestParam Integer blogId, @RequestParam Integer userId) {
        if (blogId <= 0) {
            return new ResponseEntity<>("Please provide a valid blogId", HttpStatus.BAD_REQUEST);
        }
        if (userId <= 0) {
            return new ResponseEntity<>("Please provide a valid userId", HttpStatus.BAD_REQUEST);
        }

        if (!blogRepository.existsById(blogId.longValue())) {
            return new ResponseEntity<>("Blog not found", HttpStatus.NOT_FOUND);
        }
        if (!userRepository.existsById(userId.longValue())) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        try {
            if (blogService.upVoteOrDeleteVoteBlog(blogId, userId)) {
                return new ResponseEntity<>("Blog updated", HttpStatus.OK);
            }
            return new ResponseEntity<>("Blog not updated", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/comments")
    public ResponseEntity<?> createComment(@RequestBody CommentDTO commentDTO) {
        if (commentDTO.getBlogId() == null && commentDTO.getCommentId().isEmpty()) {
            return new ResponseEntity<>("Please provide a valid id", HttpStatus.BAD_REQUEST);
        }

        if (commentDTO.getContent() == null || commentDTO.getContent().trim().isEmpty()) {
            return new ResponseEntity<>("Comment content cannot be empty", HttpStatus.BAD_REQUEST);
        }

        Optional<User> optionalUser = userRepository.findUserById(commentDTO.getUserId().longValue());
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        try {
            if (blogService.createComment(commentDTO.getBlogId(), commentDTO.getCommentId(), user, commentDTO.getContent())) {
                return new ResponseEntity<>("Comment created", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Comment not created", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
