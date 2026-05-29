package com.swsai.dms.controller;

import com.swsai.dms.model.Document;
import com.swsai.dms.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * GET /api/documents
     * Returns all document records ordered by upload date descending.
     */
    @GetMapping
    public ResponseEntity<List<Document>> getDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    /**
     * POST /api/documents/upload
     * Accepts one or multiple files as multipart/form-data.
     * Responds immediately with PENDING document records;
     * background processing continues asynchronously.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadDocuments(
            @RequestParam("files") MultipartFile[] files) throws IOException {

        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No files provided."));
        }

        List<Document> pending = documentService.initiateUpload(files);
        return ResponseEntity.accepted().body(Map.of(
                "message", files.length + " file(s) queued for processing.",
                "documents", pending
        ));
    }

    /**
     * GET /api/documents/{id}/download
     * Streams the physical file back to the client.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id)
            throws MalformedURLException {
        Path filePath = documentService.resolveFilePath(id);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
