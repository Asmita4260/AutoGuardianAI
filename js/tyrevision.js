document.addEventListener("DOMContentLoaded", () => {

    console.log("TyreVision JS loaded successfully");


    /* =========================================================
       HTML ELEMENTS
       ========================================================= */

    const tyreImageInput =
        document.getElementById("tyreImageInput");

    const browseBtn =
        document.getElementById("browseBtn");

    const changeImageBtn =
        document.getElementById("changeImageBtn");

    const anotherTyreBtn =
        document.getElementById("anotherTyreBtn");

    const uploadContent =
        document.getElementById("uploadContent");

    const previewContainer =
        document.getElementById("previewContainer");

    const tyrePreview =
        document.getElementById("tyrePreview");

    const scanImage =
        document.getElementById("scanImage");

    const imageActions =
        document.getElementById("imageActions");

    const analyzeBtn =
        document.getElementById("analyzeBtn");

    const scanningSection =
        document.getElementById("scanningSection");

    const resultSection =
        document.getElementById("resultSection");

    const scanProgress =
        document.getElementById("scanProgress");

    const progressValue =
        document.getElementById("progressValue");

    const scanStatus =
        document.getElementById("scanStatus");

    const riskBadge =
        document.getElementById("riskBadge");

    const scoreCircle =
        document.getElementById("scoreCircle");

    const recommendationCard =
        document.getElementById("recommendationCard");


    /* =========================================================
       CHECK REQUIRED HTML ELEMENTS
       ========================================================= */

    const requiredElements = {

        tyreImageInput,
        browseBtn,
        changeImageBtn,
        anotherTyreBtn,
        uploadContent,
        previewContainer,
        tyrePreview,
        scanImage,
        imageActions,
        analyzeBtn,
        scanningSection,
        resultSection,
        scanProgress,
        progressValue,
        scanStatus,
        riskBadge,
        scoreCircle,
        recommendationCard

    };


    for (
        const [elementName, element]
        of Object.entries(requiredElements)
    ) {

        if (!element) {

            console.error(
                "TyreVision initialization failed."
            );

            console.error(
                "Missing HTML element:",
                elementName
            );

            return;
        }
    }


    /* =========================================================
       APPLICATION STATE
       ========================================================= */

    let selectedImage = null;

    let selectedImageToken = 0;

    let activeRequestToken = 0;

    let progressTimer = null;

    let analysisRunning = false;


    /* =========================================================
       OPEN FILE PICKER
       ========================================================= */

    function openFilePicker(event) {

        if (event) {

            event.preventDefault();

            event.stopPropagation();
        }


        if (analysisRunning) {

            return;
        }


        tyreImageInput.value = "";

        tyreImageInput.click();
    }


    browseBtn.addEventListener(
        "click",
        openFilePicker
    );


    changeImageBtn.addEventListener(
        "click",
        openFilePicker
    );


    /* =========================================================
       FILE SELECTED
       ========================================================= */

    tyreImageInput.addEventListener(
        "change",
        function () {

            const file =

                this.files &&
                this.files.length > 0

                    ? this.files[0]

                    : null;


            if (!file) {

                console.log(
                    "No tyre image selected"
                );

                return;
            }


            const allowedImageTypes = [

                "image/jpeg",

                "image/png",

                "image/webp"

            ];


            if (
                !allowedImageTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a JPG, JPEG, PNG or WEBP image."
                );


                this.value = "";


                selectedImage = null;


                return;
            }


            /*
             * Completely replace previous File object.
             */

            selectedImage = file;


            /*
             * Fresh image token.
             */

            selectedImageToken++;


            /*
             * Invalidate previous backend request.
             */

            activeRequestToken++;


            /*
             * Stop old progress animation.
             */

            stopProgress();


            analysisRunning = false;


            analyzeBtn.disabled = false;


            changeImageBtn.disabled = false;


            const fileToken =
                selectedImageToken;


            console.log(
                "================================"
            );


            console.log(
                "NEW TYRE SELECTED"
            );


            console.log(
                "Filename:",
                file.name
            );


            console.log(
                "File size:",
                file.size
            );


            console.log(
                "Content type:",
                file.type
            );


            console.log(
                "Last modified:",
                file.lastModified
            );


            console.log(
                "Image token:",
                fileToken
            );


            console.log(
                "================================"
            );


            /*
             * Hide previous analysis state.
             */

            scanningSection.classList.add(
                "hidden"
            );


            resultSection.classList.add(
                "hidden"
            );


            /*
             * Reset progress.
             */

            updateProgress(

                0,

                "Preparing tyre image"

            );


            /*
             * Read fresh selected image.
             */

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    /*
                     * Ignore old FileReader callback.
                     */

                    if (
                        fileToken !== selectedImageToken ||
                        selectedImage !== file
                    ) {

                        console.warn(
                            "Old image preview ignored"
                        );

                        return;
                    }


                    const imageURL =
                        event.target.result;


                    tyrePreview.src =
                        imageURL;


                    scanImage.src =
                        imageURL;


                    uploadContent.classList.add(
                        "hidden"
                    );


                    previewContainer.classList.remove(
                        "hidden"
                    );


                    imageActions.classList.remove(
                        "hidden"
                    );


                    console.log(
                        "Fresh tyre preview displayed"
                    );
                };


            reader.onerror =
                function () {

                    console.error(
                        "Unable to read tyre image"
                    );


                    selectedImage = null;


                    tyreImageInput.value = "";


                    alert(
                        "Unable to read the selected image."
                    );
                };


            reader.readAsDataURL(
                file
            );
        }
    );


    /* =========================================================
       ANALYZE BUTTON
       ========================================================= */

    analyzeBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            if (!selectedImage) {

                alert(
                    "Please choose a tyre image first."
                );

                return;
            }


            if (analysisRunning) {

                console.log(
                    "Tyre analysis is already running"
                );

                return;
            }


            await analyzeTyre();
        }
    );


    /* =========================================================
       ANALYZE TYRE
       ========================================================= */

    async function analyzeTyre() {

        /*
         * Capture exact File object.
         */

        const file =
            selectedImage;


        /*
         * Capture current image token.
         */

        const imageToken =
            selectedImageToken;


        /*
         * Generate unique request token.
         */

        const requestToken =
            ++activeRequestToken;


        if (!file) {

            alert(
                "Please choose a tyre image first."
            );

            return;
        }


        analysisRunning = true;


        analyzeBtn.disabled = true;


        changeImageBtn.disabled = true;


        console.log(
            "================================"
        );


        console.log(
            "STARTING TYRE ANALYSIS"
        );


        console.log(
            "Request token:",
            requestToken
        );


        console.log(
            "Image token:",
            imageToken
        );


        console.log(
            "Sending filename:",
            file.name
        );


        console.log(
            "Sending file size:",
            file.size
        );


        console.log(
            "Sending last modified:",
            file.lastModified
        );


        console.log(
            "================================"
        );


        resultSection.classList.add(
            "hidden"
        );


        scanningSection.classList.remove(
            "hidden"
        );


        scanningSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });


        startProgress();


        /*
         * Fresh FormData for every request.
         */

        const formData =
            new FormData();


        formData.append(

            "tyreImage",

            file,

            file.name

        );


        try {

            const response =
                await fetch(

                    "http://localhost:8080/api/tyre/analyze"
                    +
                    "?requestTime="
                    +
                    Date.now(),

                    {

                        method: "POST",

                        body: formData,

                        cache: "no-store"

                    }

                );


            const responseText =
                await response.text();


            console.log(
                "RAW BACKEND RESPONSE:"
            );


            console.log(
                responseText
            );


            let result;


            try {

                result =
                    JSON.parse(
                        responseText
                    );

            } catch (jsonError) {

                console.error(
                    "Invalid backend JSON:",
                    responseText
                );


                throw new Error(
                    "Backend returned invalid JSON."
                );
            }


            if (!response.ok) {

                throw new Error(

                    result.message ||
                    result.error ||
                    (
                        "Backend returned status "
                        +
                        response.status
                    )

                );
            }


            if (
                result.success !== true
            ) {

                throw new Error(

                    result.message ||
                    result.error ||
                    "Unable to analyze tyre."

                );
            }


            /*
             * Ignore stale backend result.
             */

            if (
                requestToken !== activeRequestToken ||
                imageToken !== selectedImageToken ||
                selectedImage !== file
            ) {

                console.warn(
                    "STALE TYRE RESULT IGNORED"
                );

                return;
            }


            /*
             * Normalize tyre health score.
             */

            const tyreScore =
                normalizeScore(

                    result.tyreScore ??
                    result.healthScore ??
                    result.score

                );


            if (tyreScore === null) {

                throw new Error(
                    "Backend returned an invalid tyre score."
                );
            }


            /*
             * FINAL SCORE RANGES
             *
             * 70 - 100 = LOW RISK
             * 31 - 69  = MODERATE RISK
             * 0  - 30  = HIGH RISK
             */

            const scoreRisk =
                getRiskFromScore(
                    tyreScore
                );


            /*
             * Backend risk only used for mismatch logging.
             */

            const backendRisk =
                normalizeRisk(

                    result.risk ??
                    result.safetyRisk ??
                    result.riskLevel

                );


            if (
                backendRisk !== "Unknown" &&
                backendRisk !== scoreRisk
            ) {

                console.warn(
                    "Backend risk and score range mismatch."
                );


                console.warn(
                    "Backend risk:",
                    backendRisk
                );


                console.warn(
                    "Score based risk:",
                    scoreRisk
                );
            }


            /*
             * Build final normalized result.
             */

            const normalizedResult = {

                ...result,

                filename:
                    result.filename ||
                    file.name,

                tyreScore:
                    tyreScore,

                risk:
                    scoreRisk,

                tyreCondition:
                    getConditionFromRisk(
                        scoreRisk
                    ),

                tyreStatus:
                    getStatusFromRisk(
                        scoreRisk
                    ),

                tyreMessage:
                    getMessageFromRisk(
                        scoreRisk
                    ),

                remainingLife:
                    getLifeFromRisk(
                        scoreRisk
                    ),

                recommendedAction:
                    getActionFromRisk(
                        scoreRisk
                    ),

                recommendationTitle:
                    getRecommendationTitle(
                        scoreRisk
                    ),

                recommendationText:
                    getRecommendationText(
                        scoreRisk
                    ),

                replacementPrediction:
                    getReplacementText(
                        scoreRisk
                    )

            };


            console.log(
                "================================"
            );


            console.log(
                "FRESH NORMALIZED TYRE RESULT"
            );


            console.log(
                "Filename:",
                normalizedResult.filename
            );


            console.log(
                "Health score:",
                normalizedResult.tyreScore
            );


            console.log(
                "Final risk:",
                normalizedResult.risk
            );


            console.log(
                "Condition:",
                normalizedResult.tyreCondition
            );


            console.log(
                "Complete result:",
                normalizedResult
            );


            console.log(
                "================================"
            );


            completeProgress();


            await delay(
                250
            );


            /*
             * Validate request again after UI delay.
             */

            if (
                requestToken !== activeRequestToken ||
                imageToken !== selectedImageToken ||
                selectedImage !== file
            ) {

                console.warn(
                    "Result display cancelled"
                );

                return;
            }


            showResult(
                normalizedResult
            );


        } catch (error) {

            console.error(
                "Tyre analysis failed:",
                error
            );


            stopProgress();


            if (
                requestToken === activeRequestToken
            ) {

                scanningSection.classList.add(
                    "hidden"
                );


                alert(

                    "Tyre analysis failed.\n\n"
                    +
                    error.message

                );
            }


        } finally {

            if (
                requestToken === activeRequestToken
            ) {

                analysisRunning = false;


                analyzeBtn.disabled = false;


                changeImageBtn.disabled = false;
            }
        }
    }


    /* =========================================================
       NORMALIZE SCORE
       ========================================================= */

    function normalizeScore(value) {

        const numericScore =
            Number(value);


        if (
            !Number.isFinite(
                numericScore
            )
        ) {

            return null;
        }


        return Math.round(

            Math.max(

                0,

                Math.min(
                    100,
                    numericScore
                )

            )

        );
    }


    /* =========================================================
       RISK FROM SCORE
       ========================================================= */

    function getRiskFromScore(score) {

        if (score >= 70) {

            return "Low";
        }


        if (score >= 31) {

            return "Moderate";
        }


        return "High";
    }


    /* =========================================================
       CONDITION FROM RISK
       ========================================================= */

    function getConditionFromRisk(risk) {

        if (risk === "High") {

            return "Heavily Damaged";
        }


        if (risk === "Moderate") {

            return "Visible Wear";
        }


        return "Healthy Condition";
    }


    /* =========================================================
       STATUS FROM RISK
       ========================================================= */

    function getStatusFromRisk(risk) {

        if (risk === "High") {

            return "Tyre Damage Detected";
        }


        if (risk === "Moderate") {

            return "Your Tyre Needs Attention";
        }


        return "Your Tyre Looks Healthy";
    }


    /* =========================================================
       MESSAGE FROM RISK
       ========================================================= */

    function getMessageFromRisk(risk) {

        if (risk === "High") {

            return "Severe visible tyre damage or structural irregularity was detected.";
        }


        if (risk === "Moderate") {

            return "Visible tyre wear or minor surface irregularity was detected.";
        }


        return "No major visible tyre damage was detected.";
    }


    /* =========================================================
       ESTIMATED LIFE
       ========================================================= */

    function getLifeFromRisk(risk) {

        if (risk === "High") {

            return "0 - 30%";
        }


        if (risk === "Moderate") {

            return "31 - 69%";
        }


        return "70 - 100%";
    }


    /* =========================================================
       RECOMMENDED ACTION
       ========================================================= */

    function getActionFromRisk(risk) {

        if (risk === "High") {

            return "Stop and Inspect";
        }


        if (risk === "Moderate") {

            return "Schedule Inspection";
        }


        return "Continue Monitoring";
    }


    /* =========================================================
       RECOMMENDATION TITLE
       ========================================================= */

    function getRecommendationTitle(risk) {

        if (risk === "High") {

            return "Immediate Attention Required";
        }


        if (risk === "Moderate") {

            return "Tyre Inspection Recommended";
        }


        return "Tyre Condition Looks Good";
    }


    /* =========================================================
       RECOMMENDATION TEXT
       ========================================================= */

    function getRecommendationText(risk) {

        if (risk === "High") {

            return "Severe visible tyre damage was detected. Avoid driving until the tyre is inspected by a professional.";
        }


        if (risk === "Moderate") {

            return "Visible tyre wear was detected. Check tread depth and tyre pressure and schedule an inspection.";
        }


        return "No major visible tyre damage was detected. Continue regular tyre checks.";
    }


    /* =========================================================
       REPLACEMENT PREDICTION
       ========================================================= */

    function getReplacementText(risk) {

        if (risk === "High") {

            return "Immediate tyre inspection and likely replacement recommended.";
        }


        if (risk === "Moderate") {

            return "Inspect the tyre during the upcoming service.";
        }


        return "No immediate tyre replacement indicated.";
    }


    /* =========================================================
       DISPLAY RESULT
       ========================================================= */

    function showResult(result) {

        console.log(
            "Displaying fresh TyreVision result:",
            result
        );


        scanningSection.classList.add(
            "hidden"
        );


        resultSection.classList.remove(
            "hidden"
        );


        setText(

            "tyreScore",

            Math.round(
                Number(
                    result.tyreScore
                )
            )

        );


        setText(

            "tyreStatus",

            result.tyreStatus ||
            getStatusFromRisk(
                result.risk
            )

        );


        setText(

            "tyreMessage",

            result.tyreMessage ||
            "Tyre analysis completed."

        );


        setText(

            "wearClassification",

            result.tyreCondition ||
            "Unable to Determine"

        );


        setText(

            "tyreRisk",

            result.risk

        );


        setText(

            "remainingLife",

            result.remainingLife

        );


        setText(

            "recommendedAction",

            result.recommendedAction

        );


        setText(

            "recommendationTitle",

            result.recommendationTitle

        );


        setText(

            "recommendationText",

            result.recommendationText

        );


        setText(

            "replacementPrediction",

            result.replacementPrediction

        );


        updateScoreCircle(

            result.tyreScore,

            result.risk

        );


        updateRiskBadge(
            result.risk
        );


        updateRecommendationCard(
            result.risk
        );


        updateResultCards(
            result.risk
        );


        /*
         * SAVE REPORT DATA.
         */

        saveTyreVisionReport(
            result
        );


        resultSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });
    }


    /* =========================================================
       SAVE TYREVISION REPORT
       ========================================================= */

    function saveTyreVisionReport(result) {

        const analysisDate =
            new Date();


        const report = {

            id:
                "tyre-"
                +
                Date.now(),

            module:
                "TyreVision AI",

            moduleKey:
                "tyrevision",

            filename:
                result.filename ||
                selectedImage?.name ||
                "Tyre Image",

            healthScore:
                Number(
                    result.tyreScore
                ),

            score:
                Number(
                    result.tyreScore
                ),

            tyreScore:
                Number(
                    result.tyreScore
                ),

            status:
                result.tyreStatus,

            tyreStatus:
                result.tyreStatus,

            condition:
                result.tyreCondition,

            tyreCondition:
                result.tyreCondition,

            risk:
                result.risk,

            safetyRisk:
                result.risk,

            remainingLife:
                result.remainingLife,

            recommendedAction:
                result.recommendedAction,

            recommendationTitle:
                result.recommendationTitle,

            recommendationText:
                result.recommendationText,

            replacementPrediction:
                result.replacementPrediction,

            message:
                result.tyreMessage,

            tyreMessage:
                result.tyreMessage,

            analysisDate:
                analysisDate.toISOString(),

            timestamp:
                analysisDate.getTime()

        };


        try {

            /*
             * Save latest TyreVision result.
             */

            localStorage.setItem(

                "tyreVisionResult",

                JSON.stringify(
                    report
                )

            );


            /*
             * Read complete analysis history.
             */

            let analysisHistory = [];


            const storedHistory =
                localStorage.getItem(
                    "analysisHistory"
                );


            if (storedHistory) {

                try {

                    const parsedHistory =
                        JSON.parse(
                            storedHistory
                        );


                    if (
                        Array.isArray(
                            parsedHistory
                        )
                    ) {

                        analysisHistory =
                            parsedHistory;
                    }

                } catch (historyError) {

                    console.warn(
                        "Unable to parse old analysis history.",
                        historyError
                    );


                    analysisHistory = [];
                }
            }


            /*
             * Add newest report first.
             */

            analysisHistory.unshift(
                report
            );


            /*
             * Keep maximum 100 reports.
             */

            analysisHistory =
                analysisHistory.slice(
                    0,
                    100
                );


            localStorage.setItem(

                "analysisHistory",

                JSON.stringify(
                    analysisHistory
                )

            );


            console.log(
                "================================"
            );


            console.log(
                "TYREVISION REPORT SAVED"
            );


            console.log(
                report
            );


            console.log(
                "Total analysis reports:",
                analysisHistory.length
            );


            console.log(
                "================================"
            );


        } catch (storageError) {

            console.error(
                "Unable to save TyreVision report:",
                storageError
            );
        }
    }


    /* =========================================================
       UPDATE SCORE CIRCLE
       ========================================================= */

    function updateScoreCircle(
        score,
        risk
    ) {

        const safeScore =

            Math.max(

                0,

                Math.min(
                    100,
                    Number(score)
                )

            );


        let scoreColor =
            "#16a34a";


        if (risk === "Moderate") {

            scoreColor =
                "#f59e0b";
        }


        if (risk === "High") {

            scoreColor =
                "#dc2626";
        }


        const scoreAngle =

            (
                safeScore / 100
            )
            *
            360;


        scoreCircle.style.background =

            `conic-gradient(
                ${scoreColor} 0deg,
                ${scoreColor} ${scoreAngle}deg,
                #e2e8f0 ${scoreAngle}deg,
                #e2e8f0 360deg
            )`;
    }


    /* =========================================================
       UPDATE RISK BADGE
       ========================================================= */

    function updateRiskBadge(risk) {

        riskBadge.textContent =

            "Safety Risk: "
            +
            risk;


        riskBadge.classList.remove(

            "risk-low",

            "risk-moderate",

            "risk-high"

        );


        if (risk === "High") {

            riskBadge.classList.add(
                "risk-high"
            );

            return;
        }


        if (risk === "Moderate") {

            riskBadge.classList.add(
                "risk-moderate"
            );

            return;
        }


        riskBadge.classList.add(
            "risk-low"
        );
    }


    /* =========================================================
       UPDATE RECOMMENDATION CARD
       ========================================================= */

    function updateRecommendationCard(risk) {

        recommendationCard.classList.remove(

            "recommendation-low",

            "recommendation-moderate",

            "recommendation-high"

        );


        if (risk === "High") {

            recommendationCard.classList.add(
                "recommendation-high"
            );

            return;
        }


        if (risk === "Moderate") {

            recommendationCard.classList.add(
                "recommendation-moderate"
            );

            return;
        }


        recommendationCard.classList.add(
            "recommendation-low"
        );
    }


    /* =========================================================
       UPDATE RESULT CARDS
       ========================================================= */

    function updateResultCards(risk) {

        const resultCards =

            document.querySelectorAll(
                ".result-card"
            );


        resultCards.forEach(

            function (card) {

                card.classList.remove(

                    "state-low",

                    "state-moderate",

                    "state-high"

                );


                if (risk === "High") {

                    card.classList.add(
                        "state-high"
                    );

                    return;
                }


                if (risk === "Moderate") {

                    card.classList.add(
                        "state-moderate"
                    );

                    return;
                }


                card.classList.add(
                    "state-low"
                );
            }

        );
    }


    /* =========================================================
       NORMALIZE BACKEND RISK
       ========================================================= */

    function normalizeRisk(value) {

        const normalizedValue =

            String(
                value ?? ""
            )

            .trim()

            .toLowerCase();


        if (
            normalizedValue === "low"
        ) {

            return "Low";
        }


        if (
            normalizedValue === "moderate"
        ) {

            return "Moderate";
        }


        if (
            normalizedValue === "high"
        ) {

            return "High";
        }


        return "Unknown";
    }


    /* =========================================================
       SAFE TEXT UPDATE
       ========================================================= */

    function setText(
        elementId,
        value
    ) {

        const element =

            document.getElementById(
                elementId
            );


        if (!element) {

            console.warn(

                "Unable to update missing element:",

                elementId

            );

            return;
        }


        element.textContent =

            value ?? "--";
    }


    /* =========================================================
       START PROGRESS
       ========================================================= */

    function startProgress() {

        stopProgress();


        let progress = 0;


        updateProgress(

            0,

            "Preparing tyre image"

        );


        progressTimer =

            window.setInterval(

                function () {

                    if (
                        progress >= 90
                    ) {

                        return;
                    }


                    if (
                        progress < 40
                    ) {

                        progress += 4;

                    } else if (
                        progress < 70
                    ) {

                        progress += 2;

                    } else {

                        progress += 1;
                    }


                    let progressStatus =

                        "Preparing tyre image";


                    if (
                        progress >= 25
                    ) {

                        progressStatus =

                            "Checking tyre surface";
                    }


                    if (
                        progress >= 50
                    ) {

                        progressStatus =

                            "Detecting visible damage";
                    }


                    if (
                        progress >= 75
                    ) {

                        progressStatus =

                            "Calculating tyre condition";
                    }


                    updateProgress(

                        Math.min(
                            progress,
                            90
                        ),

                        progressStatus

                    );

                },

                120

            );
    }


    /* =========================================================
       COMPLETE PROGRESS
       ========================================================= */

    function completeProgress() {

        stopProgress();


        updateProgress(

            100,

            "Analysis completed"

        );
    }


    /* =========================================================
       STOP PROGRESS
       ========================================================= */

    function stopProgress() {

        if (
            progressTimer !== null
        ) {

            window.clearInterval(
                progressTimer
            );


            progressTimer = null;
        }
    }


    /* =========================================================
       UPDATE PROGRESS
       ========================================================= */

    function updateProgress(
        value,
        status
    ) {

        scanProgress.style.width =

            value
            +
            "%";


        progressValue.textContent =

            value
            +
            "%";


        scanStatus.textContent =

            status;
    }


    /* =========================================================
       ANALYZE ANOTHER TYRE
       ========================================================= */

    anotherTyreBtn.addEventListener(

        "click",

        function (event) {

            event.preventDefault();


            resetModule();
        }

    );


    /* =========================================================
       RESET COMPLETE MODULE
       ========================================================= */

    function resetModule() {

        console.log(
            "Resetting TyreVision module"
        );


        activeRequestToken++;


        selectedImageToken++;


        stopProgress();


        selectedImage = null;


        analysisRunning = false;


        tyreImageInput.value = "";


        tyrePreview.removeAttribute(
            "src"
        );


        scanImage.removeAttribute(
            "src"
        );


        analyzeBtn.disabled = false;


        changeImageBtn.disabled = false;


        previewContainer.classList.add(
            "hidden"
        );


        imageActions.classList.add(
            "hidden"
        );


        scanningSection.classList.add(
            "hidden"
        );


        resultSection.classList.add(
            "hidden"
        );


        uploadContent.classList.remove(
            "hidden"
        );


        updateProgress(

            0,

            "Preparing tyre image"

        );


        setText(
            "tyreScore",
            "--"
        );


        setText(
            "tyreStatus",
            "Tyre Analysis Result"
        );


        setText(
            "tyreMessage",
            "Tyre analysis completed."
        );


        setText(
            "wearClassification",
            "--"
        );


        setText(
            "tyreRisk",
            "--"
        );


        setText(
            "remainingLife",
            "--"
        );


        setText(
            "recommendedAction",
            "--"
        );


        setText(
            "recommendationTitle",
            "--"
        );


        setText(
            "recommendationText",
            "--"
        );


        setText(
            "replacementPrediction",
            "--"
        );


        riskBadge.textContent =

            "Safety Risk: --";


        riskBadge.classList.remove(

            "risk-low",

            "risk-moderate",

            "risk-high"

        );


        recommendationCard.classList.remove(

            "recommendation-low",

            "recommendation-moderate",

            "recommendation-high"

        );


        const resultCards =

            document.querySelectorAll(
                ".result-card"
            );


        resultCards.forEach(

            function (card) {

                card.classList.remove(

                    "state-low",

                    "state-moderate",

                    "state-high"

                );
            }

        );


        scoreCircle.style.background =

            `conic-gradient(
                #94a3b8 0deg,
                #94a3b8 0deg,
                #e2e8f0 0deg,
                #e2e8f0 360deg
            )`;


        console.log(
            "TyreVision reset complete"
        );


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });
    }


    /* =========================================================
       DELAY
       ========================================================= */

    function delay(milliseconds) {

        return new Promise(

            function (resolve) {

                window.setTimeout(

                    resolve,

                    milliseconds

                );
            }

        );
    }


    console.log(
        "================================"
    );


    console.log(
        "TyreVision initialization complete"
    );


    console.log(
        "Report storage integration ready"
    );


    console.log(
        "Health classification:"
    );


    console.log(
        "70 - 100 = Healthy / Low"
    );


    console.log(
        "31 - 69 = Visible Wear / Moderate"
    );


    console.log(
        "0 - 30 = Heavily Damaged / High"
    );


    console.log(
        "================================"
    );

});