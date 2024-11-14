package backend.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GitHubEmail {
    private String email;

    private boolean primary;

    private boolean verified;

    private String visibility;
}
