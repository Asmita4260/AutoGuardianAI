"use strict";

import {
    FaceLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm";


/* =========================================================
   HTML ELEMENTS
   ========================================================= */

const cameraPlaceholder =
    document.getElementById("cameraPlaceholder");

const driverVideo =
    document.getElementById("driverVideo");

const detectionCanvas =
    document.getElementById("detectionCanvas");

const liveIndicator =
    document.getElementById("liveIndicator");

const faceDetectionIndicator =
    document.getElementById("faceDetectionIndicator");

const faceDetectionText =
    document.getElementById("faceDetectionText");

const startMonitoringBtn =
    document.getElementById("startMonitoringBtn");

const stopMonitoringBtn =
    document.getElementById("stopMonitoringBtn");

const aiStatusText =
    document.getElementById("aiStatusText");

const driverStatusCircle =
    document.getElementById("driverStatusCircle");

const driverStatusIcon =
    document.getElementById("driverStatusIcon");

const driverStatusTitle =
    document.getElementById("driverStatusTitle");

const driverStatusMessage =
    document.getElementById("driverStatusMessage");

const driverStatusBadge =
    document.getElementById("driverStatusBadge");

const driverState =
    document.getElementById("driverState");

const eyeStatus =
    document.getElementById("eyeStatus");

const drowsinessRisk =
    document.getElementById("drowsinessRisk");

const monitoringTime =
    document.getElementById("monitoringTime");

const driverStateCard =
    document.getElementById("driverStateCard");

const eyeStatusCard =
    document.getElementById("eyeStatusCard");

const riskCard =
    document.getElementById("riskCard");

const safetyCard =
    document.getElementById("safetyCard");

const safetyTitle =
    document.getElementById("safetyTitle");

const safetyMessage =
    document.getElementById("safetyMessage");

const safetyAction =
    document.getElementById("safetyAction");

const drowsinessAlert =
    document.getElementById("drowsinessAlert");

const dismissAlertBtn =
    document.getElementById("dismissAlertBtn");

const alertAudio =
    document.getElementById("alertAudio");


/* =========================================================
   AUTOGUARDIAN SETTINGS
   ========================================================= */

const SETTINGS_STORAGE_KEY =
    "autoGuardianSettings";


const DEFAULT_SETTINGS = {

    audioAlerts: true,

    safetyNotifications: true,

    riskSensitivity: "moderate"

};


function getAutoGuardianSettings() {

    try {

        const storedSettings =
            localStorage.getItem(
                SETTINGS_STORAGE_KEY
            );


        if (!storedSettings) {

            return {
                ...DEFAULT_SETTINGS
            };
        }


        const parsedSettings =
            JSON.parse(
                storedSettings
            );


        return {

            audioAlerts:
                typeof parsedSettings.audioAlerts ===
                "boolean"
                    ? parsedSettings.audioAlerts
                    : DEFAULT_SETTINGS.audioAlerts,


            safetyNotifications:
                typeof parsedSettings.safetyNotifications ===
                "boolean"
                    ? parsedSettings.safetyNotifications
                    : DEFAULT_SETTINGS.safetyNotifications,


            riskSensitivity:
                [
                    "low",
                    "moderate",
                    "high"
                ].includes(
                    parsedSettings.riskSensitivity
                )
                    ? parsedSettings.riskSensitivity
                    : DEFAULT_SETTINGS.riskSensitivity

        };

    }

    catch (error) {

        console.warn(
            "Unable to read AutoGuardian settings:",
            error
        );


        return {
            ...DEFAULT_SETTINGS
        };
    }
}


function areAudioAlertsEnabled() {

    return getAutoGuardianSettings()
        .audioAlerts;
}


function areSafetyNotificationsEnabled() {

    return getAutoGuardianSettings()
        .safetyNotifications;
}


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let faceLandmarker = null;

let detectorReady = false;

let detectorInitializationStarted = false;

let mediaStream = null;

let isMonitoring = false;

let animationFrameId = null;

let lastVideoTime = -1;

let monitoringTimer = null;

let monitoringStartedAt = null;

let currentDriverState = "IDLE";

let currentEyeState = "NOT_DETECTED";

let alertDismissed = false;


/* =========================================================
   SESSION REPORT STATE
   ========================================================= */

let highestDriverState = null;

let highestDriverSeverity = 0;

let finalDetectedEyeState =
    "NOT_DETECTED";


/* =========================================================
   EYE DETECTION STATE
   ========================================================= */

let eyesClosedStartedAt = null;

let previousEyesClosed = false;

let prolongedClosureEvents = [];

let lastFatigueEventAt = 0;

let lastValidFaceAt = 0;


/* =========================================================
   ALERT STATE
   ========================================================= */

let lastFatigueVoiceAt = 0;

let lastDrowsyVoiceAt = 0;

let lastAlarmAt = 0;

let activeVoiceType = null;


/* =========================================================
   BLINK SMOOTHING
   ========================================================= */

const blinkScoreHistory = [];


/* =========================================================
   DETECTION CONFIGURATION
   ========================================================= */

const BLINK_HISTORY_SIZE = 5;

const CLOSED_THRESHOLD = 0.62;

const OPEN_THRESHOLD = 0.42;

const FATIGUE_CLOSURE_MS = 650;

const DROWSY_CLOSURE_MS = 1800;

const FATIGUE_EVENT_WINDOW_MS = 15000;

const FATIGUE_EVENT_COUNT = 3;

const FATIGUE_STATE_HOLD_MS = 3500;

const FACE_MISSING_TIMEOUT_MS = 800;

const FATIGUE_VOICE_COOLDOWN_MS = 15000;

const DROWSY_VOICE_COOLDOWN_MS = 8000;

const ALARM_COOLDOWN_MS = 5000;


/* =========================================================
   INITIALIZE DRIVER AI
   ========================================================= */

async function initializeDriverAI() {

    if (
        detectorReady ||
        detectorInitializationStarted
    ) {

        return;
    }


    detectorInitializationStarted = true;


    try {

        aiStatusText.textContent =
            "DRIVER AI INITIALIZING";


        setLoadingButton();


        const vision =
            await FilesetResolver.forVisionTasks(

                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"

            );


        faceLandmarker =
            await FaceLandmarker.createFromOptions(

                vision,

                {

                    baseOptions: {

                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",

                        delegate:
                            "GPU"

                    },

                    runningMode:
                        "VIDEO",

                    numFaces:
                        1,

                    outputFaceBlendshapes:
                        true,

                    outputFacialTransformationMatrixes:
                        false

                }

            );


        detectorReady = true;


        aiStatusText.textContent =
            "DRIVER AI READY";


        setReadyButton();


        console.log(
            "SafeRide Driver AI initialized successfully."
        );

    }

    catch (error) {

        detectorReady = false;

        detectorInitializationStarted = false;


        aiStatusText.textContent =
            "DRIVER AI ERROR";


        setErrorButton();


        driverStatusTitle.textContent =
            "Driver AI Could Not Load";


        driverStatusMessage.textContent =
            "The face detection model could not be initialized.";


        safetyTitle.textContent =
            "Driver AI Unavailable";


        safetyMessage.textContent =
            "Check your internet connection and reload the page.";


        safetyAction.textContent =
            "SafeRide monitoring cannot start until the AI model loads.";


        console.error(
            "SafeRide initialization failed:",
            error
        );
    }
}


/* =========================================================
   BUTTON STATES
   ========================================================= */

function setLoadingButton() {

    startMonitoringBtn.disabled = true;


    startMonitoringBtn.innerHTML =

        '<i class="fa-solid fa-spinner fa-spin"></i> Loading Driver AI';

}


function setReadyButton() {

    startMonitoringBtn.disabled = false;


    startMonitoringBtn.innerHTML =

        '<i class="fa-solid fa-play"></i> Start Monitoring';

}


function setErrorButton() {

    startMonitoringBtn.disabled = true;


    startMonitoringBtn.innerHTML =

        '<i class="fa-solid fa-triangle-exclamation"></i> Driver AI Unavailable';

}


/* =========================================================
   START MONITORING
   ========================================================= */

async function startMonitoring() {

    if (isMonitoring) {

        return;
    }


    if (
        !detectorReady ||
        !faceLandmarker
    ) {

        alert(
            "Driver AI is still loading. Please wait."
        );

        return;
    }


    try {

        prepareVoiceSystem();


        console.log(
            "SafeRide settings:",
            getAutoGuardianSettings()
        );


        mediaStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode:
                        "user",

                    width: {

                        ideal:
                            1280

                    },

                    height: {

                        ideal:
                            720

                    }

                },

                audio:
                    false

            });


        driverVideo.srcObject =
            mediaStream;


        await driverVideo.play();


        cameraPlaceholder.classList.add(
            "hidden"
        );


        driverVideo.classList.remove(
            "hidden"
        );


        detectionCanvas.classList.remove(
            "hidden"
        );


        liveIndicator.classList.remove(
            "hidden"
        );


        faceDetectionIndicator.classList.remove(
            "hidden"
        );


        startMonitoringBtn.classList.add(
            "hidden"
        );


        stopMonitoringBtn.classList.remove(
            "hidden"
        );


        resetDetectionTracking();


        resetSessionReportTracking();


        isMonitoring = true;


        monitoringStartedAt =
            Date.now();


        aiStatusText.textContent =
            "DRIVER AI MONITORING";


        startMonitoringTimer();


        updateAnalyzingState();


        lastVideoTime = -1;


        animationFrameId =
            window.requestAnimationFrame(
                runDetectionLoop
            );


        console.log(
            "SafeRide monitoring started."
        );

    }

    catch (error) {

        stopCameraTracks();


        console.error(
            "Unable to start camera:",
            error
        );


        if (
            error.name ===
            "NotAllowedError"
        ) {

            alert(
                "Camera permission was denied. Allow camera access and try again."
            );

        }

        else {

            alert(

                error.message ||
                "Unable to start the camera."

            );

        }
    }
}


