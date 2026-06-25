package com.ethosstream.auth;

import com.ethosstream.user.User;
import com.ethosstream.user.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Locator;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.JwkSet;
import io.jsonwebtoken.security.Jwks;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.security.Key;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SupabaseJwtFilter extends OncePerRequestFilter {

    @Value("${ethos.supabase.jwt-secret}")
    private String supabaseJwtSecret;

    @Value("${ethos.supabase.url}")
    private String supabaseUrl;

    private final UserRepository userRepository;

    private JwkSet jwkSet;
    private Key symmetricKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(supabaseJwtSecret);
        this.symmetricKey = Keys.hmacShaKeyFor(keyBytes);

        try {
            RestTemplate restTemplate = new RestTemplate();
            String jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
            String jwksJson = restTemplate.getForObject(jwksUrl, String.class);
            if (jwksJson != null && !jwksJson.isEmpty()) {
                this.jwkSet = Jwks.setParser().build().parse(jwksJson);
                log.info("Successfully fetched and configured Supabase JWKS.");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch Supabase JWKS from {}. ES256 tokens might not verify correctly: {}", supabaseUrl, e.getMessage());
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .keyLocator(header -> {
                        if (jwkSet != null && header instanceof io.jsonwebtoken.JwsHeader) {
                            String kid = ((io.jsonwebtoken.JwsHeader) header).getKeyId();
                            if (kid != null) {
                                for (io.jsonwebtoken.security.Jwk<?> jwk : jwkSet.getKeys()) {
                                    if (kid.equals(jwk.getId())) {
                                        return jwk.toKey();
                                    }
                                }
                            }
                        }
                        return symmetricKey;
                    })
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.getSubject();

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userRepository.findById(UUID.fromString(userId))
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);

                log.debug("Authenticated user {} via Supabase JWT", userId);
            }

        } catch (UsernameNotFoundException e) {
            log.warn("User from JWT not found in database: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
            return;
        } catch (JwtException e) {
            log.warn("Invalid Supabase JWT: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        } catch (Exception e) {
            log.error("Unexpected error in SupabaseJwtFilter", e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
            return;
        }

        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/ws") ||
               path.startsWith("/actuator");
    }
}
