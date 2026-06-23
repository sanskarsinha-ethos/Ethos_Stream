package com.ethosstream.watchparty;

import com.ethosstream.content.ContentRepository;
import com.ethosstream.content.Video;
import com.ethosstream.exception.RoomFullException;
import com.ethosstream.exception.RoomNotFoundException;
import com.ethosstream.exception.UnauthorizedException;
import com.ethosstream.user.Profile;
import com.ethosstream.user.ProfileRepository;
import com.ethosstream.watchparty.dto.CreateRoomRequest;
import com.ethosstream.watchparty.dto.ParticipantUpdate;
import com.ethosstream.watchparty.dto.RoomDTO;
import com.ethosstream.watchparty.dto.RoomStateDTO;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomParticipantRepository participantRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;
    private final RoomMapper roomMapper;
    private final RoomRedisService redisService;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;
    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public RoomDTO createRoom(UUID userId, CreateRoomRequest request) {
        verifyProfileOwnership(userId, request.getProfileId());

        Video video = contentRepository.findById(request.getVideoId())
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + request.getVideoId()));

        String code = generateUniqueCode();

        Room room = Room.builder()
                .code(code)
                .hostProfileId(request.getProfileId())
                .videoId(video.getId())
                .status("waiting")
                .maxParticipants(4)
                .createdAt(OffsetDateTime.now())
                .build();

        Room savedRoom = roomRepository.save(room);

        // Add host as participant
        RoomParticipant participant = RoomParticipant.builder()
                .roomId(savedRoom.getId())
                .profileId(request.getProfileId())
                .joinedAt(OffsetDateTime.now())
                .build();
        participantRepository.save(participant);

        // Initialize Redis state
        RoomStateDTO state = RoomStateDTO.builder()
                .code(code)
                .status("waiting")
                .currentPositionSeconds(0.0)
                .lastUpdatedTimestamp(System.currentTimeMillis())
                .build();
        redisService.saveRoomState(code, state);
        redisService.addParticipant(code, request.getProfileId().toString());

        log.info("Created room {} hosted by profile {}", code, request.getProfileId());
        return buildRoomDTO(savedRoom, video);
    }

    @Override
    public RoomDTO getRoomByCode(String code) {
        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new RoomNotFoundException(code, null));
        Video video = contentRepository.findById(room.getVideoId()).orElse(null);
        return buildRoomDTO(room, video);
    }

    @Override
    @Transactional
    public RoomDTO joinRoom(UUID userId, String code, UUID profileId) {
        verifyProfileOwnership(userId, profileId);

        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new RoomNotFoundException(code, null));

        if (room.getEndedAt() != null) {
            throw new IllegalArgumentException("Room " + code + " has already ended");
        }

        // Check if already in room
        Optional<RoomParticipant> existing = participantRepository
                .findByRoomIdAndProfileIdAndLeftAtIsNull(room.getId(), profileId);

        if (existing.isEmpty()) {
            // Check capacity
            long currentCount = participantRepository.countByRoomIdAndLeftAtIsNull(room.getId());
            if (currentCount >= room.getMaxParticipants()) {
                throw new RoomFullException(code, room.getMaxParticipants());
            }

            RoomParticipant participant = RoomParticipant.builder()
                    .roomId(room.getId())
                    .profileId(profileId)
                    .joinedAt(OffsetDateTime.now())
                    .build();
            participantRepository.save(participant);
            redisService.addParticipant(code, profileId.toString());

            // Broadcast join event
            broadcastParticipantUpdate(room, profileId, "JOIN");
        }

        Video video = contentRepository.findById(room.getVideoId()).orElse(null);
        log.info("Profile {} joined room {}", profileId, code);
        return buildRoomDTO(room, video);
    }

    @Override
    @Transactional
    public void leaveRoom(UUID userId, String code, UUID profileId) {
        verifyProfileOwnership(userId, profileId);

        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new RoomNotFoundException(code, null));

        participantRepository.findByRoomIdAndProfileIdAndLeftAtIsNull(room.getId(), profileId)
                .ifPresent(p -> {
                    p.setLeftAt(OffsetDateTime.now());
                    participantRepository.save(p);
                    redisService.removeParticipant(code, profileId.toString());
                    
                    broadcastParticipantUpdate(room, profileId, "LEAVE");
                    log.info("Profile {} left room {}", profileId, code);

                    // If host leaves, end room (simplified logic)
                    if (room.getHostProfileId().equals(profileId)) {
                        endRoomInternal(room);
                    }
                });
    }

    @Override
    @Transactional
    public void endRoom(UUID userId, String code) {
        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new RoomNotFoundException(code, null));

        Profile hostProfile = profileRepository.findById(room.getHostProfileId()).orElseThrow();
        if (!hostProfile.getUserId().equals(userId)) {
            throw new UnauthorizedException("Only the host can end the room");
        }

        endRoomInternal(room);
        log.info("Host ended room {}", code);
    }

    @Override
    public RoomStateDTO getRoomState(String code) {
        RoomStateDTO state = redisService.getRoomState(code);
        if (state == null) {
            Room room = roomRepository.findByCode(code)
                    .orElseThrow(() -> new RoomNotFoundException(code, null));
            state = RoomStateDTO.builder()
                    .code(code)
                    .status(room.getStatus())
                    .currentPositionSeconds(room.getCurrentPositionSeconds())
                    .lastUpdatedTimestamp(System.currentTimeMillis())
                    .build();
            redisService.saveRoomState(code, state);
        }
        return state;
    }

    private void endRoomInternal(Room room) {
        room.setEndedAt(OffsetDateTime.now());
        roomRepository.save(room);
        redisService.deleteRoom(room.getCode());
        // Could broadcast an END event here
    }

    private void verifyProfileOwnership(UUID userId, UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found: " + profileId));
        if (!profile.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not own this profile");
        }
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("ETHOS-");
            for (int i = 0; i < CODE_LENGTH - 6; i++) {
                sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
            }
            code = sb.toString();
        } while (roomRepository.existsByCode(code));
        return code;
    }

    private RoomDTO buildRoomDTO(Room room, Video video) {
        List<RoomParticipant> participants = participantRepository.findByRoomIdAndLeftAtIsNull(room.getId());
        String title = video != null ? video.getTitle() : "Unknown Video";
        String thumb = video != null ? video.getThumbnailUrl() : null;
        return roomMapper.toDto(room, title, thumb, participants, profileRepository);
    }

    private void broadcastParticipantUpdate(Room room, UUID profileId, String type) {
        Profile profile = profileRepository.findById(profileId).orElse(null);
        if (profile != null) {
            RoomDTO roomDto = buildRoomDTO(room, null);
            ParticipantUpdate update = ParticipantUpdate.builder()
                    .type(type)
                    .profileId(profileId)
                    .profileName(profile.getName())
                    .avatarUrl(profile.getAvatarUrl())
                    .totalParticipants(roomDto.getParticipants().size())
                    .participants(roomDto.getParticipants())
                    .build();
            
            messagingTemplate.convertAndSend("/topic/room/" + room.getCode() + "/participants", update);
        }
    }
}