/* =========================================================
   VOICE SYSTEM
   ========================================================= */

function prepareVoiceSystem() {

    if (!areAudioAlertsEnabled()) {

        return;
    }


    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

        window.speechSynthesis.getVoices();

    }
}


/* =========================================================
   DETECTION LOOP
   ========================================================= */

function runDetectionLoop() {

    if (!isMonitoring) {

        return;
    }


    try {

        if (

            driverVideo.readyState >=
            HTMLMediaElement.HAVE_CURRENT_DATA

            &&

            driverVideo.currentTime !==
            lastVideoTime

        ) {

            lastVideoTime =
                driverVideo.currentTime;


            const detectionResult =

                faceLandmarker.detectForVideo(

                    driverVideo,

                    performance.now()

                );


            processDetectionResult(

                detectionResult,

                Date.now()

            );

        }

    }

    catch (error) {

        console.error(
            "Detection frame failed:",
            error
        );

    }


    if (isMonitoring) {

        animationFrameId =

            window.requestAnimationFrame(
                runDetectionLoop
            );

    }
}


/* =========================================================
   PROCESS FACE DETECTION
   ========================================================= */

function processDetectionResult(
    detectionResult,
    currentTime
) {

    const blendshapeResults =
        detectionResult.faceBlendshapes;


    if (

        !blendshapeResults ||
        blendshapeResults.length === 0

    ) {

        handleFaceNotDetected(
            currentTime
        );

        return;
    }


    lastValidFaceAt =
        currentTime;


    faceDetectionText.textContent =
        "FACE DETECTED";


    const categories =

        blendshapeResults[0].categories;


    const leftBlinkScore =

        getBlendshapeScore(

            categories,

            "eyeBlinkLeft"

        );


    const rightBlinkScore =

        getBlendshapeScore(

            categories,

            "eyeBlinkRight"

        );


    if (

        leftBlinkScore === null ||
        rightBlinkScore === null

    ) {

        handleFaceNotDetected(
            currentTime
        );

        return;
    }


    const rawBlinkScore =

        (
            leftBlinkScore +
            rightBlinkScore
        )
        /
        2;


    const smoothedBlinkScore =

        getSmoothedBlinkScore(
            rawBlinkScore
        );


    processEyeState(

        smoothedBlinkScore,

        currentTime

    );
}


