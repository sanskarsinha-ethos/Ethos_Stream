package com.ethosstream.watchparty;

import com.ethosstream.watchparty.dto.RoomDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-25T14:34:51+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class RoomMapperImpl implements RoomMapper {

    @Override
    public RoomDTO toDto(Room room) {
        if ( room == null ) {
            return null;
        }

        RoomDTO.RoomDTOBuilder roomDTO = RoomDTO.builder();

        roomDTO.code( room.getCode() );
        roomDTO.createdAt( room.getCreatedAt() );
        roomDTO.currentPositionSeconds( room.getCurrentPositionSeconds() );
        roomDTO.hostProfileId( room.getHostProfileId() );
        roomDTO.id( room.getId() );
        roomDTO.maxParticipants( room.getMaxParticipants() );
        roomDTO.status( room.getStatus() );
        roomDTO.videoId( room.getVideoId() );

        return roomDTO.build();
    }
}
