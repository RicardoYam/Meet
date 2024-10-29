package backend.controller;

import backend.dto.*;
import backend.repository.BlogRepository;
import backend.repository.CategoryRepository;
import backend.repository.TagRepository;
import backend.repository.UserRepository;
import backend.service.BlogService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

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
                                     @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BlogListResponseDTO> blogs = blogService.getAllBlogs(pageable);
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
}