/* =========================================================
   BLENDSHAPE SCORE
   ========================================================= */

function getBlendshapeScore(
    categories,
    categoryName
) {

    const category =

        categories.find(

            function (item) {

                return (

                    item.categoryName ===
                    categoryName

                );

            }

        );


    if (!category) {

        return null;
    }


    return category.score;
}


/* =========================================================
   SMOOTH BLINK SCORE
   ========================================================= */

function getSmoothedBlinkScore(
    score
) {

    blinkScoreHistory.push(
        score
    );


    if (

        blinkScoreHistory.length >
        BLINK_HISTORY_SIZE

    ) {

        blinkScoreHistory.shift();

    }


    const total =

        blinkScoreHistory.reduce(

            function (
                sum,
                value
            ) {

                return sum + value;

            },

            0

        );


    return (

        total /
        blinkScoreHistory.length

    );
}


/* =========================================================
   PROCESS EYE STATE
   ========================================================= */

function processEyeState(
    blinkScore,
    currentTime
) {

    let eyesClosed =
        previousEyesClosed;


    if (
        blinkScore >=
        CLOSED_THRESHOLD
    ) {

        eyesClosed = true;

    }

    else if (
        blinkScore <=
        OPEN_THRESHOLD
    ) {

        eyesClosed = false;

    }


    if (eyesClosed) {

        processClosedEyes(
            currentTime
        );

    }

    else {

        processOpenEyes(
            currentTime
        );

    }


    previousEyesClosed =
        eyesClosed;
}


/* =========================================================
   CLOSED EYES
   ========================================================= */

function processClosedEyes(
    currentTime
) {

    if (
        eyesClosedStartedAt === null
    ) {

        eyesClosedStartedAt =
            currentTime;

    }


    const closureDuration =

        currentTime -
        eyesClosedStartedAt;


    if (
        closureDuration >=
        DROWSY_CLOSURE_MS
    ) {

        updateDriverCondition(

            "DROWSY",

            "CLOSED"

        );


        handleDrowsyWarning(
            currentTime
        );


        return;
    }


    if (
        closureDuration >=
        FATIGUE_CLOSURE_MS
    ) {

        updateDriverCondition(

            "FATIGUED",

            "CLOSED"

        );


        handleFatigueWarning(
            currentTime
        );


        return;
    }


    updateDriverCondition(

        "ALERT",

        "CLOSED"

    );
}


/* =========================================================
   OPEN EYES
   ========================================================= */

function processOpenEyes(
    currentTime
) {

    if (

        previousEyesClosed

        &&

        eyesClosedStartedAt !== null

    ) {

        const closureDuration =

            currentTime -
            eyesClosedStartedAt;


        if (

            closureDuration >=
            FATIGUE_CLOSURE_MS

        ) {

            registerFatigueEvent(
                currentTime
            );

        }

    }


    eyesClosedStartedAt = null;


    removeExpiredFatigueEvents(
        currentTime
    );


    if (

        prolongedClosureEvents.length >=
        FATIGUE_EVENT_COUNT

    ) {

        lastFatigueEventAt =
            currentTime;


        updateDriverCondition(

            "FATIGUED",

            "OPEN"

        );


        handleFatigueWarning(
            currentTime
        );


        return;
    }


    if (

        lastFatigueEventAt > 0

        &&

        (
            currentTime -
            lastFatigueEventAt
        )
        <
        FATIGUE_STATE_HOLD_MS

    ) {

        updateDriverCondition(

            "FATIGUED",

            "OPEN"

        );


        return;
    }


    alertDismissed = false;


    stopWarningSystems();


    updateDriverCondition(

        "ALERT",

        "OPEN"

    );
}


