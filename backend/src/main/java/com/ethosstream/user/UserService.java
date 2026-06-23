package com.ethosstream.user;

import com.ethosstream.user.dto.CreateProfileRequest;
import com.ethosstream.user.dto.ProfileDTO;
import com.ethosstream.user.dto.UpdateProfileRequest;

import java.util.List;
import java.util.UUID;

public interface UserService {

    List<ProfileDTO> getProfilesByUserId(UUID userId);

    ProfileDTO createProfile(UUID userId, CreateProfileRequest request);

    ProfileDTO updateProfile(UUID userId, UUID profileId, UpdateProfileRequest request);

    void deleteProfile(UUID userId, UUID profileId);

    ProfileDTO getProfileById(UUID profileId);
}
