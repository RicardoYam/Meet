package backend.dto;

import lombok.Data;

@Data
public class LoginDTO {

    // user can use email address and username
    private String account;

    private String password;
}
