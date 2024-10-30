package backend.service;

import backend.dto.*;
import backend.entity.*;
import backend.repository.CommentRepository;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import backend.repository.VoteRepository;
import backend.security.JWTGenerator;
import backend.util.Utils;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import java.io.IOException;
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


    @Transactional
    public LoginResponseDTO login(LoginDTO loginDTO) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getAccount(), loginDTO.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtGenerator.generateToken(authentication);

            User user = userRepository.findUserByUsername(loginDTO.getAccount()).get();
            return new LoginResponseDTO(token, user.getId(), user.getUsername(), user.getEmail(),
                    Utils.getImageData(user).getAvatarData());
        } catch (AuthenticationException e) {
            log.error(e.getMessage());
            return null;
        }
    }


    @Transactional
    public ProfileResponseDTO getProfile(String username) {
        Optional<User> optionalUser = userRepository.findUserByUsername(username);
        if (optionalUser.isPresent()) {
            ProfileResponseDTO response = new ProfileResponseDTO();
            User user = optionalUser.get();

            response.setId(user.getId());
            response.setName(user.getUsername());
            response.setAvatar(Utils.getImageData(user).getAvatarData());

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

            List<VoteResponseDTO> voteResponseDTOList = new ArrayList<>();
            for (Vote vote : user.getVotes().stream().filter(Vote::isStatus).toList()) {
                VoteResponseDTO oneVote = new VoteResponseDTO();
                oneVote.setId(vote.getId());
                oneVote.setUpVote(vote.isUpVote());
                if (vote.getBlog() != null) {
                    oneVote.setBlogId(vote.getBlog().getId());
                } else {
                    oneVote.setBlogId(null);
                }
                if (vote.getComment() != null) {
                    oneVote.setCommentId(vote.getComment().getId());
                } else {
                    oneVote.setCommentId(null);
                }
                voteResponseDTOList.add(oneVote);
            }
            response.setVotes(voteResponseDTOList);

            // TODO: After implement upvote function, check response
            response.setTotalUpVotes(voteRepository.countVotesByUser_IdAndUpVoteIsTrueAndStatusIsTrue(user.getId()));

            // TODO: SAME
            int totalReceivedUpVotes = blogs.stream()
                .flatMap(blog -> blog.getVotes().stream())
                .filter(vote -> vote.isUpVote() && vote.isStatus())
                .mapToInt(vote -> 1) // Map each upvote to a count of 1
                .sum();
            response.setTotalReceivedUpVotes(totalReceivedUpVotes);

            // TODO: SAME
            response.setTotalComments(commentRepository.countCommentsByUserId(user.getId()));

            response.setCreatedTime(user.getCreatedTime());

            return response;
        }
        return null;
    }


    @Transactional
    public boolean updateAvatar(Integer userId, MultipartFile avatar) throws IOException {
        String imageName = avatar.getName();
        String imageType = avatar.getContentType();
        byte[] imageBlob = avatar.getBytes();

        Optional<User> optionalUser = userRepository.findUserById(userId.longValue());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            user.setAvatarName(imageName);
            user.setAvatarType(imageType);
            user.setAvatarBlob(imageBlob);
            userRepository.save(user);
            return true;
        }
        return false;
    }
}
