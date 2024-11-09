package backend.controller;

import backend.dto.*;
import backend.entity.Verification;
import backend.repository.UserRepository;
import backend.repository.VerificationRepository;
import backend.security.JWTGenerator;
import backend.service.HomeService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin("*")
@Log4j2
public class HomeController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HomeService homeService;

    @Autowired
    private JWTGenerator jwtGenerator;

    @Autowired
    private VerificationRepository verificationRepository;


    /**
     * Checks the health status of the application.
     * <p>
     * This method returns a simple JSON response indicating whether the application
     * is healthy. If any errors occur during the execution, it will return an
     * internal server error status.
     *
     * @return A ResponseEntity containing a map with a key "healthy" and
     *         a value of true if the application is running correctly.
     *         If an error occurs, it returns a HttpStatus response.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Boolean>> health() {
        try {
            // response "healthy: true"
            Map<String, Boolean> response = new HashMap<>();
            response.put("healthy", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    /**
     * Registers a new user with the provided details.
     * <p>
     * This method handles the HTTP POST request to create a new user by validating the
     * provided username, password, and email. It checks for the existence of the username
     * or email address and returns appropriate HTTP status codes based on the registration result.
     *
     * @param userDTO The user details containing the username, password, and email.
     *                Must not be null.
     * @return ResponseEntity<?> indicating the result of the registration operation.
     *         Returns HTTP 201 (CREATED) if the user is successfully registered,
     *         HTTP 400 (BAD REQUEST) if any credentials are missing,
     *         HTTP 409 (CONFLICT) if the username or email is already in use,
     *         or HTTP 500 (INTERNAL SERVER ERROR) if an unexpected error occurs.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO) {
        if (userDTO.getUsername() == null || userDTO.getPassword() == null || userDTO.getEmail() == null) {
            return new ResponseEntity<>("Credentials can't be null", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByUsernameOrEmail(userDTO.getUsername(), userDTO.getEmail())) {
            return new ResponseEntity<>("Username or email address already in use", HttpStatus.CONFLICT);
        }

        try {
            if (homeService.createUser(userDTO)) {
                return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
            }
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * Authenticates a user based on their login credentials.
     * <p>
     * This method handles the HTTP POST request to log in a user by checking the provided
     * account (username or email) and password. It validates the input credentials and returns
     * appropriate HTTP status codes based on the authentication result.
     *
     * @param loginDTO The login credentials containing the account (username or email)
     *                 and password. Must not be null.
     * @return ResponseEntity<?> indicating the result of the login operation.
     *         Returns HTTP 200 (OK) if the login is successful,
     *         HTTP 400 (BAD REQUEST) if credentials are missing or invalid,
     *         or HTTP 500 (INTERNAL SERVER ERROR) if an unexpected error occurs.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        if (loginDTO.getAccount() == null || loginDTO.getPassword() == null) {
            return new ResponseEntity<>("Credentials can't be null", HttpStatus.BAD_REQUEST);
        }

        // check either username nor email address exist
        if (!(userRepository.existsByUsername(loginDTO.getAccount())) && !(userRepository.existsByEmail(loginDTO.getAccount()))) {
            return new ResponseEntity<>("Username or email address does not exist", HttpStatus.BAD_REQUEST);
        }

        try {
            // replace account as username
            if (userRepository.existsByEmail(loginDTO.getAccount())) {
                loginDTO.setAccount(userRepository.findUserByEmail(loginDTO.getAccount()).get().getUsername());
            }

            LoginResponseDTO response = homeService.login(loginDTO);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return new ResponseEntity<>("An error occurred while processing the request", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String username) {
        if (userRepository.existsByUsername(username)) {
            ProfileResponseDTO response = homeService.getProfile(username);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    }


    @PutMapping("/profile")
    public ResponseEntity<?> updateUserInfo(@RequestBody UserInfoDTO userInfoDTO, HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtGenerator.validateToken(token)) {
                if (Objects.equals(jwtGenerator.getUsernameFromToken(token),
                        userRepository.findUserById(userInfoDTO.getId().longValue()).get().getUsername())) {
                    try {
                        if (homeService.updateUserInfo(userInfoDTO)) {
                            return new ResponseEntity<>("User info updated successfully", HttpStatus.OK);
                        }
                        return new ResponseEntity<>("User info update failed", HttpStatus.UNAUTHORIZED);
                    } catch (Exception e) {
                        log.error(e.getMessage(), e);
                        return new ResponseEntity<>("An error occurred while processing the request", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                return new ResponseEntity<>("You are not authorized to update the user", HttpStatus.UNAUTHORIZED);
            }
            return new ResponseEntity<>("You are not authorized to update the user", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Please provide a valid token", HttpStatus.BAD_REQUEST);
    }


    @PutMapping("/profile/avatar")
    @Transactional
    public ResponseEntity<String> updateAvatar(@RequestParam Integer userId, @RequestPart MultipartFile avatar,
                                               HttpServletRequest request) {
        if (avatar == null) {
            return new ResponseEntity<>("Avatar can't be null", HttpStatus.BAD_REQUEST);
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtGenerator.validateToken(token)) {
                if (Objects.equals(jwtGenerator.getUsernameFromToken(token), userRepository.findUserById(userId.longValue()).get().getUsername())) {
                    try {
                        if (homeService.updateAvatar(userId, avatar)) {
                            return new ResponseEntity<>("Avatar updated successfully", HttpStatus.OK);
                        }
                        return new ResponseEntity<>("Avatar update failed", HttpStatus.UNAUTHORIZED);
                    } catch (Exception e) {
                        log.error(e.getMessage(), e);
                        return new ResponseEntity<>("An error occurred while processing the request", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                return new ResponseEntity<>("You are not authorized to update the avatar", HttpStatus.UNAUTHORIZED);
            }
            return new ResponseEntity<>("You are not authorized to update the avatar", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Please provide a valid token", HttpStatus.BAD_REQUEST);
    }


    @PutMapping("/profile/banner")
    @Transactional
    public ResponseEntity<String> updateBanner(@RequestParam Integer userId, @RequestPart MultipartFile banner,
                                               HttpServletRequest request) {
        if (banner == null) {
            return new ResponseEntity<>("Banner can't be null", HttpStatus.BAD_REQUEST);
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtGenerator.validateToken(token)) {
                if (Objects.equals(jwtGenerator.getUsernameFromToken(token), userRepository.findUserById(userId.longValue()).get().getUsername())) {
                    try {
                        if (homeService.updateBanner(userId, banner)) {
                            return new ResponseEntity<>("Banner updated successfully", HttpStatus.OK);
                        }
                        return new ResponseEntity<>("Banner update failed", HttpStatus.UNAUTHORIZED);
                    } catch (Exception e) {
                        log.error(e.getMessage(), e);
                        return new ResponseEntity<>("An error occurred while processing the request", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                return new ResponseEntity<>("You are not authorized to update the banner", HttpStatus.UNAUTHORIZED);
            }
            return new ResponseEntity<>("You are not authorized to update the banner", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Please provide a valid token", HttpStatus.BAD_REQUEST);
    }


    @PostMapping("/follow/{id}")
    public ResponseEntity<?> followAUser(@PathVariable Integer id, @RequestParam Integer targetId,
                                         HttpServletRequest request) {
        if (targetId == null) {
            return new ResponseEntity<>("Follower can't be null", HttpStatus.BAD_REQUEST);
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtGenerator.validateToken(token)) {
                if (Objects.equals(jwtGenerator.getUsernameFromToken(token),
                        userRepository.findUserById(id.longValue()).get().getUsername())) {
                    try {
                        if (homeService.followAUser(id.longValue(), targetId.longValue())) {
                            return new ResponseEntity<>("Follow success", HttpStatus.OK);
                        }
                        return new ResponseEntity<>("Follow failed", HttpStatus.UNAUTHORIZED);
                    } catch (Exception e) {
                        log.error(e.getMessage(), e);
                        return new ResponseEntity<>("An error occurred while processing the request", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                return new ResponseEntity<>("You are not authorized to follow the user", HttpStatus.UNAUTHORIZED);
            }
            return new ResponseEntity<>("You are not authorized to follow the user", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Please provide a valid token", HttpStatus.BAD_REQUEST);
    }


    @DeleteMapping("/follow/{id}")
    public ResponseEntity<?> unFollowAUser(@PathVariable Integer id, @RequestParam Integer targetId,
                                         HttpServletRequest request) {
        if (targetId == null) {
            return new ResponseEntity<>("Follower can't be null", HttpStatus.BAD_REQUEST);
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtGenerator.validateToken(token)) {
                if (Objects.equals(jwtGenerator.getUsernameFromToken(token),
                        userRepository.findUserById(id.longValue()).get().getUsername())) {
                    try {
                        if (homeService.unFollowAUser(id.longValue(), targetId.longValue())) {
                            return new ResponseEntity<>("Unfollow success", HttpStatus.OK);
                        }
                        return new ResponseEntity<>("Unfollow failed", HttpStatus.UNAUTHORIZED);
                    } catch (Exception e) {
                        log.error(e.getMessage(), e);
                        return new ResponseEntity<>("An error occurred while processing the request", HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
                return new ResponseEntity<>("You are not authorized to unfollow the user", HttpStatus.UNAUTHORIZED);
            }
            return new ResponseEntity<>("You are not authorized to unfollow the user", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Please provide a valid token", HttpStatus.BAD_REQUEST);
    }


    @GetMapping("/reset-password")
    public ResponseEntity<?> sendCode(@RequestParam String email) {
        if (userRepository.existsByEmail(email)) {
            if (homeService.sendCode(email)) {
                return new ResponseEntity<>("Code sent", HttpStatus.OK);
            }
        }
        return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> verifyCode(@RequestParam String code) {
        if (code.isEmpty()) {
            return new ResponseEntity<>("Code can't be null", HttpStatus.BAD_REQUEST);
        }
        if (verificationRepository.existsByCodeAndExpirationTimeIsAfterAndStatus(code, new Date(), Verification.Status.PENDING)) {
            if (homeService.verifyCode(code)) {
                return new ResponseEntity<>("Code verified successfully", HttpStatus.OK);
            }
            return new ResponseEntity<>("Code verification failed", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Code expired or not found", HttpStatus.NOT_FOUND);
    }


    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String password) {
        if (password.isEmpty()) {
            return new ResponseEntity<>("Password can't be null", HttpStatus.BAD_REQUEST);
        }
        if (homeService.resetPassword(email, password)) {
            return new ResponseEntity<>("Password reset successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Password not found", HttpStatus.NOT_FOUND);
    }
}
