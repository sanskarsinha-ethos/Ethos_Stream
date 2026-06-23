package com.ethosstream.content.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Integer releaseYear;

    private String rating;

    private String type;

    private List<Integer> genreIds;
}
