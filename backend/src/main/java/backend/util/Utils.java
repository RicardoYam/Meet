package backend.util;

import backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.Date;

public class Utils {

    private static final String SECRET_KEY = "your-secret-key";

    public static User getImageData(User user) {
        if (user.getAvatarBlob() != null) {
            String base64Image = Base64.getEncoder().encodeToString(user.getAvatarBlob());
            user.setAvatarData("data:" + user.getAvatarType() + ";base64," + base64Image);
        }
        return user;
    }

    public static User getBannerDate(User user) {
        if (user.getBannerBlob() != null) {
            String base64Image = Base64.getEncoder().encodeToString(user.getBannerBlob());
            user.setBannerData("data:" + user.getBannerType() + ";base64," + base64Image);
        }
        return user;
    }

    public static String generateVerificationCode() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }

    public static byte[] fetchImageAsByteArray(String url) throws IOException {
        try (InputStream in = new URL(url).openStream()) {
            return in.readAllBytes();
        }
    }

    public static String getFileNameFromUrl(String url) {
        return url.substring(url.lastIndexOf("/") + 1);
    }

    public static String fetchImageType(String url) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("HEAD");
        return connection.getContentType();
    }


    public static String generateOneTimeJwt(String username) {
        long expirationTime = 15 * 60 * 1000;

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public static boolean isOneTimeTokenExpired(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();

            Date expirationDate = claims.getExpiration();

            return expirationDate.before(new Date());
        } catch (SignatureException e) {
            return true;
        }
    }
}
