package com.ethosstream.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MyListRepository extends JpaRepository<MyList, UUID> {

    Optional<MyList> findByProfileIdAndVideoId(UUID profileId, UUID videoId);

    Page<MyList> findByProfileIdOrderByAddedAtDesc(UUID profileId, Pageable pageable);

    boolean existsByProfileIdAndVideoId(UUID profileId, UUID videoId);
}
