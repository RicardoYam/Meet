package backend.controller;

import backend.dto.LoginDTO;
import backend.dto.LoginResponseDTO;
import backend.dto.UserDTO;
import backend.repository.UserRepository;
import backend.service.HomeService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin("*")
@Log4j2
public class HomeController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HomeService homeService;


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



}
