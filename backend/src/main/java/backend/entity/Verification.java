package backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "verification")
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    private Date createdTime;

    private Date expirationTime;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Status {
    PENDING,
    USED,
    EXPIRED
}
}


