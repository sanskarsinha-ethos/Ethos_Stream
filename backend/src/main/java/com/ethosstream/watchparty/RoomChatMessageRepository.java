package com.ethosstream.watchparty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomChatMessageRepository extends JpaRepository<RoomChatMessage, UUID> {

    List<RoomChatMessage> findByRoomIdOrderBySentAtAsc(UUID roomId);

    List<RoomChatMessage> findTop50ByRoomIdOrderBySentAtDesc(UUID roomId);
}
