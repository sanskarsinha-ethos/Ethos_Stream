package com.ethosstream.content;

import com.ethosstream.content.dto.VideoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ContentService {

    Page<VideoDTO> getVideos(String genre, String search, Pageable pageable);

    List<VideoDTO> getFeaturedVideos();

    VideoDTO getVideoById(UUID id);

    VideoDTO uploadVideo(MultipartFile file, String title, String description,
                         Integer releaseYear, String rating, String type,
                         List<Integer> genreIds);

    List<VideoDTO.GenreDTO> getAllGenres();
}
