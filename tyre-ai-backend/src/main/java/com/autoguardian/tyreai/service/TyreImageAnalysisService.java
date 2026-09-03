package com.autoguardian.tyreai.service;

import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfDouble;
import org.opencv.core.Rect;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class TyreImageAnalysisService {

    private static final String ANALYSIS_VERSION =
            "TYREVISION_FINAL_V7_2026_07_04";

    public Map<String, Object> analyzeTyre(
            MultipartFile file
    ) {

        Map<String, Object> result =
                new LinkedHashMap<>();

        Mat encodedImage = null;
        Mat originalImage = null;
        Mat resizedImage = null;
        Mat grayImage = null;
        Mat darkMask = null;
        Mat analysisGray = null;
        Mat normalized = null;
        Mat blurred = null;
        Mat gradientX = null;
        Mat gradientY = null;
        Mat gradientMagnitude = null;
        Mat laplacian = null;

        MatOfDouble gradientMean = null;
        MatOfDouble gradientStd = null;
        MatOfDouble laplacianMean = null;
        MatOfDouble laplacianDeviation = null;

        try {

            if (file == null || file.isEmpty()) {

                throw new IllegalArgumentException(
                        "Tyre image is empty"
                );
            }

            System.out.println(
                    "================================"
            );

            System.out.println(
                    "NEW TYRE ANALYSIS REQUEST"
            );

            System.out.println(
                    "ANALYSIS VERSION: "
                            + ANALYSIS_VERSION
            );

            System.out.println(
                    "Filename: "
                            + file.getOriginalFilename()
            );

            System.out.println(
                    "File size: "
                            + file.getSize()
            );

            System.out.println(
                    "Content type: "
                            + file.getContentType()
            );

            System.out.println(
                    "================================"
            );


            /*
             * =====================================================
             * IMAGE DECODING
             * =====================================================
             */

            byte[] imageBytes =
                    file.getBytes();

            encodedImage =
                    new Mat(
                            1,
                            imageBytes.length,
                            CvType.CV_8U
                    );

            encodedImage.put(
                    0,
                    0,
                    imageBytes
            );

            originalImage =
                    Imgcodecs.imdecode(
                            encodedImage,
                            Imgcodecs.IMREAD_COLOR
                    );

            if (originalImage.empty()) {

                throw new IllegalArgumentException(
                        "Unable to decode tyre image"
                );
            }


            /*
             * =====================================================
             * NORMALIZE SIZE
             * =====================================================
             */

            resizedImage =
                    new Mat();

            Imgproc.resize(
                    originalImage,
                    resizedImage,
                    new Size(
                            640,
                            640
                    )
            );


            /*
             * =====================================================
             * GRAYSCALE
             * =====================================================
             */

            grayImage =
                    new Mat();

            Imgproc.cvtColor(
                    resizedImage,
                    grayImage,
                    Imgproc.COLOR_BGR2GRAY
            );


            /*
             * =====================================================
             * TYRE COVERAGE
             * =====================================================
             */

            darkMask =
                    new Mat();

            Imgproc.threshold(
                    grayImage,
                    darkMask,
                    210,
                    255,
                    Imgproc.THRESH_BINARY_INV
            );

            double tyreCoverage =
                    Core.countNonZero(
                            darkMask
                    )
                            / (double) (
                            darkMask.rows()
                                    * darkMask.cols()
                    );


            /*
             * =====================================================
             * ANALYSIS MODE
             * =====================================================
             */

            String analysisMode;

            if (tyreCoverage < 0.72) {

                analysisMode =
                        "WHOLE_TYRE_MODE";

                Rect tyreRect =
                        findDarkRegionBounds(
                                darkMask
                        );

                if (
                        tyreRect != null
                                && tyreRect.width > 100
                                && tyreRect.height > 100
                ) {

                    Rect safeRect =
                            createSafeRect(
                                    tyreRect,
                                    grayImage.cols(),
                                    grayImage.rows()
                            );

                    analysisGray =
                            new Mat(
                                    grayImage,
                                    safeRect
                            ).clone();

                } else {

                    analysisGray =
                            createCentralRoi(
                                    grayImage
                            );
                }

            } else {

                analysisMode =
                        "TREAD_CLOSEUP_MODE";

                analysisGray =
                        createCentralRoi(
                                grayImage
                        );
            }


            /*
             * =====================================================
             * CLAHE
             * =====================================================
             */

            normalized =
                    new Mat();

            Imgproc.createCLAHE(
                    2.0,
                    new Size(
                            8,
                            8
                    )
            ).apply(
                    analysisGray,
                    normalized
            );


            /*
             * =====================================================
             * BLUR
             * =====================================================
             */

            blurred =
                    new Mat();

            Imgproc.GaussianBlur(
                    normalized,
                    blurred,
                    new Size(
                            5,
                            5
                    ),
                    0
            );


            /*
             * =====================================================
             * SOBEL GRADIENT
             * =====================================================
             */

            gradientX =
                    new Mat();

            gradientY =
                    new Mat();

            Imgproc.Sobel(
                    blurred,
                    gradientX,
                    CvType.CV_32F,
                    1,
                    0,
                    3
            );

            Imgproc.Sobel(
                    blurred,
                    gradientY,
                    CvType.CV_32F,
                    0,
                    1,
                    3
            );

            gradientMagnitude =
                    new Mat();

            Core.magnitude(
                    gradientX,
                    gradientY,
                    gradientMagnitude
            );

            gradientMean =
                    new MatOfDouble();

            gradientStd =
                    new MatOfDouble();

            Core.meanStdDev(
                    gradientMagnitude,
                    gradientMean,
                    gradientStd
            );

            double gradientAverage =
                    gradientMean
                            .get(
                                    0,
                                    0
                            )[0];

            double gradientVariation =
                    gradientStd
                            .get(
                                    0,
                                    0
                            )[0];


            /*
             * =====================================================
             * LAPLACIAN
             * =====================================================
             */

            laplacian =
                    new Mat();

            Imgproc.Laplacian(
                    blurred,
                    laplacian,
                    CvType.CV_64F
            );

            laplacianMean =
                    new MatOfDouble();

            laplacianDeviation =
                    new MatOfDouble();

            Core.meanStdDev(
                    laplacian,
                    laplacianMean,
                    laplacianDeviation
            );

            double laplacianVariance =
                    Math.pow(
                            laplacianDeviation
                                    .get(
                                            0,
                                            0
                                    )[0],
                            2
                    );


            /*
             * =====================================================
             * LOCAL TEXTURE
             * =====================================================
             */

            LocalTextureResult textureResult =
                    analyzeLocalTexture(
                            blurred
                    );

            double textureIrregularity =
                    textureResult
                            .irregularityScore;

            double irregularBlockRatio =
                    textureResult
                            .irregularBlockRatio;


            /*
             * =====================================================
             * TREAD DISCONTINUITY
             * =====================================================
             */

            double treadDiscontinuity =
                    calculateTreadDiscontinuity(
                            gradientMagnitude
                    );


            /*
             * =====================================================
             * STRUCTURAL BREAK
             * =====================================================
             */

            double structuralBreakScore =
                    calculateStructuralBreakScore(
                            blurred
                    );


            /*
             * =====================================================
             * DAMAGE SIGNALS
             * =====================================================
             */

            boolean closeUpMode =
                    "TREAD_CLOSEUP_MODE"
                            .equals(
                                    analysisMode
                            );


            /*
             * Major exposed cord / torn tread.
             */

            boolean severeStructuralDamage =
                    closeUpMode
                            && tyreCoverage >= 0.80
                            && textureIrregularity >= 32.0
                            && structuralBreakScore >= 44.0;


            /*
             * Strong local tearing.
             */

            boolean severeLocalBreakage =
                    closeUpMode
                            && irregularBlockRatio >= 0.07
                            && textureIrregularity >= 30.0
                            && structuralBreakScore >= 45.0;


            /*
             * Additional structural override.
             *
             * Used when a large damaged region produces fewer
             * irregular blocks but still has strong texture and
             * structural disruption.
             */

            boolean severeTreadDestruction =
                    closeUpMode
                            && tyreCoverage >= 0.85
                            && textureIrregularity >= 33.0
                            && (
                            structuralBreakScore >= 46.0
                                    || treadDiscontinuity >= 35.0
                    );


            /*
             * Moderate wear.
             */

            boolean moderateWearSignal =
                    textureIrregularity >= 22.0
                            || irregularBlockRatio >= 0.025
                            || (
                            treadDiscontinuity >= 24.0
                                    && textureIrregularity >= 18.0
                    );


            boolean highDamageDetected =
                    severeStructuralDamage
                            || severeLocalBreakage
                            || severeTreadDestruction;


            /*
             * =====================================================
             * RAW DAMAGE SCORE
             * =====================================================
             */

            double rawDamageScore;

            if (
                    "WHOLE_TYRE_MODE"
                            .equals(
                                    analysisMode
                            )
            ) {

                rawDamageScore =
                        (
                                textureIrregularity
                                        * 0.55
                        )
                                + (
                                irregularBlockRatio
                                        * 100.0
                                        * 0.30
                        )
                                + (
                                treadDiscontinuity
                                        * 0.12
                        )
                                + (
                                structuralBreakScore
                                        * 0.03
                        );

            } else {

                rawDamageScore =
                        (
                                textureIrregularity
                                        * 0.38
                        )
                                + (
                                irregularBlockRatio
                                        * 100.0
                                        * 0.22
                        )
                                + (
                                treadDiscontinuity
                                        * 0.15
                        )
                                + (
                                structuralBreakScore
                                        * 0.25
                        );
            }

            rawDamageScore =
                    clamp(
                            rawDamageScore,
                            0,
                            100
                    );


            /*
             * =====================================================
             * FINAL HEALTH SCORE
             *
             * 70 - 100 HEALTHY
             * 31 - 69  MODERATE
             * 0  - 30  HIGH
             * =====================================================
             */

            int healthScore;


            /*
             * -----------------------------------------------------
             * HIGH RISK
             * -----------------------------------------------------
             */

            if (highDamageDetected) {

                double severity =
                        (
                                textureIrregularity
                                        * 0.40
                        )
                                + (
                                structuralBreakScore
                                        * 0.35
                        )
                                + (
                                irregularBlockRatio
                                        * 100.0
                                        * 0.15
                        )
                                + (
                                treadDiscontinuity
                                        * 0.10
                        );

                severity =
                        clamp(
                                severity,
                                0,
                                100
                        );

                healthScore =
                        (int) Math.round(
                                clamp(
                                        30.0
                                                - (
                                                (
                                                        severity
                                                                - 35.0
                                                )
                                                        * 0.60
                                        ),
                                        5,
                                        30
                                )
                        );
            }


            /*
             * -----------------------------------------------------
             * MODERATE
             * -----------------------------------------------------
             */

            else if (moderateWearSignal) {

                double wearSeverity =
                        (
                                textureIrregularity
                                        * 0.45
                        )
                                + (
                                irregularBlockRatio
                                        * 100.0
                                        * 0.25
                        )
                                + (
                                treadDiscontinuity
                                        * 0.20
                        )
                                + (
                                structuralBreakScore
                                        * 0.10
                        );

                wearSeverity =
                        clamp(
                                wearSeverity,
                                0,
                                100
                        );

                healthScore =
                        (int) Math.round(
                                clamp(
                                        69.0
                                                - (
                                                (
                                                        wearSeverity
                                                                - 18.0
                                                )
                                                        * 0.90
                                        ),
                                        31,
                                        69
                                )
                        );
            }


            /*
             * -----------------------------------------------------
             * HEALTHY
             * -----------------------------------------------------
             */

            else {

                double healthyDamage;

                if (
                        "WHOLE_TYRE_MODE"
                                .equals(
                                        analysisMode
                                )
                ) {

                    healthyDamage =
                            rawDamageScore
                                    * 0.70;

                } else {

                    healthyDamage =
                            rawDamageScore
                                    * 0.85;
                }

                healthScore =
                        (int) Math.round(
                                clamp(
                                        100.0
                                                - healthyDamage,
                                        70,
                                        100
                                )
                        );
            }


            healthScore =
                    Math.max(
                            0,
                            Math.min(
                                    100,
                                    healthScore
                            )
                    );

            double damageScore =
                    clamp(
                            100.0
                                    - healthScore,
                            0,
                            100
                    );


            /*
             * =====================================================
             * FINAL CLASSIFICATION
             * =====================================================
             */

            String risk;
            String condition;
            String remainingLife;
            String recommendedAction;

            String recommendationTitle;
            String recommendationText;
            String replacementPrediction;

            String tyreStatus;
            String tyreMessage;


            if (healthScore >= 70) {

                risk =
                        "Low";

                condition =
                        "Healthy Condition";

                remainingLife =
                        "70 - 100%";

                recommendedAction =
                        "Continue Monitoring";

                recommendationTitle =
                        "Tyre Condition Looks Good";

                recommendationText =
                        "No major visible tyre damage was detected.";

                replacementPrediction =
                        "Continue regular tyre pressure and tread checks.";

                tyreStatus =
                        "Your Tyre Looks Healthy";

                tyreMessage =
                        "No major visible tyre damage was detected.";

            } else if (healthScore >= 31) {

                risk =
                        "Moderate";

                condition =
                        "Visible Wear";

                remainingLife =
                        "31 - 69%";

                recommendedAction =
                        "Schedule Inspection";

                recommendationTitle =
                        "Tyre Inspection Recommended";

                recommendationText =
                        "Visible wear or tread irregularity was detected.";

                replacementPrediction =
                        "Inspect the tyre during the upcoming service.";

                tyreStatus =
                        "Your Tyre Needs Attention";

                tyreMessage =
                        "Visible tyre wear or minor surface irregularity was detected.";

            } else {

                risk =
                        "High";

                condition =
                        "Heavily Damaged";

                remainingLife =
                        "0 - 30%";

                recommendedAction =
                        "Stop and Inspect";

                recommendationTitle =
                        "Immediate Attention Required";

                recommendationText =
                        "Severe visible tyre damage or structural irregularity was detected.";

                replacementPrediction =
                        "Immediate tyre inspection and likely replacement recommended.";

                tyreStatus =
                        "Tyre Damage Detected";

                tyreMessage =
                        "Severe visible tyre damage or structural irregularity was detected.";
            }


            /*
             * =====================================================
             * RESPONSE
             * =====================================================
             */

            result.put(
                    "success",
                    true
            );

            result.put(
                    "analysisVersion",
                    ANALYSIS_VERSION
            );

            result.put(
                    "filename",
                    file.getOriginalFilename()
            );

            result.put(
                    "tyreScore",
                    healthScore
            );

            result.put(
                    "healthScore",
                    healthScore
            );

            result.put(
                    "score",
                    healthScore
            );

            result.put(
                    "tyreCondition",
                    condition
            );

            result.put(
                    "condition",
                    condition
            );

            result.put(
                    "wearClassification",
                    condition
            );

            result.put(
                    "tyreStatus",
                    tyreStatus
            );

            result.put(
                    "tyreMessage",
                    tyreMessage
            );

            result.put(
                    "safetyRisk",
                    risk
            );

            result.put(
                    "risk",
                    risk
            );

            result.put(
                    "riskLevel",
                    risk
            );

            result.put(
                    "remainingLife",
                    remainingLife
            );

            result.put(
                    "recommendedAction",
                    recommendedAction
            );

            result.put(
                    "recommendationTitle",
                    recommendationTitle
            );

            result.put(
                    "recommendationText",
                    recommendationText
            );

            result.put(
                    "replacementPrediction",
                    replacementPrediction
            );

            result.put(
                    "analysisMode",
                    analysisMode
            );

            result.put(
                    "damageScore",
                    round(
                            damageScore
                    )
            );

            result.put(
                    "textureIrregularity",
                    round(
                            textureIrregularity
                    )
            );

            result.put(
                    "irregularBlockRatio",
                    round(
                            irregularBlockRatio
                    )
            );

            result.put(
                    "treadDiscontinuity",
                    round(
                            treadDiscontinuity
                    )
            );

            result.put(
                    "structuralBreakScore",
                    round(
                            structuralBreakScore
                    )
            );

            result.put(
                    "tyreCoverage",
                    round(
                            tyreCoverage
                    )
            );


            /*
             * =====================================================
             * CONSOLE DEBUG
             * =====================================================
             */

            System.out.println(
                    "--------------------------------"
            );

            System.out.println(
                    "TYREVISION ANALYSIS"
            );

            System.out.println(
                    "ANALYSIS VERSION: "
                            + ANALYSIS_VERSION
            );

            System.out.println(
                    "Filename: "
                            + file.getOriginalFilename()
            );

            System.out.println(
                    "Analysis mode: "
                            + analysisMode
            );

            System.out.println(
                    "Tyre coverage: "
                            + tyreCoverage
            );

            System.out.println(
                    "Gradient average: "
                            + gradientAverage
            );

            System.out.println(
                    "Gradient variation: "
                            + gradientVariation
            );

            System.out.println(
                    "Laplacian variance: "
                            + laplacianVariance
            );

            System.out.println(
                    "Texture irregularity: "
                            + textureIrregularity
            );

            System.out.println(
                    "Irregular block ratio: "
                            + irregularBlockRatio
            );

            System.out.println(
                    "Tread discontinuity: "
                            + treadDiscontinuity
            );

            System.out.println(
                    "Structural break score: "
                            + structuralBreakScore
            );

            System.out.println(
                    "Severe structural damage: "
                            + severeStructuralDamage
            );

            System.out.println(
                    "Severe local breakage: "
                            + severeLocalBreakage
            );

            System.out.println(
                    "Severe tread destruction: "
                            + severeTreadDestruction
            );

            System.out.println(
                    "High damage detected: "
                            + highDamageDetected
            );

            System.out.println(
                    "Moderate wear signal: "
                            + moderateWearSignal
            );

            System.out.println(
                    "FINAL DAMAGE SCORE: "
                            + damageScore
            );

            System.out.println(
                    "FINAL TYRE HEALTH SCORE: "
                            + healthScore
            );

            System.out.println(
                    "FINAL RISK: "
                            + risk
            );

            System.out.println(
                    "FINAL ACTION: "
                            + recommendedAction
            );

            System.out.println(
                    "--------------------------------"
            );

            return result;

        } catch (IllegalArgumentException exception) {

            throw exception;

        } catch (Exception exception) {

            exception.printStackTrace();

            throw new RuntimeException(
                    "Unable to analyze tyre: "
                            + exception.getMessage(),
                    exception
            );

        } finally {

            release(
                    encodedImage
            );

            release(
                    originalImage
            );

            release(
                    resizedImage
            );

            release(
                    grayImage
            );

            release(
                    darkMask
            );

            release(
                    analysisGray
            );

            release(
                    normalized
            );

            release(
                    blurred
            );

            release(
                    gradientX
            );

            release(
                    gradientY
            );

            release(
                    gradientMagnitude
            );

            release(
                    laplacian
            );

            release(
                    gradientMean
            );

            release(
                    gradientStd
            );

            release(
                    laplacianMean
            );

            release(
                    laplacianDeviation
            );
        }
    }


    /*
     * =============================================================
     * LOCAL TEXTURE ANALYSIS
     * =============================================================
     */

    private LocalTextureResult analyzeLocalTexture(
            Mat image
    ) {

        int blockSize =
                64;

        int rows =
                image.rows()
                        / blockSize;

        int columns =
                image.cols()
                        / blockSize;

        if (
                rows <= 0
                        || columns <= 0
        ) {

            return new LocalTextureResult(
                    0,
                    0
            );
        }

        double[][] textureValues =
                new double[rows][columns];

        double totalTexture =
                0;

        int totalBlocks =
                0;

        for (
                int row = 0;
                row < rows;
                row++
        ) {

            for (
                    int column = 0;
                    column < columns;
                    column++
            ) {

                Rect blockRect =
                        new Rect(
                                column
                                        * blockSize,
                                row
                                        * blockSize,
                                blockSize,
                                blockSize
                        );

                Mat block =
                        new Mat(
                                image,
                                blockRect
                        );

                MatOfDouble mean =
                        new MatOfDouble();

                MatOfDouble deviation =
                        new MatOfDouble();

                try {

                    Core.meanStdDev(
                            block,
                            mean,
                            deviation
                    );

                    double texture =
                            deviation
                                    .get(
                                            0,
                                            0
                                    )[0];

                    textureValues[row][column] =
                            texture;

                    totalTexture +=
                            texture;

                    totalBlocks++;

                } finally {

                    block.release();

                    mean.release();

                    deviation.release();
                }
            }
        }

        if (totalBlocks == 0) {

            return new LocalTextureResult(
                    0,
                    0
            );
        }

        double averageTexture =
                totalTexture
                        / totalBlocks;

        double totalDifference =
                0;

        int comparisons =
                0;

        int irregularBlocks =
                0;

        for (
                int row = 0;
                row < rows;
                row++
        ) {

            for (
                    int column = 0;
                    column < columns;
                    column++
            ) {

                double current =
                        textureValues[row][column];

                double neighbourTotal =
                        0;

                int neighbourCount =
                        0;

                if (row > 0) {

                    neighbourTotal +=
                            textureValues[
                                    row - 1
                                    ][column];

                    neighbourCount++;
                }

                if (row < rows - 1) {

                    neighbourTotal +=
                            textureValues[
                                    row + 1
                                    ][column];

                    neighbourCount++;
                }

                if (column > 0) {

                    neighbourTotal +=
                            textureValues[
                                    row
                                    ][column - 1];

                    neighbourCount++;
                }

                if (column < columns - 1) {

                    neighbourTotal +=
                            textureValues[
                                    row
                                    ][column + 1];

                    neighbourCount++;
                }

                if (neighbourCount == 0) {

                    continue;
                }

                double neighbourAverage =
                        neighbourTotal
                                / neighbourCount;

                double difference =
                        Math.abs(
                                current
                                        - neighbourAverage
                        );

                double normalizedDifference =
                        difference
                                / Math.max(
                                10,
                                averageTexture
                        );

                totalDifference +=
                        normalizedDifference;

                comparisons++;

                if (
                        normalizedDifference
                                > 0.45
                ) {

                    irregularBlocks++;
                }
            }
        }

        double averageDifference =
                comparisons == 0
                        ? 0
                        : totalDifference
                        / comparisons;

        double irregularityScore =
                clamp(
                        averageDifference
                                * 180,
                        0,
                        100
                );

        double irregularBlockRatio =
                irregularBlocks
                        / (double) totalBlocks;

        return new LocalTextureResult(
                irregularityScore,
                irregularBlockRatio
        );
    }


    /*
     * =============================================================
     * TREAD DISCONTINUITY
     * =============================================================
     */

    private double calculateTreadDiscontinuity(
            Mat gradientMagnitude
    ) {

        Mat normalizedGradient =
                new Mat();

        try {

            Core.normalize(
                    gradientMagnitude,
                    normalizedGradient,
                    0,
                    255,
                    Core.NORM_MINMAX,
                    CvType.CV_8U
            );

            int bandCount =
                    10;

            int bandWidth =
                    Math.max(
                            1,
                            normalizedGradient.cols()
                                    / bandCount
                    );

            double[] bandStrength =
                    new double[bandCount];

            for (
                    int band = 0;
                    band < bandCount;
                    band++
            ) {

                int startX =
                        band
                                * bandWidth;

                if (
                        startX
                                >= normalizedGradient.cols()
                ) {

                    bandStrength[band] =
                            0;

                    continue;
                }

                int width;

                if (
                        band
                                == bandCount - 1
                ) {

                    width =
                            normalizedGradient.cols()
                                    - startX;

                } else {

                    width =
                            Math.min(
                                    bandWidth,
                                    normalizedGradient.cols()
                                            - startX
                            );
                }

                if (width <= 0) {

                    continue;
                }

                Rect bandRect =
                        new Rect(
                                startX,
                                0,
                                width,
                                normalizedGradient.rows()
                        );

                Mat bandImage =
                        new Mat(
                                normalizedGradient,
                                bandRect
                        );

                try {

                    bandStrength[band] =
                            Core.mean(
                                    bandImage
                            ).val[0];

                } finally {

                    bandImage.release();
                }
            }

            double average =
                    0;

            for (
                    double value
                            : bandStrength
            ) {

                average +=
                        value;
            }

            average /=
                    bandCount;

            double variation =
                    0;

            for (
                    double value
                            : bandStrength
            ) {

                variation +=
                        Math.abs(
                                value
                                        - average
                        );
            }

            variation /=
                    bandCount;

            return clamp(
                    variation
                            * 3.5,
                    0,
                    100
            );

        } finally {

            normalizedGradient.release();
        }
    }


    /*
     * =============================================================
     * STRUCTURAL BREAK ANALYSIS
     * =============================================================
     */

    private double calculateStructuralBreakScore(
            Mat image
    ) {

        Mat edges =
                new Mat();

        Mat horizontalKernel =
                null;

        Mat verticalKernel =
                null;

        Mat horizontal =
                new Mat();

        Mat vertical =
                new Mat();

        Mat difference =
                new Mat();

        try {

            Imgproc.Canny(
                    image,
                    edges,
                    80,
                    180
            );

            horizontalKernel =
                    Imgproc.getStructuringElement(
                            Imgproc.MORPH_RECT,
                            new Size(
                                    9,
                                    3
                            )
                    );

            verticalKernel =
                    Imgproc.getStructuringElement(
                            Imgproc.MORPH_RECT,
                            new Size(
                                    3,
                                    9
                            )
                    );

            Imgproc.morphologyEx(
                    edges,
                    horizontal,
                    Imgproc.MORPH_CLOSE,
                    horizontalKernel
            );

            Imgproc.morphologyEx(
                    edges,
                    vertical,
                    Imgproc.MORPH_CLOSE,
                    verticalKernel
            );

            Core.absdiff(
                    horizontal,
                    vertical,
                    difference
            );

            double breakRatio =
                    Core.countNonZero(
                            difference
                    )
                            / (double) (
                            difference.rows()
                                    * difference.cols()
                    );

            return clamp(
                    breakRatio
                            * 350,
                    0,
                    100
            );

        } finally {

            release(
                    edges
            );

            release(
                    horizontalKernel
            );

            release(
                    verticalKernel
            );

            release(
                    horizontal
            );

            release(
                    vertical
            );

            release(
                    difference
            );
        }
    }


    /*
     * =============================================================
     * FIND TYRE REGION
     * =============================================================
     */

    private Rect findDarkRegionBounds(
            Mat mask
    ) {

        Mat points =
                new Mat();

        try {

            Core.findNonZero(
                    mask,
                    points
            );

            if (points.empty()) {

                return null;
            }

            return Imgproc.boundingRect(
                    points
            );

        } finally {

            points.release();
        }
    }


    /*
     * =============================================================
     * CENTRAL ROI
     * =============================================================
     */

    private Mat createCentralRoi(
            Mat image
    ) {

        int width =
                Math.max(
                        1,
                        (int) (
                                image.cols()
                                        * 0.80
                        )
                );

        int height =
                Math.max(
                        1,
                        (int) (
                                image.rows()
                                        * 0.80
                        )
                );

        int x =
                Math.max(
                        0,
                        (
                                image.cols()
                                        - width
                        ) / 2
                );

        int y =
                Math.max(
                        0,
                        (
                                image.rows()
                                        - height
                        ) / 2
                );

        Rect rect =
                new Rect(
                        x,
                        y,
                        width,
                        height
                );

        return new Mat(
                image,
                rect
        ).clone();
    }


    /*
     * =============================================================
     * SAFE RECT
     * =============================================================
     */

    private Rect createSafeRect(
            Rect rect,
            int maxWidth,
            int maxHeight
    ) {

        int marginX =
                (int) (
                        rect.width
                                * 0.05
                );

        int marginY =
                (int) (
                        rect.height
                                * 0.05
                );

        int x =
                Math.max(
                        0,
                        rect.x
                                + marginX
                );

        int y =
                Math.max(
                        0,
                        rect.y
                                + marginY
                );

        int width =
                Math.min(
                        maxWidth
                                - x,
                        rect.width
                                - (
                                marginX
                                        * 2
                        )
                );

        int height =
                Math.min(
                        maxHeight
                                - y,
                        rect.height
                                - (
                                marginY
                                        * 2
                        )
                );

        width =
                Math.max(
                        1,
                        width
                );

        height =
                Math.max(
                        1,
                        height
                );

        return new Rect(
                x,
                y,
                width,
                height
        );
    }


    /*
     * =============================================================
     * HELPERS
     * =============================================================
     */

    private static double clamp(
            double value,
            double minimum,
            double maximum
    ) {

        return Math.max(
                minimum,
                Math.min(
                        maximum,
                        value
                )
        );
    }


    private double round(
            double value
    ) {

        return Math.round(
                value
                        * 100.0
        ) / 100.0;
    }


    private void release(
            Mat mat
    ) {

        if (mat != null) {

            mat.release();
        }
    }


    /*
     * =============================================================
     * LOCAL TEXTURE RESULT
     * =============================================================
     */

    private static class LocalTextureResult {

        private final double irregularityScore;

        private final double irregularBlockRatio;

        private LocalTextureResult(
                double irregularityScore,
                double irregularBlockRatio
        ) {

            this.irregularityScore =
                    irregularityScore;

            this.irregularBlockRatio =
                    irregularBlockRatio;
        }
    }
}