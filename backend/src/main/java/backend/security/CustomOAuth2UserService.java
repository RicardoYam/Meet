package backend.security;

import backend.entity.Role;
import backend.entity.User;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import backend.util.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;


public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String accessToken = userRequest.getAccessToken().getTokenValue();
        String emailApiUrl = "https://api.github.com/user/emails";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<List<GitHubEmail>> response = restTemplate.exchange(emailApiUrl, HttpMethod.GET, entity,
                                                                            new ParameterizedTypeReference<List<GitHubEmail>>() {});

        List<GitHubEmail> emails = response.getBody();
        User user;
        for (GitHubEmail email : emails) {
            if (email.isPrimary() && email.getEmail() != null) {
                Optional<User> existingUser = userRepository.findUserByEmail(email.getEmail());

                if (existingUser.isPresent()) {
                    user = existingUser.get();
                    user.setUsername(oauth2User.getAttribute("login"));
                    userRepository.save(user);
                    break;
                } else {
                    user = new User();
                    Role roles = roleRepository.findByName("USER");
                    user.setRoles(Collections.singletonList(roles));
                    user.setEmail(email.getEmail());
                    user.setUsername(oauth2User.getAttribute("login"));
                    user.setAvatarName(Utils.getFileNameFromUrl(oauth2User.getAttribute("avatar_url")));
                    try {
                        user.setAvatarType(Utils.fetchImageType(oauth2User.getAttribute("avatar_url")));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    try {
                        user.setAvatarBlob(Utils.fetchImageAsByteArray(oauth2User.getAttribute("avatar_url")));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    user.setBio(oauth2User.getAttribute("bio"));
                    user.setCreatedTime(new Date());
                    userRepository.save(user);
                    break;
                }
            }
        }
        return oauth2User;
    }
}
