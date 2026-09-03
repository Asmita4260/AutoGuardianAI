package com.autoguardian.tyreai;

import nu.pattern.OpenCV;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TyreAiBackendApplication {

    public static void main(String[] args) {

        try {

            /*
             * Load the native OpenCV library bundled with
             * the OpenPnP OpenCV Maven dependency.
             *
             * IMPORTANT:
             * anywhere else in the project.
             */
            OpenCV.loadLocally();

            /*
             * Force a real native OpenCV call.
             * This verifies that the Java JAR and native library
             * are compatible before Spring Boot starts.
             */
            Mat testMat = new Mat(1, 1, 0);

            System.out.println("================================");
            System.out.println("OpenCV loaded successfully");
            System.out.println("OpenCV version: " + Core.VERSION);
            System.out.println(
                    "Native Mat test: "
                            + (!testMat.empty() ? "SUCCESS" : "FAILED")
            );
            System.out.println("================================");

            testMat.release();

        } catch (Throwable throwable) {

            System.err.println("================================");
            System.err.println("OPENCV INITIALIZATION FAILED");
            System.err.println("================================");

            throwable.printStackTrace();

            System.exit(1);
        }

        SpringApplication.run(
                TyreAiBackendApplication.class,
                args
        );
    }
}