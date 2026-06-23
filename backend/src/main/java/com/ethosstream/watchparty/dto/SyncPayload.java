package com.ethosstream.watchparty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncPayload {

    private String type; // PLAY, PAUSE, SEEK
    private Double position;
    private Long timestamp;
    private String senderProfileId;
}
