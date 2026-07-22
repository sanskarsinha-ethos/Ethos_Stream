package com.ethosstream.user;

import com.ethosstream.user.dto.ProfileDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-16T11:31:05+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ProfileMapperImpl implements ProfileMapper {

    @Override
    public ProfileDTO toDto(Profile profile) {
        if ( profile == null ) {
            return null;
        }

        ProfileDTO.ProfileDTOBuilder profileDTO = ProfileDTO.builder();

        profileDTO.avatarUrl( profile.getAvatarUrl() );
        profileDTO.createdAt( profile.getCreatedAt() );
        profileDTO.id( profile.getId() );
        profileDTO.isKids( profile.getIsKids() );
        profileDTO.name( profile.getName() );
        profileDTO.userId( profile.getUserId() );

        return profileDTO.build();
    }

    @Override
    public List<ProfileDTO> toDtoList(List<Profile> profiles) {
        if ( profiles == null ) {
            return null;
        }

        List<ProfileDTO> list = new ArrayList<ProfileDTO>( profiles.size() );
        for ( Profile profile : profiles ) {
            list.add( toDto( profile ) );
        }

        return list;
    }

    @Override
    public Profile toEntity(ProfileDTO profileDTO) {
        if ( profileDTO == null ) {
            return null;
        }

        Profile.ProfileBuilder profile = Profile.builder();

        profile.avatarUrl( profileDTO.getAvatarUrl() );
        profile.createdAt( profileDTO.getCreatedAt() );
        profile.id( profileDTO.getId() );
        profile.isKids( profileDTO.getIsKids() );
        profile.name( profileDTO.getName() );
        profile.userId( profileDTO.getUserId() );

        return profile.build();
    }
}
