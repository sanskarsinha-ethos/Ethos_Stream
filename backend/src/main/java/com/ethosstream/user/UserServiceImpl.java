package com.ethosstream.user;

import com.ethosstream.exception.UnauthorizedException;
import com.ethosstream.user.dto.CreateProfileRequest;
import com.ethosstream.user.dto.ProfileDTO;
import com.ethosstream.user.dto.UpdateProfileRequest;
import jakarta.persistence.EntityNotFoundException;
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
public class UserServiceImpl implements UserService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    @Override
    public List<ProfileDTO> getProfilesByUserId(UUID userId) {
        List<Profile> profiles = profileRepository.findAllByUserId(userId);
        return profileMapper.toDtoList(profiles);
    }

    @Override
    @Transactional
    public ProfileDTO createProfile(UUID userId, CreateProfileRequest request) {
        // Limit to 5 profiles per user
        long count = profileRepository.countByUserId(userId);
        if (count >= 5) {
            throw new IllegalArgumentException("Maximum 5 profiles allowed per account");
        }

        Profile profile = Profile.builder()
                .userId(userId)
                .name(request.getName())
                .isKids(request.getIsKids() != null ? request.getIsKids() : false)
                .createdAt(OffsetDateTime.now())
                .build();

        Profile saved = profileRepository.save(profile);
        log.info("Created profile '{}' for user {}", saved.getName(), userId);
        return profileMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ProfileDTO updateProfile(UUID userId, UUID profileId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found: " + profileId));

        // Verify ownership
        if (!profile.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not own this profile");
        }

        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }

        Profile saved = profileRepository.save(profile);
        log.info("Updated profile {} for user {}", profileId, userId);
        return profileMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteProfile(UUID userId, UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found: " + profileId));

        if (!profile.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not own this profile");
        }

        // Don't allow deletion of last profile
        long count = profileRepository.countByUserId(userId);
        if (count <= 1) {
            throw new IllegalArgumentException("Cannot delete your last profile");
        }

        profileRepository.delete(profile);
        log.info("Deleted profile {} for user {}", profileId, userId);
    }

    @Override
    public ProfileDTO getProfileById(UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found: " + profileId));
        return profileMapper.toDto(profile);
    }
}
