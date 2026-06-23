package com.ethosstream.watchparty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantUpdate {

    private String type; // JOIN, LEAVE
    private UUID profileId;
    private String profileName;
    private String avatarUrl;
    private int totalParticipants;
    private List<RoomDTO.ParticipantInfo> participants;
}