/* =========================================================
   FATIGUE EVENTS
   ========================================================= */

function registerFatigueEvent(
    currentTime
) {

    prolongedClosureEvents.push(
        currentTime
    );


    removeExpiredFatigueEvents(
        currentTime
    );
}


function removeExpiredFatigueEvents(
    currentTime
) {

    prolongedClosureEvents =

        prolongedClosureEvents.filter(

            function (eventTime) {

                return (

                    currentTime -
                    eventTime

                    <=

                    FATIGUE_EVENT_WINDOW_MS

                );

            }

        );
}


/* =========================================================
   WARNING SYSTEM
   ========================================================= */

function handleFatigueWarning(
    currentTime
) {

    if (!areAudioAlertsEnabled()) {

        stopWarningAudio();

        return;
    }


    if (

        currentTime -
        lastFatigueVoiceAt

        <

        FATIGUE_VOICE_COOLDOWN_MS

    ) {

        return;
    }


    lastFatigueVoiceAt =
        currentTime;


    playVoiceAlert(

        "FATIGUE",

        "Caution. Driver fatigue detected. Please consider taking a short rest break."

    );
}


function handleDrowsyWarning(
    currentTime
) {

    showDrowsinessAlert();


    if (!areAudioAlertsEnabled()) {

        stopWarningAudio();

        return;
    }


    if (

        !alertDismissed

        &&

        currentTime -
        lastAlarmAt

        >=

        ALARM_COOLDOWN_MS

    ) {

        lastAlarmAt =
            currentTime;


        playAlertSound();

    }


    if (

        !alertDismissed

        &&

        currentTime -
        lastDrowsyVoiceAt

        >=

        DROWSY_VOICE_COOLDOWN_MS

    ) {

        lastDrowsyVoiceAt =
            currentTime;


        playVoiceAlert(

            "DROWSY",

            "Warning! Drowsiness detected. Please stop the vehicle safely and take a break."

        );

    }
}


/* =========================================================
   VOICE ALERT
   ========================================================= */

function playVoiceAlert(
    voiceType,
    message
) {

    if (!areAudioAlertsEnabled()) {

        stopVoiceAlert();

        return;
    }


    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        return;
    }


    if (

        window.speechSynthesis.speaking

        &&

        activeVoiceType ===
        voiceType

    ) {

        return;
    }


    window.speechSynthesis.cancel();


    const speechMessage =

        new SpeechSynthesisUtterance(
            message
        );


    speechMessage.lang =
        "en-IN";


    speechMessage.rate =
        0.9;


    speechMessage.volume =
        1;


    activeVoiceType =
        voiceType;


    speechMessage.onend =
        function () {

            activeVoiceType = null;

        };


    speechMessage.onerror =
        function () {

            activeVoiceType = null;

        };


    window.speechSynthesis.speak(
        speechMessage
    );
}


function stopVoiceAlert() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }


    activeVoiceType = null;
}


/* =========================================================
   ALERT SOUND
   ========================================================= */

function playAlertSound() {

    if (!areAudioAlertsEnabled()) {

        stopAlertSound();

        return;
    }


    if (!alertAudio) {

        return;
    }


    alertAudio.currentTime = 0;


    const audioPromise =
        alertAudio.play();


    if (
        audioPromise &&
        typeof audioPromise.catch ===
        "function"
    ) {

        audioPromise.catch(

            function (error) {

                console.warn(
                    "Alert audio could not play:",
                    error
                );

            }

        );

    }
}


function stopAlertSound() {

    if (!alertAudio) {

        return;
    }


    alertAudio.pause();

    alertAudio.currentTime = 0;
}


function stopWarningAudio() {

    stopAlertSound();

    stopVoiceAlert();
}


/* =========================================================
   DROWSINESS ALERT
   ========================================================= */

function showDrowsinessAlert() {

    if (!areSafetyNotificationsEnabled()) {

        hideDrowsinessAlert();

        return;
    }


    if (!alertDismissed) {

        drowsinessAlert.classList.remove(
            "hidden"
        );

    }
}


function hideDrowsinessAlert() {

    drowsinessAlert.classList.add(
        "hidden"
    );
}


function dismissDrowsinessAlert() {

    alertDismissed = true;


    stopWarningSystems();
}


function stopWarningSystems() {

    stopWarningAudio();

    hideDrowsinessAlert();
}


/* =========================================================
   FACE NOT DETECTED
   ========================================================= */

function handleFaceNotDetected(
    currentTime
) {

    if (

        lastValidFaceAt === 0

        ||

        currentTime -
        lastValidFaceAt

        >=

        FACE_MISSING_TIMEOUT_MS

    ) {

        showSearchingForFaceState();

    }
}


