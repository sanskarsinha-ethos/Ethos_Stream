package com.ethosstream.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {

    private UUID id;
    private UUID userId;
    private String name;
    private String avatarUrl;
    private Boolean isKids;
    private OffsetDateTime createdAt;
}
