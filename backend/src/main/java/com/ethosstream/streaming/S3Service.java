package com.ethosstream.streaming;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

@Service
@Slf4j
public class S3Service {

    @Value("${ethos.aws.region:us-east-1}")
    private String awsRegion;

    @Value("${ethos.aws.bucket:ethos-stream-videos}")
    private String bucketName;

    @Value("${ethos.aws.cloudfront-domain:}")
    private String cloudfrontDomain;

    @Value("${ethos.aws.access-key:}")
    private String accessKey;

    @Value("${ethos.aws.secret-key:}")
    private String secretKey;

    private S3Client s3Client;

    @PostConstruct
    public void init() {
        var builder = S3Client.builder()
                .region(Region.of(awsRegion));

        if (accessKey != null && !accessKey.isBlank() && secretKey != null && !secretKey.isBlank()) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))
            );
        }

        this.s3Client = builder.build();
        log.info("S3Service initialized: bucket={}, region={}", bucketName, awsRegion);
    }

    /**
     * Upload all HLS files (.m3u8 and .ts) from a directory to S3 under videos/{videoId}/
     */
    public void uploadDirectory(Path directory, String videoId) {
        try (Stream<Path> files = Files.walk(directory)) {
            files.filter(Files::isRegularFile)
                    .filter(p -> {
                        String name = p.getFileName().toString();
                        return name.endsWith(".m3u8") || name.endsWith(".ts");
                    })
                    .forEach(file -> uploadFile(file, videoId));
            log.info("Uploaded all HLS files for video {} to S3", videoId);
        } catch (IOException e) {
            log.error("Failed to upload directory for video {}: {}", videoId, e.getMessage());
            throw new RuntimeException("Failed to upload HLS files to S3", e);
        }
    }

    private void uploadFile(Path file, String videoId) {
        String key = "videos/" + videoId + "/" + file.getFileName().toString();
        String contentType = getContentType(file.getFileName().toString());

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(request, RequestBody.fromFile(file));
            log.debug("Uploaded {} to s3://{}/{}", file.getFileName(), bucketName, key);
        } catch (Exception e) {
            log.error("Failed to upload file {} to S3: {}", file, e.getMessage());
            throw new RuntimeException("Failed to upload " + file.getFileName() + " to S3", e);
        }
    }

    /**
     * Get the CloudFront URL for the master.m3u8 playlist.
     */
    public String getCloudFrontUrl(String videoId) {
        return cloudfrontDomain + "/videos/" + videoId + "/master.m3u8";
    }

    /**
     * Generate a direct S3 URL (fallback if CloudFront is not configured).
     */
    public String getDirectUrl(String videoId) {
        return String.format("https://%s.s3.%s.amazonaws.com/videos/%s/master.m3u8",
                bucketName, awsRegion, videoId);
    }

    /**
     * Delete all files for a video from S3.
     */
    public void deleteVideoFiles(String videoId) {
        String prefix = "videos/" + videoId + "/";

        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(prefix)
                .build();

        ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);

        for (S3Object obj : listResponse.contents()) {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(obj.key())
                    .build());
            log.debug("Deleted s3://{}/{}", bucketName, obj.key());
        }

        log.info("Deleted all S3 files for video {}", videoId);
    }

    private String getContentType(String filename) {
        if (filename.endsWith(".m3u8")) return "application/x-mpegURL";
        if (filename.endsWith(".ts")) return "video/MP2T";
        return "application/octet-stream";
    }
}
