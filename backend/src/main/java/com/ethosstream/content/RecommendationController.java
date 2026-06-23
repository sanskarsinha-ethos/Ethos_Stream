package com.ethosstream.content;

import com.ethosstream.common.ApiResponse;
import com.ethosstream.content.dto.VideoDTO;
import com.ethosstream.content.dto.WatchProgressRequest;
import com.ethosstream.user.User;
import com.ethosstream.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles/{profileId}")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserService userService; // to verify profile ownership

    /**
     * POST /api/profiles/{profileId}/history/{videoId}
     */
    @PostMapping("/history/{videoId}")
    public ResponseEntity<ApiResponse<Void>> updateWatchProgress(
            @AuthenticationPrincipal User user,
            @PathVariable UUID profileId,
            @PathVariable UUID videoId,
            @RequestBody WatchProgressRequest request) {
        
        userService.verifyProfileOwnership(user.getId(), profileId);
        
        recommendationService.updateWatchHistory(
                profileId, videoId, request.getPositionSeconds(), request.getIsCompleted());
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * GET /api/profiles/{profileId}/history
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<VideoDTO>>> getWatchHistory(
            @AuthenticationPrincipal User user,
            @PathVariable UUID profileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        userService.verifyProfileOwnership(user.getId(), profileId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<VideoDTO> history = recommendationService.getWatchHistory(profileId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * POST /api/profiles/{profileId}/mylist/{videoId}
     */
    @PostMapping("/mylist/{videoId}")
    public ResponseEntity<ApiResponse<Void>> addToMyList(
            @AuthenticationPrincipal User user,
            @PathVariable UUID profileId,
            @PathVariable UUID videoId) {
        
        userService.verifyProfileOwnership(user.getId(), profileId);
        recommendationService.addToMyList(profileId, videoId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Added to My List"));
    }

    /**
     * DELETE /api/profiles/{profileId}/mylist/{videoId}
     */
    @DeleteMapping("/mylist/{videoId}")
    public ResponseEntity<ApiResponse<Void>> removeFromMyList(
            @AuthenticationPrincipal User user,
            @PathVariable UUID profileId,
            @PathVariable UUID videoId) {
        
        userService.verifyProfileOwnership(user.getId(), profileId);
        recommendationService.removeFromMyList(profileId, videoId);
        
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null));
    }

    /**
     * GET /api/profiles/{profileId}/mylist
     */
    @GetMapping("/mylist")
    public ResponseEntity<ApiResponse<Page<VideoDTO>>> getMyList(
            @AuthenticationPrincipal User user,
            @PathVariable UUID profileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        userService.verifyProfileOwnership(user.getId(), profileId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<VideoDTO> myList = recommendationService.getMyList(profileId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(myList));
    }

    /**
     * GET /api/profiles/{profileId}/recommendations
     */
    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<VideoDTO>>> getRecommendations(
            @AuthenticationPrincipal User user,
            @PathVariable UUID profileId,
            @RequestParam(defaultValue = "10") int limit) {
        
        userService.verifyProfileOwnership(user.getId(), profileId);
        
        List<VideoDTO> recommendations = recommendationService.getRecommendations(profileId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
}
