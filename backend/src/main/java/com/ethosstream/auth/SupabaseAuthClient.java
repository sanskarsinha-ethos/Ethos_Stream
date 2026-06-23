package com.ethosstream.auth;

import com.ethosstream.exception.SupabaseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Component
@Slf4j
public class SupabaseAuthClient {

    private final WebClient webClient;
    private final String serviceRoleKey;

    public SupabaseAuthClient(
            @Value("${ethos.supabase.url}") String supabaseUrl,
            @Value("${ethos.supabase.service-role-key}") String serviceRoleKey) {
        this.serviceRoleKey = serviceRoleKey;
        this.webClient = WebClient.builder()
                .baseUrl(supabaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("apikey", serviceRoleKey)
                .build();
    }

    /**
     * Verify a Supabase access token and return user data.
     * Calls GET /auth/v1/user with the token as Bearer.
     */
    public Map<String, Object> verifyToken(String token) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.get()
                    .uri("/auth/v1/user")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return response;
        } catch (Exception e) {
            log.error("Failed to verify Supabase token: {}", e.getMessage());
            throw new SupabaseException("Failed to verify token with Supabase", e);
        }
    }

    /**
     * Get a user by ID using the admin/service-role endpoint.
     * Calls GET /auth/v1/admin/users/{userId}
     */
    public Map<String, Object> getUserById(String userId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.get()
                    .uri("/auth/v1/admin/users/{userId}", userId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return response;
        } catch (Exception e) {
            log.error("Failed to get user {} from Supabase: {}", userId, e.getMessage());
            throw new SupabaseException("Failed to get user from Supabase: " + userId, e);
        }
    }

    /**
     * Update user metadata in Supabase Auth.
     */
    public void updateUserMetadata(String userId, Map<String, Object> metadata) {
        try {
            webClient.put()
                    .uri("/auth/v1/admin/users/{userId}", userId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .body(Mono.just(Map.of("user_metadata", metadata)), Map.class)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            log.info("Updated Supabase user metadata for user {}", userId);
        } catch (Exception e) {
            log.error("Failed to update user metadata for {}: {}", userId, e.getMessage());
            throw new SupabaseException("Failed to update user metadata", e);
        }
    }
}
