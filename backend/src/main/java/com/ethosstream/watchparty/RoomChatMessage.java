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
@Table(name = "room_chat_messages", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "profile_id")
    private UUID profileId;

    @Column(name = "content", nullable = false, length = 500)
    private String content;

    @Column(name = "type", length = 20)
    @Builder.Default
    private String type = "text";

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;
}
