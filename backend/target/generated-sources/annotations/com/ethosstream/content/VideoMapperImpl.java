package com.ethosstream.content;

import com.ethosstream.content.dto.VideoDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-16T11:31:05+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class VideoMapperImpl implements VideoMapper {

    @Override
    public VideoDTO toDto(Video video) {
        if ( video == null ) {
            return null;
        }

        VideoDTO.VideoDTOBuilder videoDTO = VideoDTO.builder();

        videoDTO.genres( mapGenres( video.getGenres() ) );
        videoDTO.bannerUrl( video.getBannerUrl() );
        videoDTO.createdAt( video.getCreatedAt() );
        videoDTO.description( video.getDescription() );
        videoDTO.durationSeconds( video.getDurationSeconds() );
        videoDTO.hlsMasterUrl( video.getHlsMasterUrl() );
        videoDTO.id( video.getId() );
        videoDTO.isFeatured( video.getIsFeatured() );
        videoDTO.rating( video.getRating() );
        videoDTO.releaseYear( video.getReleaseYear() );
        videoDTO.thumbnailUrl( video.getThumbnailUrl() );
        videoDTO.title( video.getTitle() );
        videoDTO.type( video.getType() );
        videoDTO.viewCount( video.getViewCount() );

        return videoDTO.build();
    }

    @Override
    public List<VideoDTO> toDtoList(List<Video> videos) {
        if ( videos == null ) {
            return null;
        }

        List<VideoDTO> list = new ArrayList<VideoDTO>( videos.size() );
        for ( Video video : videos ) {
            list.add( toDto( video ) );
        }

        return list;
    }
}
