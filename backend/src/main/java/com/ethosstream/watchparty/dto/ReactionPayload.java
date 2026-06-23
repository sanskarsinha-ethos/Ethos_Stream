package com.ethosstream.watchparty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionPayload {

    private String emoji;
    private String profileId;
    private Float x;
    private Float y;
}
