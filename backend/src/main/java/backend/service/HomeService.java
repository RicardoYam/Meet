package backend.service;

import backend.dto.*;
import backend.entity.*;
import backend.repository.*;
import backend.security.JWTGenerator;
import backend.util.Utils;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private VerificationRepository verificationRepository;


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
            response.setBio(user.getBio());
            response.setAvatar(Utils.getImageData(user).getAvatarData());
            response.setBanner(Utils.getBannerDate(user).getBannerData());

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

            // Following list
            List<FollowResponseDTO> followingList = new ArrayList<>();
            for (User u : user.getFollowing()) {
                FollowResponseDTO followingUser = new FollowResponseDTO();
                followingUser.setId(u.getId());
                followingUser.setName(u.getUsername());
                followingList.add(followingUser);
            }
            response.setFollowing(followingList);

            // Follower list
            List<FollowResponseDTO> followerList = new ArrayList<>();
            for (User u : user.getFollowers()) {
                FollowResponseDTO follower = new FollowResponseDTO();
                follower.setId(u.getId());
                follower.setName(u.getUsername());
                followerList.add(follower);
            }
            response.setFollower(followerList);

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
    public boolean updateUserInfo(UserInfoDTO userInfoDTO) {
        try {
            Optional<User> optionalUser = userRepository.findUserById(userInfoDTO.getId().longValue());
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                user.setUsername(userInfoDTO.getUsername());
                user.setBio(userInfoDTO.getBio());
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
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


    @Transactional
    public boolean updateBanner(Integer userId, MultipartFile banner) throws IOException {
        String imageName = banner.getName();
        String imageType = banner.getContentType();
        byte[] imageBlob = banner.getBytes();

        Optional<User> optionalUser = userRepository.findUserById(userId.longValue());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            user.setBannerName(imageName);
            user.setBannerType(imageType);
            user.setBannerBlob(imageBlob);
            userRepository.save(user);
            return true;
        }
        return false;
    }


    @Transactional
    public boolean followAUser(Long id, Long targetId) {
        Optional<User> optionalUser = userRepository.findUserById(id);
        if (optionalUser.isPresent()) {
            User currentUser = optionalUser.get();
            try {
                Optional<User> optionalTargetUser = userRepository.findUserById(targetId);
                if (optionalTargetUser.isPresent()) {
                    User targetUser = optionalTargetUser.get();

                    // current user follow the target user
                    List<User> currentFollowing = currentUser.getFollowing();
                    currentFollowing.add(targetUser);

                    // target user add the current follower
                    List<User> targetFollowers = targetUser.getFollowers();
                    targetFollowers.add(currentUser);

                    currentUser.setFollowing(currentFollowing);
                    targetUser.setFollowers(targetFollowers);
                    userRepository.save(currentUser);
                    userRepository.save(targetUser);
                    return true;
                }
                return false;
            } catch (Exception e) {
                log.error(e.getMessage());
                return false;
            }
        }
        return false;
    }


    @Transactional
    public boolean unFollowAUser(Long id, Long targetId) {
        Optional<User> optionalUser = userRepository.findUserById(id);
        if (optionalUser.isPresent()) {
            User currentUser = optionalUser.get();
            try {
                Optional<User> optionalTargetUser = userRepository.findUserById(targetId);
                if (optionalTargetUser.isPresent()) {
                    User targetUser = optionalTargetUser.get();

                    // current user unfollow the target user
                    List<User> currentFollowing = currentUser.getFollowing();
                    currentFollowing.remove(targetUser);

                    // target user remove the current follower
                    List<User> targetFollowers = targetUser.getFollowers();
                    targetFollowers.remove(currentUser);

                    currentUser.setFollowing(currentFollowing);
                    targetUser.setFollowers(targetFollowers);
                    userRepository.save(currentUser);
                    userRepository.save(targetUser);
                    return true;
                }
                return false;
            } catch (Exception e) {
                log.error(e.getMessage());
                return false;
            }
        }
        return false;
    }


    @Transactional
    public boolean sendCode(String email) {
        Optional<User> optionalUser = userRepository.findUserByEmail(email);
        if (optionalUser.isEmpty()) {
            return false;
        }

        User user = optionalUser.get();

        String code;
        Optional<Verification> optionalVerification = verificationRepository
            .findByUserAndStatusAndExpirationTimeAfter(user, Verification.Status.PENDING, new Date());
        if (optionalVerification.isPresent()) {
            code = optionalVerification.get().getCode();
            emailGenerator(email, code);
            return true;
        } else {
            code = Utils.generateVerificationCode();
        }

        Verification verification = new Verification();
        verification.setCode(code);
        verification.setUser(user);
        verification.setCreatedTime(new Date());

        // +15 mins
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.MINUTE, 15);
        verification.setExpirationTime(calendar.getTime());

        verificationRepository.save(verification);
        emailGenerator(email, code);
        return true;
    }


    public boolean verifyCode(String code) {
        Verification verification = verificationRepository.findByCode(code);
        verification.setStatus(Verification.Status.USED);
        verificationRepository.save(verification);
        return true;
    }


    @Transactional
    public boolean resetPassword(String email, String password) {
        Optional<User> optionalUser = userRepository.findUserByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (verificationRepository.existsByUserAndStatusAndExpirationTimeAfter(user, Verification.Status.USED,
                    new Date())) {
                PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
                String encode = passwordEncoder.encode(password);
                user.setPassword(encode);

                userRepository.save(user);
                return true;
            }
            return false;
        }
        return false;
    }


    private void emailGenerator(String to, String code) {
        String content = "Hi,\n\n"
                   + "We received a request to reset your password. Your verification code is:\n\n"
                   + code + "\n\n"
                   + "Please use this code to reset your password. This code will expire in 15 minutes.\n\n"
                   + "If you did not request a password reset, please ignore this email or contact support.\n\n"
                   + "Thank you,\n"
                   + "The Meet Team";
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Reset Password Notification");
        message.setText(content);
        message.setFrom("meet.community.mail@gmail.com");

        mailSender.send(message);
    }
}
