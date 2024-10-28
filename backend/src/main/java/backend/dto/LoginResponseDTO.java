package backend.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {

    private String token;

    private String tokenType = "Bearer ";

    private Long userId;

    private String username;

    private String email;

    private String avatar;

    public LoginResponseDTO(String token, Long userId, String username, String email, String avatar) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.avatar = avatar;
    }
}
