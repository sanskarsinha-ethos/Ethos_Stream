package com.ethosstream.streaming;

import com.ethosstream.common.ApiResponse;
import com.ethosstream.content.ContentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@Slf4j
public class StreamingController {

    private final ContentRepository contentRepository;
    private final S3Service s3Service;
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * GET /api/videos/{id}/stream — returns the CloudFront HLS master URL.
     * Increments view count in Redis (flushed to DB periodically).
     */
    @GetMapping("/{id}/stream")
    public ResponseEntity<ApiResponse<Map<String, String>>> getStreamUrl(@PathVariable UUID id) {
        var video = contentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + id));

        // Increment view count in Redis
        String viewCountKey = "video:views:" + id;
        redisTemplate.opsForValue().increment(viewCountKey);
        log.debug("Incremented view count for video {} in Redis", id);

        String streamUrl;
        if (video.getHlsMasterUrl() != null && !video.getHlsMasterUrl().isBlank()) {
            streamUrl = video.getHlsMasterUrl();
        } else {
            streamUrl = s3Service.getCloudFrontUrl(id.toString());
        }

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("streamUrl", streamUrl),
                "Stream URL retrieved"
        ));
    }
}
