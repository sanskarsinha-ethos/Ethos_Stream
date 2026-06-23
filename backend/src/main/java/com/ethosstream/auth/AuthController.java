package com.ethosstream.auth;

import com.ethosstream.auth.dto.SyncProfileRequest;
import com.ethosstream.common.ApiResponse;
import com.ethosstream.user.User;
import com.ethosstream.user.dto.ProfileDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/sync-profile
     * Called after Supabase signup to create the user's first Profile.
     * Requires a valid Supabase JWT in the Authorization header.
     */
    @PostMapping("/sync-profile")
    public ResponseEntity<ApiResponse<ProfileDTO>> syncProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SyncProfileRequest request) {
        ProfileDTO profile = authService.syncProfile(user.getId(), request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(profile, "Profile synced successfully"));
    }
}
