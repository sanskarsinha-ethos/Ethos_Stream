package com.ethosstream.content;

import com.ethosstream.content.dto.VideoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VideoMapper {

    @Mapping(target = "genres", source = "genres")
    VideoDTO toDto(Video video);

    List<VideoDTO> toDtoList(List<Video> videos);

    default List<VideoDTO.GenreDTO> mapGenres(Set<Genre> genres) {
        if (genres == null) return null;
        return genres.stream()
                .map(g -> VideoDTO.GenreDTO.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .slug(g.getSlug())
                        .build())
                .collect(Collectors.toList());
    }
}
