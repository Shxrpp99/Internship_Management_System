package com.ims.service;

import com.ims.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final Path uploadPath;

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) throw ApiException.badRequest("A CV / offer letter file is required");
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        String ext = original.endsWith(".pdf") ? ".pdf" : original.endsWith(".docx") ? ".docx" : null;
        if (ext == null) throw ApiException.badRequest("Only PDF or DOCX files are allowed");
        String name = UUID.randomUUID() + ext;
        try {
            Files.copy(file.getInputStream(), uploadPath.resolve(name), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
        }
        return name;
    }

    public Resource load(String filename) {
        try {
            Path p = uploadPath.resolve(filename).normalize();
            if (!p.startsWith(uploadPath) || !Files.exists(p)) throw ApiException.notFound("File not found");
            return new UrlResource(p.toUri());
        } catch (java.net.MalformedURLException e) {
            throw ApiException.notFound("File not found");
        }
    }

    public void delete(String filename) {
        try {
            Path p = uploadPath.resolve(filename).normalize();
            if (!p.startsWith(uploadPath)) throw ApiException.badRequest("Invalid file name");
            Files.deleteIfExists(p);
        } catch (IOException e) {
            throw new ApiException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete file");
        }
    }
}
