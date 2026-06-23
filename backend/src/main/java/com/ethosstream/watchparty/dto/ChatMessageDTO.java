package com.ethosstream.watchparty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

    private String roomCode;
    private String profileId;
    private String profileName;
    private String avatarUrl;
    private String content;
    private String type; // text, emoji
    private OffsetDateTime sentAt;
}
