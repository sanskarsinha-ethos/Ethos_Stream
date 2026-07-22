package com.ethosstream.watchparty;

import com.ethosstream.watchparty.dto.RoomDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-16T11:31:05+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
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
