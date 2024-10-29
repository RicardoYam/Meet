package backend.service;

import backend.dto.*;
import backend.entity.*;
import backend.repository.CommentRepository;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import backend.repository.VoteRepository;
import backend.security.JWTGenerator;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;

@Service
@Log4j2
public class HomeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTGenerator jwtGenerator;

    @Autowired
    private BlogService blogService;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private CommentRepository commentRepository;


    public boolean createUser(UserDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setCreatedTime(new Date());

        Role roles = roleRepository.findByName("USER");
        user.setRoles(Collections.singletonList(roles));

        userRepository.save(user);
        return true;
    }

    public LoginResponseDTO login(LoginDTO loginDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getAccount(), loginDTO.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtGenerator.generateToken(authentication);

            User user = userRepository.findUserByUsername(loginDTO.getAccount()).get();
            return new LoginResponseDTO(token, user.getId(), user.getUsername(), user.getEmail(), user.getAvatarData());
        } catch (AuthenticationException e) {
            log.error(e.getMessage());
            return null;
        }
    }


    @Transactional
    public ProfileResponseDTO getProfile(Integer id) {
        long l = id.longValue();
        Optional<User> optionalUser = userRepository.findUserById(l);
        if (optionalUser.isPresent()) {
            ProfileResponseDTO response = new ProfileResponseDTO();
            User user = optionalUser.get();

            response.setId(user.getId());
            response.setName(user.getUsername());

            // all posts of the specific user
            List<Blog> blogs = user.getBlogs();
            List<BlogResponseDTO> blogResponseDTOList = new ArrayList<>();
            for (Blog blog : blogs) {
                BlogResponseDTO oneBlog = blogService.getOneBlog(blog.getId().intValue());
                blogResponseDTOList.add(oneBlog);
            }
            response.setBlogs(blogResponseDTOList);

            // followed categories
            List<CategoryResponseDTO> categoryResponseDTOList = new ArrayList<>();
            for (Category category : user.getCategories()) {
                CategoryResponseDTO oneCategory = new CategoryResponseDTO();
                oneCategory.setId(category.getId());
                oneCategory.setTitle(category.getTitle());
                oneCategory.setDescription(category.getDescription());
                categoryResponseDTOList.add(oneCategory);
            }
            response.setCategories(categoryResponseDTOList);

            // followed tags
            List<TagResponseDTO> tagResponseDTOList = new ArrayList<>();
            for (Tag tag : user.getTags()) {
                TagResponseDTO oneTag = new TagResponseDTO();
                oneTag.setId(tag.getId());
                oneTag.setTitle(tag.getTitle());
                oneTag.setDescription(tag.getDescription());
                tagResponseDTOList.add(oneTag);
            }
            response.setTags(tagResponseDTOList);

            // TODO: After implement upvote function, check response
            response.setTotalUpVotes(voteRepository.countVotesByUser_IdAndUpVoteIsTrue(l));

            // TODO: SAME
            int totalReceivedUpVotes = blogs.stream()
                .flatMap(blog -> blog.getVotes().stream())
                .filter(Vote::isUpVote)
                .mapToInt(vote -> 1) // Map each upvote to a count of 1
                .sum();
            response.setTotalReceivedUpVotes(totalReceivedUpVotes);

            // TODO: SAME
            response.setTotalComments(commentRepository.countCommentsByUserId(l));

            response.setCreatedTime(user.getCreatedTime());

            return response;
        }
        return null;
    }
}
