package com.ethosstream.watchparty;

import com.ethosstream.user.Profile;
import com.ethosstream.user.ProfileRepository;
import com.ethosstream.watchparty.dto.RoomDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoomMapper {

    @Mapping(target = "videoTitle", ignore = true)
    @Mapping(target = "videoThumbnail", ignore = true)
    @Mapping(target = "participants", ignore = true)
    RoomDTO toDto(Room room);

    default RoomDTO toDto(Room room, String videoTitle, String videoThumbnail,
                          List<RoomParticipant> participants, ProfileRepository profileRepository) {
        RoomDTO dto = toDto(room);
        dto.setVideoTitle(videoTitle);
        dto.setVideoThumbnail(videoThumbnail);

        if (participants != null && profileRepository != null) {
            List<RoomDTO.ParticipantInfo> pInfos = participants.stream()
                    .map(rp -> {
                        Profile profile = profileRepository.findById(rp.getProfileId()).orElse(null);
                        return RoomDTO.ParticipantInfo.builder()
                                .profileId(rp.getProfileId())
                                .name(profile != null ? profile.getName() : "Unknown")
                                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                                .isHost(rp.getProfileId().equals(room.getHostProfileId()))
                                .build();
                    })
                    .collect(Collectors.toList());
            dto.setParticipants(pInfos);
        }

        return dto;
    }
}
