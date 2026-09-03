package com.autoguardian.tyreai.controller;

import com.autoguardian.tyreai.service.TyreImageAnalysisService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tyre")
@CrossOrigin(origins = {
        "http://localhost:8000",
        "http://127.0.0.1:8000"
})
public class TyreController {

    private final TyreImageAnalysisService tyreImageAnalysisService;


    public TyreController(
            TyreImageAnalysisService tyreImageAnalysisService
    ) {

        this.tyreImageAnalysisService =
                tyreImageAnalysisService;
    }


    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeTyre(
            @RequestParam("tyreImage")
            MultipartFile tyreImage
    ) {

        try {

            System.out.println(
                    "Tyre analysis request received"
            );


            System.out.println(
                    "Filename: "
                            + tyreImage.getOriginalFilename()
            );


            Map<String, Object> result =
                    tyreImageAnalysisService.analyzeTyre(
                            tyreImage
                    );


            return ResponseEntity.ok(
                    result
            );

        }

        catch (IllegalArgumentException exception) {

            Map<String, Object> error =
                    new LinkedHashMap<>();


            error.put(
                    "success",
                    false
            );


            error.put(
                    "message",
                    exception.getMessage()
            );


            return ResponseEntity
                    .badRequest()
                    .body(error);

        }

        catch (Exception exception) {

            exception.printStackTrace();


            Map<String, Object> error =
                    new LinkedHashMap<>();


            error.put(
                    "success",
                    false
            );


            error.put(
                    "message",
                    "Tyre image analysis failed"
            );


            error.put(
                    "error",
                    exception.getMessage()
            );


            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(error);
        }
    }
}