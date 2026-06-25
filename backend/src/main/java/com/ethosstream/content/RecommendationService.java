package com.ethosstream.content;

import com.ethosstream.content.dto.VideoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RecommendationService {

    void updateWatchHistory(UUID profileId, UUID videoId, Integer positionSeconds, Boolean isCompleted);

    Page<VideoDTO> getWatchHistory(UUID profileId, Pageable pageable);

    void addToMyList(UUID profileId, UUID videoId);

    void removeFromMyList(UUID profileId, UUID videoId);

    Page<VideoDTO> getMyList(UUID profileId, Pageable pageable);

    List<VideoDTO> getRecommendations(UUID profileId, int limit);
}
