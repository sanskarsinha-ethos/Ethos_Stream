package com.ethosstream.streaming;

import com.ethosstream.content.ContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ViewCountScheduler {

    private final RedisTemplate<String, String> redisTemplate;
    private final ContentRepository contentRepository;

    /**
     * Flush Redis view counts to the database every 5 minutes.
     * Key pattern: video:views:{videoId}
     */
    @Scheduled(fixedRate = 300_000) // 5 minutes
    @Transactional
    public void flushViewCounts() {
        Set<String> keys = redisTemplate.keys("video:views:*");
        if (keys == null || keys.isEmpty()) {
            return;
        }

        int flushed = 0;
        for (String key : keys) {
            try {
                String countStr = redisTemplate.opsForValue().getAndDelete(key);
                if (countStr != null) {
                    long count = Long.parseLong(countStr);
                    if (count > 0) {
                        String videoIdStr = key.replace("video:views:", "");
                        UUID videoId = UUID.fromString(videoIdStr);
                        contentRepository.incrementViewCount(videoId, count);
                        flushed++;
                    }
                }
            } catch (Exception e) {
                log.error("Failed to flush view count for key {}: {}", key, e.getMessage());
            }
        }

        if (flushed > 0) {
            log.info("Flushed view counts for {} videos from Redis to database", flushed);
        }
    }
}
