package com.ethosstream.content;

import com.ethosstream.content.dto.VideoDTO;
import com.ethosstream.streaming.HlsService;
import com.ethosstream.streaming.S3Service;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final GenreRepository genreRepository;
    private final VideoMapper videoMapper;
    private final HlsService hlsService;
    private final S3Service s3Service;

    @Override
    public Page<VideoDTO> getVideos(String genre, String search, Pageable pageable) {
        Page<Video> videos;

        if (genre != null && !genre.isBlank() && search != null && !search.isBlank()) {
            videos = contentRepository.findByGenreSlugAndSearch(genre, search, pageable);
        } else if (genre != null && !genre.isBlank()) {
            videos = contentRepository.findByGenreSlug(genre, pageable);
        } else if (search != null && !search.isBlank()) {
            videos = contentRepository.searchByTitle(search, pageable);
        } else {
            videos = contentRepository.findAll(pageable);
        }

        return videos.map(videoMapper::toDto);
    }

    @Override
    public List<VideoDTO> getFeaturedVideos() {
        List<Video> featured = contentRepository.findByIsFeaturedTrue();
        return videoMapper.toDtoList(featured);
    }

    @Override
    public VideoDTO getVideoById(UUID id) {
        Video video = contentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + id));
        return videoMapper.toDto(video);
    }

    @Override
    @Transactional
    public VideoDTO uploadVideo(MultipartFile file, String title, String description,
                                Integer releaseYear, String rating, String type,
                                List<Integer> genreIds) {
        log.info("Starting video upload: title={}, size={}", title, file.getSize());

        UUID videoId = UUID.randomUUID();

        // 1. Transcode video to HLS
        Path hlsOutputDir = hlsService.transcode(file, videoId.toString());

        // 2. Upload HLS files to AWS S3
        s3Service.uploadDirectory(hlsOutputDir, videoId.toString());

        // 3. Get the CloudFront master playlist URL
        String hlsMasterUrl = s3Service.getCloudFrontUrl(videoId.toString());

        // 4. Resolve genres
        Set<Genre> genres = new HashSet<>();
        if (genreIds != null && !genreIds.isEmpty()) {
            genres = new HashSet<>(genreRepository.findAllById(genreIds));
        }

        // 5. Create video entity
        Video video = Video.builder()
                .id(videoId)
                .title(title)
                .description(description)
                .hlsMasterUrl(hlsMasterUrl)
                .releaseYear(releaseYear)
                .rating(rating)
                .type(type != null ? type : "movie")
                .isFeatured(false)
                .viewCount(0L)
                .genres(genres)
                .createdAt(OffsetDateTime.now())
                .build();

        Video saved = contentRepository.save(video);

        // 6. Clean up temp files
        hlsService.cleanup(hlsOutputDir);

        log.info("Video uploaded successfully: id={}, title={}", saved.getId(), saved.getTitle());
        return videoMapper.toDto(saved);
    }

    @Override
    public List<VideoDTO.GenreDTO> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(g -> VideoDTO.GenreDTO.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .slug(g.getSlug())
                        .build())
                .collect(Collectors.toList());
    }
}
