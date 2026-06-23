package com.ethosstream.watchparty;

import com.ethosstream.watchparty.dto.CreateRoomRequest;
import com.ethosstream.watchparty.dto.RoomDTO;
import com.ethosstream.watchparty.dto.RoomStateDTO;

import java.util.UUID;

public interface RoomService {

    RoomDTO createRoom(UUID userId, CreateRoomRequest request);

    RoomDTO getRoomByCode(String code);

    RoomDTO joinRoom(UUID userId, String code, UUID profileId);

    void leaveRoom(UUID userId, String code, UUID profileId);

    void endRoom(UUID userId, String code);

    RoomStateDTO getRoomState(String code);
}
