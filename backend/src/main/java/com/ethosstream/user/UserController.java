package com.ethosstream.user;

import com.ethosstream.common.ApiResponse;
import com.ethosstream.user.dto.CreateProfileRequest;
import com.ethosstream.user.dto.ProfileDTO;
import com.ethosstream.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProfileDTO>>> getMyProfiles(
            @AuthenticationPrincipal User user) {
        List<ProfileDTO> profiles = userService.getProfilesByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProfileDTO>> createProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProfileRequest request) {
        ProfileDTO profile = userService.createProfile(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(profile, "Profile created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfileDTO>> updateProfile(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileDTO profile = userService.updateProfile(user.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        userService.deleteProfile(user.getId(), id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, "Profile deleted successfully"));
    }
}
