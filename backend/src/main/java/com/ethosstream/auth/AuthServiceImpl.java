package com.ethosstream.auth;

import com.ethosstream.user.Profile;
import com.ethosstream.user.ProfileMapper;
import com.ethosstream.user.ProfileRepository;
import com.ethosstream.user.dto.ProfileDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    @Override
    @Transactional
    public ProfileDTO syncProfile(UUID userId, String name) {
        // Check if user already has profiles — if so, return the first one
        List<Profile> existingProfiles = profileRepository.findAllByUserId(userId);
        if (!existingProfiles.isEmpty()) {
            log.info("User {} already has {} profile(s), returning first", userId, existingProfiles.size());
            return profileMapper.toDto(existingProfiles.get(0));
        }

        // Create the first profile for this new Supabase user
        Profile profile = Profile.builder()
                .userId(userId)
                .name(name)
                .isKids(false)
                .createdAt(OffsetDateTime.now())
                .build();

        Profile saved = profileRepository.save(profile);
        log.info("Created initial profile '{}' for new user {}", name, userId);
        return profileMapper.toDto(saved);
    }
}
