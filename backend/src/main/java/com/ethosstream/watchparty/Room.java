package com.ethosstream.watchparty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "rooms", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "host_profile_id")
    private UUID hostProfileId;

    @Column(name = "video_id")
    private UUID videoId;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "waiting";

    @Column(name = "current_position_seconds")
    @Builder.Default
    private Double currentPositionSeconds = 0.0;

    @Column(name = "max_participants")
    @Builder.Default
    private Integer maxParticipants = 4;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;
}
