package com.ethosstream.user;

import com.ethosstream.user.dto.ProfileDTO;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfileMapper {

    ProfileDTO toDto(Profile profile);

    List<ProfileDTO> toDtoList(List<Profile> profiles);

    Profile toEntity(ProfileDTO profileDTO);
}
