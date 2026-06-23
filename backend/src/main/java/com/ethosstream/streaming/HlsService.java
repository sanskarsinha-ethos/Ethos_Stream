package com.ethosstream.streaming;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.stream.Stream;

@Service
@Slf4j
public class HlsService {

    @Value("${ethos.ffmpeg.path:/usr/bin/ffmpeg}")
    private String ffmpegPath;

    /**
     * Transcode a video file into 3-rendition HLS (360p/720p/1080p).
     * Returns the path to the output directory containing master.m3u8 and all segments.
     */
    public Path transcode(MultipartFile file, String videoId) {
        try {
            // Create temp directories
            Path tempDir = Files.createTempDirectory("ethos-transcode-");
            Path inputFile = tempDir.resolve("input" + getExtension(file.getOriginalFilename()));
            Path outputDir = tempDir.resolve("output");
            Files.createDirectories(outputDir);

            // Save uploaded file to temp
            file.transferTo(inputFile.toFile());
            log.info("Saved input file to: {} (size: {} bytes)", inputFile, Files.size(inputFile));

            // Build FFmpeg command for 3-rendition HLS
            ProcessBuilder pb = new ProcessBuilder(
                    ffmpegPath,
                    "-i", inputFile.toString(),
                    "-y",

                    // Stream 0: 360p @ 800kbps
                    "-map", "0:v:0", "-map", "0:a:0",
                    "-c:v:0", "libx264", "-b:v:0", "800k",
                    "-s:v:0", "640x360",
                    "-c:a:0", "aac", "-b:a:0", "96k",

                    // Stream 1: 720p @ 2800kbps
                    "-map", "0:v:0", "-map", "0:a:0",
                    "-c:v:1", "libx264", "-b:v:1", "2800k",
                    "-s:v:1", "1280x720",
                    "-c:a:1", "aac", "-b:a:1", "128k",

                    // Stream 2: 1080p @ 5000kbps
                    "-map", "0:v:0", "-map", "0:a:0",
                    "-c:v:2", "libx264", "-b:v:2", "5000k",
                    "-s:v:2", "1920x1080",
                    "-c:a:2", "aac", "-b:a:2", "192k",

                    // HLS settings
                    "-f", "hls",
                    "-hls_time", "6",
                    "-hls_playlist_type", "vod",
                    "-hls_segment_filename", outputDir.resolve("stream_%v_%03d.ts").toString(),
                    "-master_pl_name", "master.m3u8",
                    "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2",
                    outputDir.resolve("stream_%v.m3u8").toString()
            );

            pb.redirectErrorStream(true);
            pb.directory(outputDir.toFile());

            log.info("Starting FFmpeg transcoding for video: {}", videoId);
            Process process = pb.start();

            // Log FFmpeg output
            String ffmpegOutput = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                log.error("FFmpeg failed with exit code {}: {}", exitCode, ffmpegOutput);
                throw new RuntimeException("FFmpeg transcoding failed with exit code: " + exitCode);
            }

            log.info("FFmpeg transcoding completed successfully for video: {}", videoId);

            // Delete the input file to save space
            Files.deleteIfExists(inputFile);

            return outputDir;

        } catch (IOException | InterruptedException e) {
            log.error("Transcoding failed for video {}: {}", videoId, e.getMessage());
            throw new RuntimeException("Failed to transcode video: " + e.getMessage(), e);
        }
    }

    /**
     * Clean up temporary transcoding files.
     */
    public void cleanup(Path outputDir) {
        try {
            if (outputDir != null && Files.exists(outputDir)) {
                Path parent = outputDir.getParent();
                try (Stream<Path> walk = Files.walk(parent)) {
                    walk.sorted(Comparator.reverseOrder())
                            .forEach(path -> {
                                try {
                                    Files.deleteIfExists(path);
                                } catch (IOException e) {
                                    log.warn("Failed to delete temp file: {}", path);
                                }
                            });
                }
                log.info("Cleaned up temp transcoding directory: {}", parent);
            }
        } catch (IOException e) {
            log.warn("Failed to cleanup temp directory: {}", e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return ".mp4";
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : ".mp4";
    }
}