/* =========================================================
   CLEAR UI STATES
   ========================================================= */

function clearStates() {

    driverStatusCircle.classList.remove(

        "status-idle",

        "status-alert",

        "status-fatigued",

        "status-drowsy"

    );


    driverStatusBadge.classList.remove(

        "status-idle-badge",

        "status-alert-badge",

        "status-fatigued-badge",

        "status-drowsy-badge"

    );


    [

        driverStateCard,

        eyeStatusCard,

        riskCard

    ].forEach(

        function (card) {

            card.classList.remove(

                "state-safe",

                "state-warning",

                "state-danger"

            );

        }

    );


    safetyCard.classList.remove(

        "safety-idle",

        "safety-safe",

        "safety-warning",

        "safety-danger"

    );
}


/* =========================================================
   SEARCHING STATE
   ========================================================= */

function showSearchingForFaceState() {

    currentDriverState =
        "SEARCHING";


    currentEyeState =
        "NOT_DETECTED";


    faceDetectionText.textContent =
        "SEARCHING FOR FACE";


    clearStates();


    driverStatusCircle.classList.add(
        "status-idle"
    );


    driverStatusBadge.classList.add(
        "status-idle-badge"
    );


    safetyCard.classList.add(
        "safety-idle"
    );


    driverStatusIcon.className =
        "fa-solid fa-face-viewfinder";


    driverStatusTitle.textContent =
        "Face Not Detected";


    driverStatusMessage.textContent =
        "Keep your face clearly visible and centered in the camera.";


    driverStatusBadge.textContent =
        "Driver Status: Searching";


    driverState.textContent =
        "Searching";


    eyeStatus.textContent =
        "Not Detected";


    drowsinessRisk.textContent =
        "--";


    safetyTitle.textContent =
        "Driver Visibility Required";


    safetyMessage.textContent =
        "SafeRide AI needs a clear view of the driver's face.";


    safetyAction.textContent =
        "Face the camera and ensure adequate lighting.";


    stopWarningSystems();


    resetEyeClosureTracking();
}


/* =========================================================
   ANALYZING STATE
   ========================================================= */

function updateAnalyzingState() {

    currentDriverState =
        "ANALYZING";


    currentEyeState =
        "NOT_DETECTED";


    faceDetectionText.textContent =
        "SEARCHING FOR FACE";


    clearStates();


    driverStatusCircle.classList.add(
        "status-idle"
    );


    driverStatusBadge.classList.add(
        "status-idle-badge"
    );


    safetyCard.classList.add(
        "safety-idle"
    );


    driverStatusIcon.className =
        "fa-solid fa-face-viewfinder";


    driverStatusTitle.textContent =
        "Analyzing Driver";


    driverStatusMessage.textContent =
        "Camera is active. SafeRide AI is detecting the driver's face and eyes.";


    driverStatusBadge.textContent =
        "Driver Status: Analyzing";


    driverState.textContent =
        "Analyzing";


    eyeStatus.textContent =
        "Detecting...";


    drowsinessRisk.textContent =
        "--";


    safetyTitle.textContent =
        "Driver Analysis Active";


    safetyMessage.textContent =
        "SafeRide AI is analyzing real-time facial and eye signals.";


    safetyAction.textContent =
        "Keep your face visible and look naturally ahead.";
}


/* =========================================================
   UPDATE DRIVER CONDITION
   ========================================================= */

function updateDriverCondition(
    state,
    detectedEyeStatus
) {

    if (!isMonitoring) {

        return;
    }


    const normalizedState =

        String(state).toUpperCase();


    const normalizedEyeStatus =

        String(
            detectedEyeStatus
        ).toUpperCase();


    if (

        normalizedState ===
        currentDriverState

        &&

        normalizedEyeStatus ===
        currentEyeState

    ) {

        return;
    }


    currentDriverState =
        normalizedState;


    currentEyeState =
        normalizedEyeStatus;


    trackSessionDriverState(

        normalizedState,

        normalizedEyeStatus

    );


    clearStates();


    if (
        normalizedState ===
        "ALERT"
    ) {

        showAlertState(
            normalizedEyeStatus
        );

    }

    else if (
        normalizedState ===
        "FATIGUED"
    ) {

        showFatiguedState(
            normalizedEyeStatus
        );

    }

    else if (
        normalizedState ===
        "DROWSY"
    ) {

        showDrowsyState(
            normalizedEyeStatus
        );

    }
}


/* =========================================================
   TRACK HIGHEST SESSION RISK
   ========================================================= */

function trackSessionDriverState(
    state,
    detectedEyeStatus
) {

    const severityMap = {

        ALERT:
            1,

        FATIGUED:
            2,

        DROWSY:
            3

    };


    const severity =

        severityMap[state] ||
        0;


    if (
        severity === 0
    ) {

        return;
    }


    finalDetectedEyeState =
        detectedEyeStatus;


    if (

        severity >
        highestDriverSeverity

    ) {

        highestDriverSeverity =
            severity;


        highestDriverState =
            state;


        console.log(

            "SafeRide highest session state:",

            highestDriverState

        );

    }
}


/* =========================================================
   ALERT UI
   ========================================================= */

