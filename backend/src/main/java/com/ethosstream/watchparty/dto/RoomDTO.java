package com.ethosstream.watchparty.dto;

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
public class RoomDTO {

    private UUID id;
    private String code;
    private UUID videoId;
    private String videoTitle;
    private String videoThumbnail;
    private UUID hostProfileId;
    private String status;
    private Double currentPositionSeconds;
    private Integer maxParticipants;
    private OffsetDateTime createdAt;
    private List<ParticipantInfo> participants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private UUID profileId;
        private String name;
        private String avatarUrl;
        private boolean isHost;
    }
}
