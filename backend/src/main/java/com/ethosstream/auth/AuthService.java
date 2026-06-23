package com.ethosstream.auth;

import com.ethosstream.user.dto.ProfileDTO;

import java.util.UUID;

public interface AuthService {

    ProfileDTO syncProfile(UUID userId, String name);
}
