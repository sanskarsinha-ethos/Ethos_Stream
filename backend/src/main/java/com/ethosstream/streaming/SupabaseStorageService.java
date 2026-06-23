package com.ethosstream.streaming;

import com.ethosstream.exception.SupabaseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
public class SupabaseStorageService {

    private final WebClient webClient;
    private final String supabaseUrl;
    private final String serviceRoleKey;

    public SupabaseStorageService(
            @Value("${ethos.supabase.url}") String supabaseUrl,
            @Value("${ethos.supabase.service-role-key}") String serviceRoleKey) {
        this.supabaseUrl = supabaseUrl;
        this.serviceRoleKey = serviceRoleKey;
        this.webClient = WebClient.builder()
                .baseUrl(supabaseUrl)
                .build();
    }

    /**
     * Upload a file to Supabase Storage.
     *
     * @param bucket      bucket name (avatars, thumbnails, banners)
     * @param path        file path within the bucket (e.g., "{profileId}.webp")
     * @param fileBytes   file content as bytes
     * @param contentType MIME type (e.g., "image/webp")
     * @return public URL of the uploaded file
     */
    public String uploadFile(String bucket, String path, byte[] fileBytes, String contentType) {
        String uploadUrl = "/storage/v1/object/" + bucket + "/" + path;

        try {
            webClient.post()
                    .uri(uploadUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header("x-upsert", "true")
                    .bodyValue(fileBytes)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
            log.info("Uploaded file to Supabase Storage: {}", publicUrl);
            return publicUrl;

        } catch (Exception e) {
            log.error("Failed to upload to Supabase Storage: bucket={}, path={}, error={}",
                    bucket, path, e.getMessage());
            throw new SupabaseException("Failed to upload file to Supabase Storage", e);
        }
    }

    /**
     * Delete a file from Supabase Storage.
     */
    public void deleteFile(String bucket, String path) {
        String deleteUrl = "/storage/v1/object/" + bucket + "/" + path;

        try {
            webClient.delete()
                    .uri(deleteUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info("Deleted file from Supabase Storage: {}/{}", bucket, path);

        } catch (Exception e) {
            log.error("Failed to delete from Supabase Storage: bucket={}, path={}, error={}",
                    bucket, path, e.getMessage());
            throw new SupabaseException("Failed to delete file from Supabase Storage", e);
        }
    }

    /**
     * Get the public URL for a file in Supabase Storage.
     */
    public String getPublicUrl(String bucket, String path) {
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
    }
}
