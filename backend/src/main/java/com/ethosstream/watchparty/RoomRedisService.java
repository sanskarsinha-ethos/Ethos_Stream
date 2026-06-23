package com.ethosstream.watchparty;

import com.ethosstream.watchparty.dto.RoomStateDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomRedisService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration TTL = Duration.ofHours(24);

    public void saveRoomState(String code, RoomStateDTO state) {
        String key = "room:state:" + code;
        try {
            String json = objectMapper.writeValueAsString(state);
            redisTemplate.opsForValue().set(key, json, TTL);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize room state for {}: {}", code, e.getMessage());
        }
    }

    public RoomStateDTO getRoomState(String code) {
        String key = "room:state:" + code;
        String json = redisTemplate.opsForValue().get(key);
        if (json != null) {
            try {
                return objectMapper.readValue(json, RoomStateDTO.class);
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize room state for {}: {}", code, e.getMessage());
            }
        }
        return null;
    }

    public void addParticipant(String code, String profileId) {
        String key = "room:participants:" + code;
        redisTemplate.opsForSet().add(key, profileId);
        redisTemplate.expire(key, TTL);
    }

    public void removeParticipant(String code, String profileId) {
        String key = "room:participants:" + code;
        redisTemplate.opsForSet().remove(key, profileId);
    }

    public Set<String> getParticipants(String code) {
        String key = "room:participants:" + code;
        Set<String> members = redisTemplate.opsForSet().members(key);
        return members != null ? members : new HashSet<>();
    }

    public void deleteRoom(String code) {
        redisTemplate.delete("room:state:" + code);
        redisTemplate.delete("room:participants:" + code);
    }
}
