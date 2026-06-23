package com.ethosstream.content;

import com.ethosstream.common.ApiResponse;
import com.ethosstream.content.dto.VideoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    /**
     * GET /api/videos — paged, filterable by genre and search
     */
    @GetMapping("/videos")
    public ResponseEntity<ApiResponse<Page<VideoDTO>>> getVideos(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<VideoDTO> videos = contentService.getVideos(genre, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(videos));
    }

    /**
     * GET /api/videos/featured — featured videos for hero banner
     */
    @GetMapping("/videos/featured")
    public ResponseEntity<ApiResponse<List<VideoDTO>>> getFeaturedVideos() {
        List<VideoDTO> featured = contentService.getFeaturedVideos();
        return ResponseEntity.ok(ApiResponse.success(featured));
    }

    /**
     * GET /api/videos/{id} — single video detail
     */
    @GetMapping("/videos/{id}")
    public ResponseEntity<ApiResponse<VideoDTO>> getVideoById(@PathVariable UUID id) {
        VideoDTO video = contentService.getVideoById(id);
        return ResponseEntity.ok(ApiResponse.success(video));
    }

    /**
     * GET /api/genres — all genres
     */
    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<VideoDTO.GenreDTO>>> getAllGenres() {
        List<VideoDTO.GenreDTO> genres = contentService.getAllGenres();
        return ResponseEntity.ok(ApiResponse.success(genres));
    }

    /**
     * POST /api/admin/videos/upload — multipart video upload + transcode pipeline
     */
    @PostMapping(value = "/admin/videos/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<VideoDTO>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam(value = "rating", required = false) String rating,
            @RequestParam(value = "type", required = false, defaultValue = "movie") String type,
            @RequestParam(value = "genreIds", required = false) List<Integer> genreIds) {
        VideoDTO video = contentService.uploadVideo(file, title, description,
                releaseYear, rating, type, genreIds);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(video, "Video uploaded and processing started"));
    }
}
