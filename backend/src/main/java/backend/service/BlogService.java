package backend.service;

import backend.dto.*;
import backend.entity.*;
import backend.repository.*;
import backend.util.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
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
    @Autowired
    private VoteRepository voteRepository;


    public boolean createCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setTitle(categoryDTO.getTitle());
        category.setDescription(categoryDTO.getDescription());
        category.setCreatedTime(new Date());
        categoryRepository.save(category);
        return true;
    }


    public List<CategoryResponseDTO> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            return new ArrayList<>();
        }
        List<CategoryResponseDTO> response = new ArrayList<>();
        for (Category category : categories) {
            CategoryResponseDTO responseDTO = new CategoryResponseDTO();
            responseDTO.setId(category.getId());
            responseDTO.setTitle(category.getTitle());
            responseDTO.setDescription(category.getDescription());
            response.add(responseDTO);
        }
        return response;
    }


    public boolean createTag(TagDTO tagDTO) {
        Tag tag = new Tag();
        tag.setTitle(tagDTO.getTitle());
        tag.setDescription(tagDTO.getDescription());
        tag.setCreatedTime(new Date());
        tagRepository.save(tag);
        return true;
    }


    public List<TagResponseDTO> getTags() {
        List<Tag> tags = tagRepository.findAll();
        if (tags.isEmpty()) {
            return new ArrayList<>();
        }
        List<TagResponseDTO> response = new ArrayList<>();
        for (Tag tag : tags) {
            TagResponseDTO tagResponseDTO = new TagResponseDTO();
            tagResponseDTO.setId(tag.getId());
            tagResponseDTO.setTitle(tag.getTitle());
            tagResponseDTO.setDescription(tag.getDescription());
            response.add(tagResponseDTO);
        }
        return response;
    }


    @Transactional
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


    @Transactional
    public Page<BlogListResponseDTO> getAllBlogs(Pageable pageable) {
        Page<Blog> blogPage = blogRepository.findAll(pageable);
        return blogPage.map(this::convertBlogToDTO);
    }


    @Transactional
    public BlogResponseDTO getOneBlog(Integer id) {
        Long l = id.longValue();
        Optional<Blog> blogOptional = blogRepository.findById(l);
        if (blogOptional.isPresent()) {
            Blog blog = blogOptional.get();
            BlogResponseDTO response = new BlogResponseDTO();
            response.setId(blog.getId());
            response.setTitle(blog.getTitle());
            response.setContent(blog.getContent());
            response.setAuthor(blog.getUser().getUsername());
            response.setAuthorAvatar(Utils.getImageData(blog.getUser()).getAvatarData());

            // get categories and tags name
            response.setCategories(blog.getCategories().stream().map(Category::getTitle).collect(Collectors.toList()));
            response.setTags(blog.getTags().stream().map(Tag::getTitle).collect(Collectors.toList()));

            // count upVotes and downVotes
            response.setUpVotes((int) blog.getVotes().stream().filter(vote -> vote.isUpVote() && vote.isStatus()).count());
            response.setDownVotes((int) blog.getVotes().stream().filter(vote -> !vote.isUpVote() && vote.isStatus()).count());

            // get comments
            response.setComments(blog.getComments().stream()
                    .map(comment -> {
                        CommentResponseDTO commentDTO = new CommentResponseDTO();
                        commentDTO.setId(comment.getId());
                        commentDTO.setContent(comment.getContent());
                        commentDTO.setAuthor(comment.getUser().getUsername());
                        commentDTO.setCreatedTime(comment.getCreatedTime());

                        // Map votes for the comment
                        commentDTO.setUpVotes((int) comment.getVotes().stream().filter(vote -> vote.isUpVote() && vote.isStatus()).count());
                        commentDTO.setDownVotes((int) comment.getVotes().stream().filter(vote -> !vote.isUpVote() && vote.isStatus()).count());

                        return commentDTO;
                    })
                    .collect(Collectors.toList()));

            response.setCreatedTime(blog.getCreatedTime());

            return response;
        }
        return null;
    }


    // convert Blog to BlogResponseDTO
    private BlogListResponseDTO convertBlogToDTO(Blog blog) {
        BlogListResponseDTO dto = new BlogListResponseDTO();
        dto.setId(blog.getId());
        dto.setTitle(blog.getTitle());
        dto.setContent(blog.getContent());
        dto.setAuthor(blog.getUser().getUsername());
        dto.setAvatar(Utils.getImageData(blog.getUser()).getAvatarData());
        dto.setCategories(blog.getCategories().stream().map(Category::getTitle).collect(Collectors.toList()));
        dto.setTags(blog.getTags().stream().map(Tag::getTitle).collect(Collectors.toList()));
        dto.setUpVotes((int) blog.getVotes().stream().filter(vote -> vote.isUpVote() && vote.isStatus()).count());
        dto.setComments(blog.getComments().size());
        dto.setCreatedTime(blog.getCreatedTime());
        return dto;
    }


    @Transactional
    public boolean upVoteOrDeleteVoteBlog(Integer blogId, Integer userId) {
        Long blogIdLong = blogId.longValue();
        Long userIdLong = userId.longValue();

        Optional<Vote> optionalVote = voteRepository.findVoteByBlog_IdAndUser_Id(blogIdLong, userIdLong);

        if (optionalVote.isPresent()) {
            Vote vote = optionalVote.get();
            if (vote.isUpVote() && vote.isStatus()) {
                vote.setStatus(false);
            } else if (vote.isUpVote() && !vote.isStatus()) {
                vote.setStatus(true);
            }
        } else {
            Vote vote = new Vote();
            vote.setUpVote(true);
            vote.setStatus(true);

            Optional<User> optionalUser = userRepository.findUserById(userIdLong);
            Optional<Blog> optionalBlog = blogRepository.findById(blogIdLong);
            optionalUser.ifPresent(vote::setUser);
            optionalBlog.ifPresent(vote::setBlog);

            vote.setCreatedTime(new Date());

            voteRepository.save(vote);
        }
        return true;
    }
}