function showAlertState(
    detectedEyeStatus
) {

    driverStatusCircle.classList.add(
        "status-alert"
    );


    driverStatusBadge.classList.add(
        "status-alert-badge"
    );


    [

        driverStateCard,

        eyeStatusCard,

        riskCard

    ].forEach(

        function (card) {

            card.classList.add(
                "state-safe"
            );

        }

    );


    safetyCard.classList.add(
        "safety-safe"
    );


    driverStatusIcon.className =
        "fa-solid fa-user-check";


    driverStatusTitle.textContent =
        "Driver Alert";


    driverStatusMessage.textContent =
        "Driver appears attentive and responsive.";


    driverStatusBadge.textContent =
        "Driver Status: Alert";


    driverState.textContent =
        "Alert";


    eyeStatus.textContent =
        formatEyeStatus(
            detectedEyeStatus
        );


    drowsinessRisk.textContent =
        "Low";


    safetyTitle.textContent =
        "Safe to Drive";


    safetyMessage.textContent =
        "No significant drowsiness indicators are currently detected.";


    safetyAction.textContent =
        "Continue driving safely and remain attentive.";
}


/* =========================================================
   FATIGUED UI
   ========================================================= */

function showFatiguedState(
    detectedEyeStatus
) {

    driverStatusCircle.classList.add(
        "status-fatigued"
    );


    driverStatusBadge.classList.add(
        "status-fatigued-badge"
    );


    [

        driverStateCard,

        eyeStatusCard,

        riskCard

    ].forEach(

        function (card) {

            card.classList.add(
                "state-warning"
            );

        }

    );


    safetyCard.classList.add(
        "safety-warning"
    );


    driverStatusIcon.className =
        "fa-solid fa-face-tired";


    driverStatusTitle.textContent =
        "Driver Fatigue Detected";


    driverStatusMessage.textContent =
        "Prolonged or repeated eye closure has been detected.";


    driverStatusBadge.textContent =
        "Driver Status: Fatigued";


    driverState.textContent =
        "Fatigued";


    eyeStatus.textContent =
        formatEyeStatus(
            detectedEyeStatus
        );


    drowsinessRisk.textContent =
        "Moderate";


    safetyTitle.textContent =
        "Take a Break Soon";


    safetyMessage.textContent =
        "Fatigue indicators may reduce driver concentration.";


    safetyAction.textContent =
        "Schedule a short rest break before continuing.";


    hideDrowsinessAlert();
}


/* =========================================================
   DROWSY UI
   ========================================================= */

function showDrowsyState(
    detectedEyeStatus
) {

    driverStatusCircle.classList.add(
        "status-drowsy"
    );


    driverStatusBadge.classList.add(
        "status-drowsy-badge"
    );


    [

        driverStateCard,

        eyeStatusCard,

        riskCard

    ].forEach(

        function (card) {

            card.classList.add(
                "state-danger"
            );

        }

    );


    safetyCard.classList.add(
        "safety-danger"
    );


    driverStatusIcon.className =
        "fa-solid fa-triangle-exclamation";


    driverStatusTitle.textContent =
        "Drowsiness Detected";


    driverStatusMessage.textContent =
        "Continuous eye closure indicates severe drowsiness risk.";


    driverStatusBadge.textContent =
        "Driver Status: Drowsy";


    driverState.textContent =
        "Drowsy";


    eyeStatus.textContent =
        formatEyeStatus(
            detectedEyeStatus
        );


    drowsinessRisk.textContent =
        "High";


    safetyTitle.textContent =
        "Immediate Safety Action Required";


    safetyMessage.textContent =
        "The driver may be unsafe to continue driving.";


    safetyAction.textContent =
        "Stop the vehicle safely and take a rest break.";


    showDrowsinessAlert();
}


/* =========================================================
   FORMAT EYE STATUS
   ========================================================= */

function formatEyeStatus(
    detectedEyeStatus
) {

    if (
        detectedEyeStatus ===
        "OPEN"
    ) {

        return "Eyes Open";
    }


    if (
        detectedEyeStatus ===
        "CLOSED"
    ) {

        return "Eyes Closed";
    }


    return "Not Detected";
}


/* =========================================================
   MONITORING TIMER
   ========================================================= */

function startMonitoringTimer() {

    stopMonitoringTimer();


    updateMonitoringTime();


    monitoringTimer =

        window.setInterval(

            updateMonitoringTime,

            1000

        );
}


function stopMonitoringTimer() {

    if (
        monitoringTimer !== null
    ) {

        window.clearInterval(
            monitoringTimer
        );


        monitoringTimer = null;

    }
}


function updateMonitoringTime() {

    if (

        !isMonitoring

        ||

        monitoringStartedAt === null

    ) {

        return;
    }


    const totalSeconds =

        Math.floor(

            (
                Date.now() -
                monitoringStartedAt
            )
            /
            1000

        );


    const minutes =

        Math.floor(

            totalSeconds /
            60

        );


    const seconds =

        totalSeconds %
        60;


    monitoringTime.textContent =

        `${padTime(minutes)}:${padTime(seconds)}`;
}


function padTime(
    value
) {

    return String(value).padStart(
        2,
        "0"
    );
}


