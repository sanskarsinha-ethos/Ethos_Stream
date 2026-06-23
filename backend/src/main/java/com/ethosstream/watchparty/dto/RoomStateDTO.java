package com.ethosstream.watchparty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomStateDTO {

    private String code;
    private String status;
    private Double currentPositionSeconds;
    private Long lastUpdatedTimestamp;
    private Set<String> participantIds;
}
