package com.ethosstream.watchparty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, UUID> {

    List<RoomParticipant> findByRoomId(UUID roomId);

    List<RoomParticipant> findByRoomIdAndLeftAtIsNull(UUID roomId);

    long countByRoomIdAndLeftAtIsNull(UUID roomId);

    Optional<RoomParticipant> findByRoomIdAndProfileId(UUID roomId, UUID profileId);

    Optional<RoomParticipant> findByRoomIdAndProfileIdAndLeftAtIsNull(UUID roomId, UUID profileId);
}
