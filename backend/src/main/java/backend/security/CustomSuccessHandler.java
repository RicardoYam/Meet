package backend.security;

import backend.entity.OneTimeToken;
import backend.entity.User;
import backend.repository.OneTimeTokenRepository;
import backend.repository.UserRepository;
import backend.util.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@Component
public class CustomSuccessHandler implements AuthenticationSuccessHandler {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OneTimeTokenRepository oneTimeTokenRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String username = (String) oauth2User.getAttributes().get("login");


        Optional<User> optionalUser = userRepository.findUserByUsername(username);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String email = user.getEmail();

            String jwt = Utils.generateOneTimeJwt(username);

            OneTimeToken oneTimeToken = new OneTimeToken();
            oneTimeToken.setToken(jwt);
            oneTimeToken.setExpired(false);

            oneTimeTokenRepository.save(oneTimeToken);

            // Redirect to frontend with user information
            String redirectUrl = String.format("http://localhost:5173/oauth-signup?username=%s&email=%s&token=%s",
                                                username, email, jwt);


            response.setStatus(HttpServletResponse.SC_FOUND);


            response.sendRedirect(redirectUrl);
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
        }
    }
}
