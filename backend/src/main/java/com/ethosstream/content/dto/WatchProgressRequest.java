package com.ethosstream.content.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchProgressRequest {

    private Integer positionSeconds;
    private Boolean isCompleted;
}