/* =========================================================
   STOP MONITORING
   ========================================================= */

function stopMonitoring() {

    const stoppedAt =
        Date.now();


    const sessionStartedAt =
        monitoringStartedAt;


    const finalSessionState =
        highestDriverState;


    const finalSessionEyeState =
        finalDetectedEyeState;


    isMonitoring = false;


    if (
        animationFrameId !== null
    ) {

        window.cancelAnimationFrame(
            animationFrameId
        );


        animationFrameId = null;

    }


    stopMonitoringTimer();


    if (

        sessionStartedAt !== null

        &&

        finalSessionState !== null

    ) {

        saveSafeRideReport(

            finalSessionState,

            finalSessionEyeState,

            sessionStartedAt,

            stoppedAt

        );

    }

    else {

        console.log(
            "SafeRide report not saved because no valid driver state was detected."
        );

    }


    stopCameraTracks();


    driverVideo.pause();


    driverVideo.srcObject = null;


    clearDetectionCanvas();


    stopWarningSystems();


    resetDetectionTracking();


    resetSessionReportTracking();


    resetMonitoringUI();


    aiStatusText.textContent =
        "DRIVER AI READY";


    console.log(
        "SafeRide AI monitoring stopped."
    );
}


/* =========================================================
   SAVE SAFERIDE REPORT
   ========================================================= */

function saveSafeRideReport(
    state,
    detectedEyeStatus,
    startedAt,
    stoppedAt
) {

    const reportState =

        getSafeRideReportState(
            state
        );


    const durationMilliseconds =

        Math.max(

            0,

            stoppedAt -
            startedAt

        );


    const totalSeconds =

        Math.floor(

            durationMilliseconds /
            1000

        );


    const minutes =

        Math.floor(

            totalSeconds /
            60

        );


    const seconds =

        totalSeconds %
        60;


    const formattedDuration =

        `${padTime(minutes)}:${padTime(seconds)}`;


    const reportDate =

        new Date(
            stoppedAt
        );


    const report = {

        id:
            "saferide-"
            +
            stoppedAt,

        module:
            "SafeRide AI",

        moduleKey:
            "saferide",

        driverState:
            reportState.driverState,

        state:
            reportState.driverState,

        status:
            reportState.status,

        risk:
            reportState.risk,

        safetyRisk:
            reportState.risk,

        eyeStatus:
            formatEyeStatus(
                detectedEyeStatus
            ),

        monitoringDuration:
            formattedDuration,

        duration:
            formattedDuration,

        durationSeconds:
            totalSeconds,

        recommendedAction:
            reportState.recommendedAction,

        action:
            reportState.recommendedAction,

        recommendationTitle:
            reportState.recommendationTitle,

        recommendationText:
            reportState.recommendationText,

        message:
            reportState.message,

        analysisDate:
            reportDate.toISOString(),

        timestamp:
            reportDate.getTime()

    };


    try {

        localStorage.setItem(

            "safeRideResult",

            JSON.stringify(
                report
            )

        );


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

            }

            catch (historyError) {

                console.warn(

                    "Unable to parse old analysis history.",

                    historyError

                );


                analysisHistory = [];

            }

        }


        const duplicateReport =

            analysisHistory.some(

                function (existingReport) {

                    return (

                        existingReport.id ===
                        report.id

                    );

                }

            );


        if (!duplicateReport) {

            analysisHistory.unshift(
                report
            );

        }


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
            "SAFERIDE REPORT SAVED"
        );


        console.log(
            "Final session state:",
            state
        );


        console.log(
            "Final report risk:",
            report.risk
        );


        console.log(
            "Monitoring duration:",
            formattedDuration
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

    }

    catch (storageError) {

        console.error(

            "Unable to save SafeRide report:",

            storageError

        );

    }
}


/* =========================================================
   SAFERIDE REPORT MAPPING
   ========================================================= */

function getSafeRideReportState(
    state
) {

    if (
        state === "DROWSY"
    ) {

        return {

            driverState:
                "Drowsy",

            status:
                "Drowsiness Detected",

            risk:
                "High",

            recommendedAction:
                "Stop Vehicle and Rest",

            recommendationTitle:
                "Immediate Safety Action Required",

            recommendationText:
                "Continuous eye closure or severe drowsiness was detected during monitoring.",

            message:
                "The driver may be unsafe to continue driving."

        };

    }


    if (
        state === "FATIGUED"
    ) {

        return {

            driverState:
                "Fatigued",

            status:
                "Driver Fatigued",

            risk:
                "Moderate",

            recommendedAction:
                "Take a Rest Break",

            recommendationTitle:
                "Driver Rest Recommended",

            recommendationText:
                "Prolonged or repeated eye closure was detected during monitoring.",

            message:
                "Fatigue indicators may reduce driver concentration."

        };

    }


    return {

        driverState:
            "Alert",

        status:
            "Driver Alert",

        risk:
            "Low",

        recommendedAction:
            "Continue Driving Safely",

        recommendationTitle:
            "Driver Condition Normal",

        recommendationText:
            "No significant drowsiness indicators were detected during monitoring.",

        message:
            "Driver appears attentive and responsive."

    };
}


