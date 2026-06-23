package com.ethosstream.watchparty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByCode(String code);

    @Query("SELECT r FROM Room r WHERE r.status IN ('waiting', 'playing', 'paused') AND r.endedAt IS NULL ORDER BY r.createdAt DESC")
    List<Room> findActiveRooms();

    boolean existsByCode(String code);
}
