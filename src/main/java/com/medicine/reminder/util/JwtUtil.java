package com.medicine.reminder.util;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component; import java.nio.charset.StandardCharsets; import java.util.*;
@Component
public class JwtUtil {
 private final byte[] key; private final long expiration;
 public JwtUtil(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.expiration}") long expiration){this.key=secret.getBytes(StandardCharsets.UTF_8);this.expiration=expiration;}
 public String generate(String username,Long userId){ return Jwts.builder().setSubject(username).claim("userId",userId).setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis()+expiration)).signWith(Keys.hmacShaKeyFor(key),SignatureAlgorithm.HS256).compact(); }
 public String username(String token){return claims(token).getSubject();}
 public Long userId(String token){return claims(token).get("userId",Number.class).longValue();}
 public boolean valid(String token){try{claims(token);return true;}catch(JwtException|IllegalArgumentException e){return false;}}
 private Claims claims(String token){return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();}
}
