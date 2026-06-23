package com.ethosstream.watchparty;

import com.ethosstream.user.Profile;
import com.ethosstream.user.ProfileRepository;
import com.ethosstream.watchparty.dto.ChatMessageDTO;
import com.ethosstream.watchparty.dto.ReactionPayload;
import com.ethosstream.watchparty.dto.RoomStateDTO;
import com.ethosstream.watchparty.dto.SyncPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WatchPartyWebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRedisService redisService;
    private final RoomRepository roomRepository;
    private final RoomChatMessageRepository chatRepository;
    private final ProfileRepository profileRepository;

    @MessageMapping("/room/{code}/sync")
    public void handleSync(@DestinationVariable String code, SyncPayload payload) {
        log.debug("Sync event in room {}: type={}, pos={}", code, payload.getType(), payload.getPosition());

        // Update Redis state
        RoomStateDTO state = redisService.getRoomState(code);
        if (state != null) {
            state.setCurrentPositionSeconds(payload.getPosition());
            if ("PLAY".equals(payload.getType())) {
                state.setStatus("playing");
            } else if ("PAUSE".equals(payload.getType())) {
                state.setStatus("paused");
            }
            state.setLastUpdatedTimestamp(System.currentTimeMillis());
            redisService.saveRoomState(code, state);
        }

        // Broadcast to all participants in the room
        messagingTemplate.convertAndSend("/topic/room/" + code + "/sync", payload);
    }

    @MessageMapping("/room/{code}/chat")
    @Transactional
    public void handleChat(@DestinationVariable String code, ChatMessageDTO message) {
        log.debug("Chat event in room {}: profileId={}, content={}", code, message.getProfileId(), message.getContent());

        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + code));

        UUID profileId = UUID.fromString(message.getProfileId());
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found: " + profileId));

        // Save message to DB
        RoomChatMessage chatMessage = RoomChatMessage.builder()
                .roomId(room.getId())
                .profileId(profileId)
                .content(message.getContent())
                .type(message.getType() != null ? message.getType() : "text")
                .sentAt(OffsetDateTime.now())
                .build();
        chatRepository.save(chatMessage);

        // Enrich DTO and broadcast
        message.setProfileName(profile.getName());
        message.setAvatarUrl(profile.getAvatarUrl());
        message.setSentAt(chatMessage.getSentAt());

        messagingTemplate.convertAndSend("/topic/room/" + code + "/chat", message);
    }

    @MessageMapping("/room/{code}/reaction")
    public void handleReaction(@DestinationVariable String code, ReactionPayload payload) {
        log.debug("Reaction event in room {}: emoji={}", code, payload.getEmoji());

        // Reactions are ephemeral, just broadcast immediately
        messagingTemplate.convertAndSend("/topic/room/" + code + "/reactions", payload);
    }
}
