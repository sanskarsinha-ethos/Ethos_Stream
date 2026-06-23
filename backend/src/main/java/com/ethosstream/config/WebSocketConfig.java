package com.ethosstream.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${ethos.supabase.jwt-secret}")
    private String supabaseJwtSecret;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/user");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extract token from STOMP CONNECT headers or query param
                    String token = null;

                    // Try Authorization header first
                    List<String> authHeaders = accessor.getNativeHeader("Authorization");
                    if (authHeaders != null && !authHeaders.isEmpty()) {
                        String authHeader = authHeaders.get(0);
                        if (authHeader.startsWith("Bearer ")) {
                            token = authHeader.substring(7);
                        }
                    }

                    // Fallback: try "token" header (from query param ws://host/ws?token=xxx)
                    if (token == null) {
                        List<String> tokenHeaders = accessor.getNativeHeader("token");
                        if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
                            token = tokenHeaders.get(0);
                        }
                    }

                    if (token != null) {
                        try {
                            Claims claims = Jwts.parser()
                                    .verifyWith(Keys.hmacShaKeyFor(
                                            supabaseJwtSecret.getBytes(StandardCharsets.UTF_8)))
                                    .build()
                                    .parseSignedClaims(token)
                                    .getPayload();

                            String userId = claims.getSubject();
                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(
                                            userId, null,
                                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                                    );
                            accessor.setUser(auth);
                            log.debug("WebSocket CONNECT authenticated for user: {}", userId);
                        } catch (Exception e) {
                            log.error("WebSocket CONNECT authentication failed: {}", e.getMessage());
                            throw new IllegalArgumentException("Invalid token on WebSocket CONNECT");
                        }
                    } else {
                        log.warn("WebSocket CONNECT without token");
                        throw new IllegalArgumentException("Missing token on WebSocket CONNECT");
                    }
                }
                return message;
            }
        });
    }
}
