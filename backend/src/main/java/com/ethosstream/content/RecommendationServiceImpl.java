package com.ethosstream.content;

import com.ethosstream.content.dto.VideoDTO;
import com.ethosstream.user.MyList;
import com.ethosstream.user.MyListRepository;
import com.ethosstream.user.WatchHistory;
import com.ethosstream.user.WatchHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    private final WatchHistoryRepository watchHistoryRepository;
    private final MyListRepository myListRepository;
    private final ContentRepository contentRepository;
    private final VideoMapper videoMapper;

    @Override
    @Transactional
    public void updateWatchHistory(UUID profileId, UUID videoId, Integer positionSeconds, Boolean isCompleted) {
        WatchHistory history = watchHistoryRepository.findByProfileIdAndVideoId(profileId, videoId)
                .orElseGet(() -> WatchHistory.builder()
                        .profileId(profileId)
                        .videoId(videoId)
                        .build());

        history.setPositionSeconds(positionSeconds);
        if (isCompleted != null) {
            history.setIsCompleted(isCompleted);
        }
        history.setWatchedAt(OffsetDateTime.now());

        watchHistoryRepository.save(history);
    }

    @Override
    public Page<VideoDTO> getWatchHistory(UUID profileId, Pageable pageable) {
        Page<WatchHistory> historyPage = watchHistoryRepository.findByProfileIdOrderByWatchedAtDesc(profileId, pageable);

        List<VideoDTO> videos = historyPage.getContent().stream()
                .map(h -> contentRepository.findById(h.getVideoId()).orElse(null))
                .filter(v -> v != null)
                .map(videoMapper::toDto)
                .collect(Collectors.toList());

        return new PageImpl<>(videos, pageable, historyPage.getTotalElements());
    }

    @Override
    @Transactional
    public void addToMyList(UUID profileId, UUID videoId) {
        if (!myListRepository.existsByProfileIdAndVideoId(profileId, videoId)) {
            MyList item = MyList.builder()
                    .profileId(profileId)
                    .videoId(videoId)
                    .addedAt(OffsetDateTime.now())
                    .build();
            myListRepository.save(item);
        }
    }

    @Override
    @Transactional
    public void removeFromMyList(UUID profileId, UUID videoId) {
        myListRepository.findByProfileIdAndVideoId(profileId, videoId)
                .ifPresent(myListRepository::delete);
    }

    @Override
    public Page<VideoDTO> getMyList(UUID profileId, Pageable pageable) {
        Page<MyList> listPage = myListRepository.findByProfileIdOrderByAddedAtDesc(profileId, pageable);

        List<VideoDTO> videos = listPage.getContent().stream()
                .map(item -> contentRepository.findById(item.getVideoId()).orElse(null))
                .filter(v -> v != null)
                .map(videoMapper::toDto)
                .collect(Collectors.toList());

        return new PageImpl<>(videos, pageable, listPage.getTotalElements());
    }

    @Override
    public List<VideoDTO> getRecommendations(UUID profileId, int limit) {
        // 1. Get recent watch history
        List<UUID> recentVideoIds = watchHistoryRepository.findRecentVideoIdsByProfileId(profileId, PageRequest.of(0, 10));

        if (recentVideoIds.isEmpty()) {
            // Fallback: return highest viewed videos
            Page<Video> popular = contentRepository.findAll(
                    PageRequest.of(0, limit, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "viewCount"))
            );
            return videoMapper.toDtoList(popular.getContent());
        }

        // 2. Fetch those videos and tally genres
        List<Video> recentVideos = contentRepository.findAllById(recentVideoIds);
        Map<Integer, Integer> genreFrequency = new HashMap<>();

        for (Video v : recentVideos) {
            for (Genre g : v.getGenres()) {
                genreFrequency.put(g.getId(), genreFrequency.getOrDefault(g.getId(), 0) + 1);
            }
        }

        if (genreFrequency.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Get top 2 genres
        List<Integer> topGenreIds = genreFrequency.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .limit(2)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // 4. Query for videos matching those genres, excluding the ones already watched
        Page<Video> recommended = contentRepository.findByGenreIdsExcluding(
                topGenreIds,
                recentVideoIds,
                PageRequest.of(0, limit)
        );

        return videoMapper.toDtoList(recommended.getContent());
    }
}
