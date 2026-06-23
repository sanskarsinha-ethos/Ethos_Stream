package com.ethosstream.content.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDTO {

    private UUID id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String bannerUrl;
    private String hlsMasterUrl;
    private Integer durationSeconds;
    private Integer releaseYear;
    private String rating;
    private String type;
    private Boolean isFeatured;
    private Long viewCount;
    private OffsetDateTime createdAt;
    private List<GenreDTO> genres;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenreDTO {
        private Integer id;
        private String name;
        private String slug;
    }
}
