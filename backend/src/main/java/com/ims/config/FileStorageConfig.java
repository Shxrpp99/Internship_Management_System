package com.ims.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {
    @Bean
    public Path uploadPath(@Value("${app.upload-dir}") String dir) throws IOException {
        Path p = Paths.get(dir).toAbsolutePath().normalize();
        Files.createDirectories(p);
        return p;
    }
}
