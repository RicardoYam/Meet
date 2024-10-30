package backend.util;

import backend.entity.User;

import java.util.Base64;

public class Utils {

    public static User getImageData(User user) {
        if (user.getAvatarBlob() != null) {
            String base64Image = Base64.getEncoder().encodeToString(user.getAvatarBlob());
            user.setAvatarData("data:" + user.getAvatarType() + ";base64," + base64Image);
        }
        return user;
    }
}