/* =========================================================
   RESET SESSION REPORT TRACKING
   ========================================================= */

function resetSessionReportTracking() {

    highestDriverState = null;


    highestDriverSeverity = 0;


    finalDetectedEyeState =
        "NOT_DETECTED";
}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCameraTracks() {

    if (!mediaStream) {

        return;
    }


    mediaStream
        .getTracks()
        .forEach(

            function (track) {

                track.stop();

            }

        );


    mediaStream = null;
}


/* =========================================================
   RESET DETECTION TRACKING
   ========================================================= */

function resetDetectionTracking() {

    eyesClosedStartedAt = null;


    previousEyesClosed = false;


    prolongedClosureEvents = [];


    lastFatigueEventAt = 0;


    lastValidFaceAt = 0;


    currentEyeState =
        "NOT_DETECTED";


    blinkScoreHistory.length = 0;


    alertDismissed = false;


    lastFatigueVoiceAt = 0;


    lastDrowsyVoiceAt = 0;


    lastAlarmAt = 0;


    activeVoiceType = null;
}


function resetEyeClosureTracking() {

    eyesClosedStartedAt = null;


    previousEyesClosed = false;


    currentEyeState =
        "NOT_DETECTED";


    blinkScoreHistory.length = 0;
}


/* =========================================================
   CLEAR CANVAS
   ========================================================= */

function clearDetectionCanvas() {

    if (!detectionCanvas) {

        return;
    }


    const context =

        detectionCanvas.getContext(
            "2d"
        );


    if (context) {

        context.clearRect(

            0,

            0,

            detectionCanvas.width,

            detectionCanvas.height

        );

    }
}


/* =========================================================
   RESET UI
   ========================================================= */

function resetMonitoringUI() {

    currentDriverState =
        "IDLE";


    currentEyeState =
        "NOT_DETECTED";


    monitoringStartedAt = null;


    cameraPlaceholder.classList.remove(
        "hidden"
    );


    driverVideo.classList.add(
        "hidden"
    );


    detectionCanvas.classList.add(
        "hidden"
    );


    liveIndicator.classList.add(
        "hidden"
    );


    faceDetectionIndicator.classList.add(
        "hidden"
    );


    startMonitoringBtn.classList.remove(
        "hidden"
    );


    stopMonitoringBtn.classList.add(
        "hidden"
    );


    clearStates();


    driverStatusCircle.classList.add(
        "status-idle"
    );


    driverStatusBadge.classList.add(
        "status-idle-badge"
    );


    safetyCard.classList.add(
        "safety-idle"
    );


    driverStatusIcon.className =
        "fa-solid fa-user";


    driverStatusTitle.textContent =
        "Monitoring Not Started";


    driverStatusMessage.textContent =
        "Start driver monitoring to check alertness.";


    driverStatusBadge.textContent =
        "Driver Status: Idle";


    driverState.textContent =
        "Idle";


    eyeStatus.textContent =
        "Not Detected";


    drowsinessRisk.textContent =
        "--";


    monitoringTime.textContent =
        "00:00";


    safetyTitle.textContent =
        "SafeRide AI Ready";


    safetyMessage.textContent =
        "Start monitoring to analyze driver alertness.";


    safetyAction.textContent =
        "Camera monitoring is currently inactive.";


    hideDrowsinessAlert();
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

startMonitoringBtn.addEventListener(

    "click",

    startMonitoring

);


stopMonitoringBtn.addEventListener(

    "click",

    stopMonitoring

);


dismissAlertBtn.addEventListener(

    "click",

    dismissDrowsinessAlert

);


/* =========================================================
   SETTINGS CHANGE LISTENER
   ========================================================= */

window.addEventListener(

    "storage",

    function (event) {

        if (
            event.key !==
            SETTINGS_STORAGE_KEY
        ) {

            return;
        }


        const settings =
            getAutoGuardianSettings();


        console.log(
            "AutoGuardian settings updated:",
            settings
        );


        if (!settings.audioAlerts) {

            stopWarningAudio();
        }


        if (!settings.safetyNotifications) {

            hideDrowsinessAlert();
        }

    }

);


/* =========================================================
   PAGE CLOSE CLEANUP
   ========================================================= */

window.addEventListener(

    "beforeunload",

    function () {

        isMonitoring = false;


        if (
            animationFrameId !== null
        ) {

            window.cancelAnimationFrame(
                animationFrameId
            );

        }


        stopMonitoringTimer();


        stopWarningSystems();


        stopCameraTracks();

    }

);


/* =========================================================
   INITIALIZATION
   ========================================================= */

resetMonitoringUI();


resetSessionReportTracking();


initializeDriverAI();


console.log(
    "================================"
);


console.log(
    "SafeRide AI frontend loaded"
);


console.log(
    "Report storage integration ready"
);


console.log(
    "Settings integration ready"
);


console.log(
    "Current settings:",
    getAutoGuardianSettings()
);


console.log(
    "ALERT = Low Risk"
);


console.log(
    "FATIGUED = Moderate Risk"
);


console.log(
    "DROWSY = High Risk"
);


console.log(
    "Highest session risk will be saved"
);


console.log(
    "================================"
);
