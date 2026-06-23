package com.ethosstream.watchparty;

import com.ethosstream.common.ApiResponse;
import com.ethosstream.user.User;
import com.ethosstream.watchparty.dto.CreateRoomRequest;
import com.ethosstream.watchparty.dto.JoinRoomRequest;
import com.ethosstream.watchparty.dto.RoomDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoomDTO>> createRoom(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateRoomRequest request) {
        RoomDTO room = roomService.createRoom(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(room, "Room created successfully"));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<RoomDTO>> getRoom(@PathVariable String code) {
        RoomDTO room = roomService.getRoomByCode(code);
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<ApiResponse<RoomDTO>> joinRoom(
            @AuthenticationPrincipal User user,
            @PathVariable String code,
            @Valid @RequestBody JoinRoomRequest request) {
        RoomDTO room = roomService.joinRoom(user.getId(), code, request.getProfileId());
        return ResponseEntity.ok(ApiResponse.success(room, "Joined room successfully"));
    }

    @PostMapping("/{code}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveRoom(
            @AuthenticationPrincipal User user,
            @PathVariable String code,
            @RequestBody JoinRoomRequest request) { // Reusing request DTO for profileId
        roomService.leaveRoom(user.getId(), code, request.getProfileId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<ApiResponse<Void>> endRoom(
            @AuthenticationPrincipal User user,
            @PathVariable String code) {
        roomService.endRoom(user.getId(), code);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null));
    }
}
