"use strict";

/* =========================================================
   AUTOCARE AI
   AUTOGUARDIAN AI
   PREDICTIVE VEHICLE MAINTENANCE
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const vehicleModel =
    document.getElementById("vehicleModel");

const currentMileage =
    document.getElementById("currentMileage");

const lastServiceMileage =
    document.getElementById("lastServiceMileage");

const lastServiceDate =
    document.getElementById("lastServiceDate");

const engineTemperature =
    document.getElementById("engineTemperature");

const batteryHealth =
    document.getElementById("batteryHealth");

const brakeWear =
    document.getElementById("brakeWear");

const oilLevel =
    document.getElementById("oilLevel");

const coolantLevel =
    document.getElementById("coolantLevel");

const engineTemperatureValue =
    document.getElementById("engineTemperatureValue");

const batteryHealthValue =
    document.getElementById("batteryHealthValue");

const brakeWearValue =
    document.getElementById("brakeWearValue");

const oilLevelValue =
    document.getElementById("oilLevelValue");

const coolantLevelValue =
    document.getElementById("coolantLevelValue");

const serviceDistanceValue =
    document.getElementById("serviceDistanceValue");

const analyzeVehicleBtn =
    document.getElementById("analyzeVehicleBtn");

const analyzeAgainBtn =
    document.getElementById("analyzeAgainBtn");

const analysisSection =
    document.getElementById("analysisSection");

const analysisStatus =
    document.getElementById("analysisStatus");

const analysisProgress =
    document.getElementById("analysisProgress");

const progressValue =
    document.getElementById("progressValue");

const resultSection =
    document.getElementById("resultSection");

const scoreCircle =
    document.getElementById("scoreCircle");

const vehicleHealthScore =
    document.getElementById("vehicleHealthScore");

const vehicleStatus =
    document.getElementById("vehicleStatus");

const vehicleMessage =
    document.getElementById("vehicleMessage");

const riskBadge =
    document.getElementById("riskBadge");

const engineStatus =
    document.getElementById("engineStatus");

const batteryStatus =
    document.getElementById("batteryStatus");

const brakeStatus =
    document.getElementById("brakeStatus");

const recommendedAction =
    document.getElementById("recommendedAction");

const recommendationTitle =
    document.getElementById("recommendationTitle");

const recommendationText =
    document.getElementById("recommendationText");

const nextServicePrediction =
    document.getElementById("nextServicePrediction");

const engineHealthPercent =
    document.getElementById("engineHealthPercent");

const batteryHealthPercent =
    document.getElementById("batteryHealthPercent");

const brakeHealthPercent =
    document.getElementById("brakeHealthPercent");

const fluidHealthPercent =
    document.getElementById("fluidHealthPercent");

const engineHealthBar =
    document.getElementById("engineHealthBar");

const batteryHealthBar =
    document.getElementById("batteryHealthBar");

const brakeHealthBar =
    document.getElementById("brakeHealthBar");

const fluidHealthBar =
    document.getElementById("fluidHealthBar");


/* =========================================================
   CONFIGURATION
   ========================================================= */

const SERVICE_INTERVAL_KM = 10000;

const ANALYSIS_STEP_DELAY_MS = 550;


/* =========================================================
   CLAMP
   ========================================================= */

function clamp(
    value,
    minimum,
    maximum
) {

    return Math.min(
        maximum,
        Math.max(
            minimum,
            value
        )
    );

}


/* =========================================================
   UPDATE SENSOR DISPLAYS
   ========================================================= */

function updateSensorDisplays() {

    engineTemperatureValue.textContent =
        `${engineTemperature.value}°C`;

    batteryHealthValue.textContent =
        `${batteryHealth.value}%`;

    brakeWearValue.textContent =
        `${brakeWear.value}%`;

    oilLevelValue.textContent =
        `${oilLevel.value}%`;

    coolantLevelValue.textContent =
        `${coolantLevel.value}%`;

    updateServiceDistance();

}


/* =========================================================
   UPDATE SERVICE DISTANCE
   ========================================================= */

function updateServiceDistance() {

    const current =
        Number(
            currentMileage.value
        );

    const lastService =
        Number(
            lastServiceMileage.value
        );

    if (
        !Number.isFinite(current) ||
        !Number.isFinite(lastService) ||
        current < 0 ||
        lastService < 0 ||
        current < lastService
    ) {

        serviceDistanceValue.textContent =
            "0 km";

        return 0;

    }

    const distance =
        current - lastService;

    serviceDistanceValue.textContent =
        `${distance.toLocaleString()} km`;

    return distance;

}


/* =========================================================
   ENGINE HEALTH
   ========================================================= */

function calculateEngineHealth(
    temperature
) {

    if (
        temperature >= 75 &&
        temperature <= 95
    ) {

        return 100;

    }


    if (
        temperature >= 65 &&
        temperature < 75
    ) {

        return clamp(

            80 +
            (
                (
                    temperature - 65
                ) / 10
            ) * 20,

            0,

            100

        );

    }


    if (
        temperature < 65
    ) {

        return clamp(

            80 -
            (
                65 - temperature
            ) * 1.5,

            25,

            80

        );

    }


    if (
        temperature <= 105
    ) {

        return clamp(

            100 -
            (
                temperature - 95
            ) * 4,

            60,

            100

        );

    }


    if (
        temperature <= 115
    ) {

        return clamp(

            60 -
            (
                temperature - 105
            ) * 4,

            20,

            60

        );

    }


    return clamp(

        20 -
        (
            temperature - 115
        ) * 2,

        0,

        20

    );

}


/* =========================================================
   BATTERY HEALTH
   ========================================================= */

function calculateBatteryHealth(
    battery
) {

    return clamp(
        battery,
        0,
        100
    );

}


/* =========================================================
   BRAKE HEALTH
   ========================================================= */

function calculateBrakeHealth(
    wear
) {

    return clamp(

        100 - wear,

        0,

        100

    );

}


/* =========================================================
   FLUID HEALTH
   ========================================================= */

function calculateFluidHealth(
    oil,
    coolant
) {

    return clamp(

        (
            oil * 0.55
        ) +

        (
            coolant * 0.45
        ),

        0,

        100

    );

}


/* =========================================================
   SERVICE HEALTH
   ========================================================= */

function calculateServiceHealth(
    distanceSinceService
) {

    if (
        distanceSinceService <= 5000
    ) {

        return 100;

    }


    if (
        distanceSinceService <= 7500
    ) {

        return clamp(

            100 -
            (
                distanceSinceService - 5000
            ) / 100,

            75,

            100

        );

    }


    if (
        distanceSinceService <= 10000
    ) {

        return clamp(

            75 -
            (
                distanceSinceService - 7500
            ) / 50,

            25,

            75

        );

    }


    return clamp(

        25 -
        (
            distanceSinceService - 10000
        ) / 200,

        0,

        25

    );

}


/* =========================================================
   SERVICE DATE HEALTH
   ========================================================= */

function calculateServiceDateHealth() {

    if (
        !lastServiceDate.value
    ) {

        return 100;

    }


    const serviceDate =
        new Date(
            `${lastServiceDate.value}T00:00:00`
        );


    if (
        Number.isNaN(
            serviceDate.getTime()
        )
    ) {

        return 100;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    if (
        serviceDate > today
    ) {

        return 100;

    }


    const elapsedMilliseconds =

        today.getTime() -
        serviceDate.getTime();


    const daysSinceService =

        elapsedMilliseconds /
        (
            1000 *
            60 *
            60 *
            24
        );


    if (
        daysSinceService <= 180
    ) {

        return 100;

    }


    if (
        daysSinceService <= 365
    ) {

        return clamp(

            100 -
            (
                daysSinceService - 180
            ) * 0.27,

            50,

            100

        );

    }


    return clamp(

        50 -
        (
            daysSinceService - 365
        ) * 0.08,

        0,

        50

    );

}


/* =========================================================
   VEHICLE HEALTH ANALYSIS
   ========================================================= */

function calculateVehicleAnalysis() {

    const temperature =
        Number(
            engineTemperature.value
        );

    const battery =
        Number(
            batteryHealth.value
        );

    const wear =
        Number(
            brakeWear.value
        );

    const oil =
        Number(
            oilLevel.value
        );

    const coolant =
        Number(
            coolantLevel.value
        );

    const distanceSinceService =
        updateServiceDistance();


    const engineHealth =
        calculateEngineHealth(
            temperature
        );


    const calculatedBatteryHealth =
        calculateBatteryHealth(
            battery
        );


    const calculatedBrakeHealth =
        calculateBrakeHealth(
            wear
        );


    const fluidHealth =
        calculateFluidHealth(
            oil,
            coolant
        );


    const serviceHealth =
        calculateServiceHealth(
            distanceSinceService
        );


    const serviceDateHealth =
        calculateServiceDateHealth();


    let healthScore =

        (
            engineHealth * 0.25
        ) +

        (
            calculatedBatteryHealth * 0.15
        ) +

        (
            calculatedBrakeHealth * 0.20
        ) +

        (
            fluidHealth * 0.20
        ) +

        (
            serviceHealth * 0.12
        ) +

        (
            serviceDateHealth * 0.08
        );


    /* =====================================================
       ENGINE TEMPERATURE PENALTIES
       ===================================================== */

    if (
        temperature >= 115
    ) {

        healthScore -= 20;

    }

    else if (
        temperature > 100
    ) {

        healthScore -= 8;

    }


    /* =====================================================
       BATTERY PENALTIES
       ===================================================== */

    if (
        battery <= 25
    ) {

        healthScore -= 12;

    }

    else if (
        battery <= 60
    ) {

        healthScore -= 5;

    }


    /* =====================================================
       BRAKE WEAR PENALTIES
       ===================================================== */

    if (
        wear >= 71
    ) {

        healthScore -= 18;

    }

    else if (
        wear >= 51
    ) {

        healthScore -= 10;

    }

    else if (
        wear >= 31
    ) {

        healthScore -= 5;

    }


    /* =====================================================
       OIL PENALTIES
       ===================================================== */

    if (
        oil <= 20
    ) {

        healthScore -= 14;

    }

    else if (
        oil <= 45
    ) {

        healthScore -= 6;

    }


    /* =====================================================
       COOLANT PENALTIES
       ===================================================== */

    if (
        coolant <= 20
    ) {

        healthScore -= 14;

    }

    else if (
        coolant <= 45
    ) {

        healthScore -= 6;

    }


    /* =====================================================
       SERVICE PENALTY
       ===================================================== */

    if (
        distanceSinceService >=
        SERVICE_INTERVAL_KM
    ) {

        healthScore -= 8;

    }


    /* =====================================================
       CRITICAL SAFETY OVERRIDES
       ===================================================== */

    if (
        temperature >= 115 ||
        battery <= 25 ||
        wear >= 71 ||
        oil <= 20 ||
        coolant <= 20
    ) {

        healthScore =
            Math.min(
                healthScore,
                30
            );

    }


    /* =====================================================
       MODERATE SAFETY OVERRIDES

       IMPORTANT:
       ONE MODERATE PARAMETER PREVENTS HEALTHY RESULT.
       ===================================================== */

    else if (
        temperature > 100 ||
        battery <= 60 ||
        wear >= 31 ||
        oil <= 45 ||
        coolant <= 45 ||
        distanceSinceService >=
            SERVICE_INTERVAL_KM
    ) {

        healthScore =
            Math.min(
                healthScore,
                69
            );

    }


    healthScore =
        Math.round(

            clamp(
                healthScore,
                0,
                100
            )

        );


    return {

        healthScore,

        engineHealth:
            Math.round(
                engineHealth
            ),

        batteryHealth:
            Math.round(
                calculatedBatteryHealth
            ),

        brakeHealth:
            Math.round(
                calculatedBrakeHealth
            ),

        fluidHealth:
            Math.round(
                fluidHealth
            ),

        serviceHealth:
            Math.round(
                serviceHealth
            ),

        serviceDateHealth:
            Math.round(
                serviceDateHealth
            ),

        temperature,

        battery,

        wear,

        oil,

        coolant,

        distanceSinceService

    };

}


/* =========================================================
   VALIDATE VEHICLE INFORMATION
   ========================================================= */

function validateVehicleInformation() {

    const model =
        vehicleModel.value.trim();


    if (
        !model
    ) {

        alert(
            "Please enter the vehicle model."
        );

        vehicleModel.focus();

        return false;

    }


    if (
        currentMileage.value.trim() === ""
    ) {

        alert(
            "Please enter the current mileage."
        );

        currentMileage.focus();

        return false;

    }


    if (
        lastServiceMileage.value.trim() === ""
    ) {

        alert(
            "Please enter the last service mileage."
        );

        lastServiceMileage.focus();

        return false;

    }


    const current =
        Number(
            currentMileage.value
        );


    const lastService =
        Number(
            lastServiceMileage.value
        );


    if (
        !Number.isFinite(current) ||
        current < 0
    ) {

        alert(
            "Please enter a valid current mileage."
        );

        currentMileage.focus();

        return false;

    }


    if (
        !Number.isFinite(lastService) ||
        lastService < 0
    ) {

        alert(
            "Please enter a valid last service mileage."
        );

        lastServiceMileage.focus();

        return false;

    }


    if (
        lastService > current
    ) {

        alert(
            "Last service mileage cannot be greater than current mileage."
        );

        lastServiceMileage.focus();

        return false;

    }


    if (
        lastServiceDate.value
    ) {

        const serviceDate =
            new Date(
                `${lastServiceDate.value}T00:00:00`
            );


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        if (
            serviceDate > today
        ) {

            alert(
                "Last service date cannot be in the future."
            );

            lastServiceDate.focus();

            return false;

        }

    }


    return true;

}


/* =========================================================
   DELAY
   ========================================================= */

function delay(
    milliseconds
) {

    return new Promise(

        function (
            resolve
        ) {

            window.setTimeout(
                resolve,
                milliseconds
            );

        }

    );

}


/* =========================================================
   RESET ANALYSIS PROGRESS
   ========================================================= */

function resetAnalysisProgress() {

    analysisProgress.style.width =
        "0%";

    progressValue.textContent =
        "0%";

    analysisStatus.textContent =
        "Reading vehicle parameters";

}


/* =========================================================
   START VEHICLE ANALYSIS
   ========================================================= */

async function startVehicleAnalysis() {

    if (
        !validateVehicleInformation()
    ) {

        return;

    }


    analyzeVehicleBtn.disabled =
        true;


    resultSection.classList.add(
        "hidden"
    );


    analysisSection.classList.remove(
        "hidden"
    );


    resetAnalysisProgress();


    analysisSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    const analysisSteps = [

        {

            progress:
                18,

            message:
                "Reading vehicle parameters"

        },

        {

            progress:
                36,

            message:
                "Analyzing engine temperature"

        },

        {

            progress:
                54,

            message:
                "Checking battery and brake health"

        },

        {

            progress:
                72,

            message:
                "Evaluating oil and coolant levels"

        },

        {

            progress:
                88,

            message:
                "Predicting maintenance requirements"

        },

        {

            progress:
                100,

            message:
                "Vehicle health analysis completed"

        }

    ];


    try {

        for (
            const step of analysisSteps
        ) {

            await delay(
                ANALYSIS_STEP_DELAY_MS
            );


            analysisProgress.style.width =
                `${step.progress}%`;


            progressValue.textContent =
                `${step.progress}%`;


            analysisStatus.textContent =
                step.message;

        }


        const analysis =
            calculateVehicleAnalysis();


        await delay(
            350
        );


        analysisSection.classList.add(
            "hidden"
        );


        displayVehicleResult(
            analysis
        );


        saveAutoCareReport(
            analysis
        );

    }

    catch (
        error
    ) {

        console.error(
            "AutoCare analysis failed:",
            error
        );


        analysisSection.classList.add(
            "hidden"
        );


        alert(
            "Unable to complete vehicle analysis."
        );

    }

    finally {

        analyzeVehicleBtn.disabled =
            false;

    }

}


/* =========================================================
   DISPLAY VEHICLE RESULT
   ========================================================= */

function displayVehicleResult(
    analysis
) {

    clearResultState();


    vehicleHealthScore.textContent =
        analysis.healthScore;


    updateScoreCircle(
        analysis.healthScore
    );


    updateComponentHealth(
        analysis
    );


    engineStatus.textContent =
        getEngineStatus(
            analysis.temperature
        );


    batteryStatus.textContent =
        getBatteryStatus(
            analysis.battery
        );


    brakeStatus.textContent =
        getBrakeStatus(
            analysis.wear
        );


    if (
        analysis.healthScore >= 70
    ) {

        displayHealthyResult(
            analysis
        );

    }

    else if (
        analysis.healthScore >= 31
    ) {

        displayModerateResult(
            analysis
        );

    }

    else {

        displayCriticalResult(
            analysis
        );

    }


    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });


    console.log(
        "================================"
    );

    console.log(
        "AUTOCARE AI ANALYSIS"
    );

    console.log(
        analysis
    );

    console.log(
        "FINAL VEHICLE HEALTH:",
        analysis.healthScore
    );

    console.log(
        "================================"
    );

}


/* =========================================================
   AUTOCARE RISK
   ========================================================= */

function getAutoCareRisk(
    healthScore
) {

    if (
        healthScore >= 70
    ) {

        return "Low";

    }


    if (
        healthScore >= 31
    ) {

        return "Moderate";

    }


    return "High";

}


/* =========================================================
   AUTOCARE STATUS
   ========================================================= */

function getAutoCareStatus(
    risk
) {

    if (
        risk === "High"
    ) {

        return "Critical Maintenance Required";

    }


    if (
        risk === "Moderate"
    ) {

        return "Maintenance Due Soon";

    }


    return "Vehicle Health Good";

}


/* =========================================================
   AUTOCARE ACTION
   ========================================================= */

function getAutoCareAction(
    risk
) {

    if (
        risk === "High"
    ) {

        return "Immediate Inspection";

    }


    if (
        risk === "Moderate"
    ) {

        return "Schedule Service";

    }


    return "Continue Monitoring";

}


/* =========================================================
   RECOMMENDATION TITLE
   ========================================================= */

function getAutoCareRecommendationTitle(
    risk
) {

    if (
        risk === "High"
    ) {

        return "Immediate Vehicle Inspection Required";

    }


    if (
        risk === "Moderate"
    ) {

        return "Schedule Vehicle Inspection";

    }


    return "Vehicle Operating Normally";

}


/* =========================================================
   HEALTHY RESULT
   ========================================================= */

function displayHealthyResult(
    analysis
) {

    resultSection.classList.add(
        "low-risk"
    );


    vehicleStatus.textContent =
        "Vehicle Health Good";


    vehicleMessage.textContent =
        "Vehicle parameters are within healthy operating conditions.";


    riskBadge.textContent =
        "Maintenance Risk: Low";


    recommendedAction.textContent =
        "Continue Monitoring";


    recommendationTitle.textContent =
        "Vehicle Operating Normally";


    recommendationText.textContent =
        buildHealthyRecommendation(
            analysis
        );


    nextServicePrediction.textContent =
        getNextServicePrediction(
            analysis.distanceSinceService
        );

}


/* =========================================================
   MODERATE RESULT
   ========================================================= */

function displayModerateResult(
    analysis
) {

    resultSection.classList.add(
        "moderate-risk"
    );


    vehicleStatus.textContent =
        "Maintenance Due Soon";


    vehicleMessage.textContent =
        "AutoCare AI detected maintenance parameters that require attention.";


    riskBadge.textContent =
        "Maintenance Risk: Moderate";


    recommendedAction.textContent =
        "Schedule Service";


    recommendationTitle.textContent =
        "Schedule Vehicle Inspection";


    recommendationText.textContent =
        buildMaintenanceRecommendation(
            analysis,
            false
        );


    nextServicePrediction.textContent =
        getNextServicePrediction(
            analysis.distanceSinceService
        );

}


/* =========================================================
   CRITICAL RESULT
   ========================================================= */

function displayCriticalResult(
    analysis
) {

    resultSection.classList.add(
        "high-risk"
    );


    vehicleStatus.textContent =
        "Critical Maintenance Required";


    vehicleMessage.textContent =
        "Critical vehicle health parameters were detected.";


    riskBadge.textContent =
        "Maintenance Risk: High";


    recommendedAction.textContent =
        "Immediate Inspection";


    recommendationTitle.textContent =
        "Immediate Vehicle Inspection Required";


    recommendationText.textContent =
        buildMaintenanceRecommendation(
            analysis,
            true
        );


    nextServicePrediction.textContent =
        "Service Prediction: Immediate inspection recommended.";

}


/* =========================================================
   ENGINE STATUS
   ========================================================= */

function getEngineStatus(
    temperature
) {

    if (
        temperature >= 115
    ) {

        return "Critical";

    }


    if (
        temperature > 100
    ) {

        return "Running Hot";

    }


    if (
        temperature < 65
    ) {

        return "Below Normal";

    }


    return "Normal";

}


/* =========================================================
   BATTERY STATUS
   ========================================================= */

function getBatteryStatus(
    battery
) {

    if (
        battery <= 25
    ) {

        return "Critical";

    }


    if (
        battery <= 60
    ) {

        return "Weak";

    }


    return "Healthy";

}


/* =========================================================
   BRAKE STATUS
   ========================================================= */

function getBrakeStatus(
    wear
) {

    if (
        wear >= 71
    ) {

        return "Critical Wear";

    }


    if (
        wear >= 51
    ) {

        return "High Wear";

    }


    if (
        wear >= 31
    ) {

        return "Moderate Wear";

    }


    return "Good";

}


/* =========================================================
   HEALTHY RECOMMENDATION
   ========================================================= */

function buildHealthyRecommendation(
    analysis
) {

    const observations =
        [];


    if (
        analysis.distanceSinceService >= 7000
    ) {

        observations.push(
            "the regular service interval is approaching"
        );

    }


    if (
        analysis.battery < 75
    ) {

        observations.push(
            "battery health should continue to be monitored"
        );

    }


    if (
        analysis.wear >= 20
    ) {

        observations.push(
            "brake wear should be checked during the next service"
        );

    }


    if (
        observations.length === 0
    ) {

        return (
            "Engine temperature, battery, brakes, and fluid levels " +
            "are currently within healthy operating ranges. " +
            "Continue regular vehicle monitoring."
        );

    }


    return (
        "Overall vehicle health is good. " +
        observations.join(". ") +
        "."
    );

}


/* =========================================================
   MAINTENANCE RECOMMENDATION
   ========================================================= */

function buildMaintenanceRecommendation(
    analysis,
    critical
) {

    const issues =
        [];


    if (
        analysis.temperature >= 115
    ) {

        issues.push(
            "critical engine overheating"
        );

    }

    else if (
        analysis.temperature > 100
    ) {

        issues.push(
            "elevated engine temperature"
        );

    }


    if (
        analysis.battery <= 25
    ) {

        issues.push(
            "critically low battery health"
        );

    }

    else if (
        analysis.battery <= 60
    ) {

        issues.push(
            "reduced battery health"
        );

    }


    if (
        analysis.wear >= 71
    ) {

        issues.push(
            "critical brake wear"
        );

    }

    else if (
        analysis.wear >= 51
    ) {

        issues.push(
            "high brake wear"
        );

    }

    else if (
        analysis.wear >= 31
    ) {

        issues.push(
            "moderate brake wear"
        );

    }


    if (
        analysis.oil <= 20
    ) {

        issues.push(
            "very low engine oil level"
        );

    }

    else if (
        analysis.oil <= 45
    ) {

        issues.push(
            "low engine oil level"
        );

    }


    if (
        analysis.coolant <= 20
    ) {

        issues.push(
            "very low coolant level"
        );

    }

    else if (
        analysis.coolant <= 45
    ) {

        issues.push(
            "low coolant level"
        );

    }


    if (
        analysis.distanceSinceService >=
        SERVICE_INTERVAL_KM
    ) {

        issues.push(
            "service interval exceeded"
        );

    }


    if (
        issues.length === 0
    ) {

        return critical

            ? "The combined vehicle health score indicates a critical maintenance condition. Immediate professional inspection is recommended."

            : "The combined vehicle health score indicates developing maintenance needs. Schedule a vehicle inspection soon.";

    }


    const issueText =
        formatIssueList(
            issues
        );


    if (
        critical
    ) {

        return (
            `AutoCare AI detected ${issueText}. ` +
            "Avoid extended driving and arrange immediate professional inspection."
        );

    }


    return (
        `AutoCare AI detected ${issueText}. ` +
        "Schedule a maintenance inspection before the condition becomes critical."
    );

}


/* =========================================================
   FORMAT ISSUE LIST
   ========================================================= */

function formatIssueList(
    issues
) {

    if (
        issues.length === 1
    ) {

        return issues[0];

    }


    if (
        issues.length === 2
    ) {

        return (
            `${issues[0]} and ${issues[1]}`
        );

    }


    return (
        issues
            .slice(
                0,
                -1
            )
            .join(
                ", "
            )
        +
        `, and ${issues[issues.length - 1]}`
    );

}


/* =========================================================
   NEXT SERVICE PREDICTION
   ========================================================= */

function getNextServicePrediction(
    distanceSinceService
) {

    const remainingDistance =

        SERVICE_INTERVAL_KM -
        distanceSinceService;


    if (
        remainingDistance <= 0
    ) {

        return (
            "Service Prediction: Regular service interval has been reached."
        );

    }


    if (
        remainingDistance <= 1500
    ) {

        return (
            "Service Prediction: Service recommended within " +
            `${remainingDistance.toLocaleString()} km.`
        );

    }


    return (
        "Next Service Prediction: Approximately " +
        `${remainingDistance.toLocaleString()} km remaining.`
    );

}


/* =========================================================
   UPDATE SCORE CIRCLE
   ========================================================= */

function updateScoreCircle(
    score
) {

    let scoreColor;


    if (
        score >= 70
    ) {

        scoreColor =
            "#16a34a";

    }

    else if (
        score >= 31
    ) {

        scoreColor =
            "#f59e0b";

    }

    else {

        scoreColor =
            "#dc2626";

    }


    const scoreAngle =

        (
            score / 100
        ) * 360;


    scoreCircle.style.setProperty(
        "--score-color",
        scoreColor
    );


    scoreCircle.style.setProperty(
        "--score-angle",
        `${scoreAngle}deg`
    );

}


/* =========================================================
   UPDATE COMPONENT HEALTH
   ========================================================= */

function updateComponentHealth(
    analysis
) {

    updateHealthBar(
        engineHealthPercent,
        engineHealthBar,
        analysis.engineHealth
    );


    updateHealthBar(
        batteryHealthPercent,
        batteryHealthBar,
        analysis.batteryHealth
    );


    updateHealthBar(
        brakeHealthPercent,
        brakeHealthBar,
        analysis.brakeHealth
    );


    updateHealthBar(
        fluidHealthPercent,
        fluidHealthBar,
        analysis.fluidHealth
    );

}


/* =========================================================
   UPDATE HEALTH BAR
   ========================================================= */

function updateHealthBar(
    percentElement,
    barElement,
    health
) {

    const safeHealth =
        clamp(
            health,
            0,
            100
        );


    percentElement.textContent =
        `${safeHealth}%`;


    barElement.style.width =
        `${safeHealth}%`;


    if (
        safeHealth >= 70
    ) {

        barElement.style.background =
            "#16a34a";

    }

    else if (
        safeHealth >= 31
    ) {

        barElement.style.background =
            "#f59e0b";

    }

    else {

        barElement.style.background =
            "#dc2626";

    }

}


/* =========================================================
   SAVE AUTOCARE REPORT
   ========================================================= */

function saveAutoCareReport(
    analysis
) {

    const risk =
        getAutoCareRisk(
            analysis.healthScore
        );


    const status =
        getAutoCareStatus(
            risk
        );


    const action =
        getAutoCareAction(
            risk
        );


    const reportDate =
        new Date();


    const reportRecommendationText =

        risk === "Low"

            ? buildHealthyRecommendation(
                analysis
            )

            : buildMaintenanceRecommendation(
                analysis,
                risk === "High"
            );


    const report = {

        id:
            "autocare-" +
            reportDate.getTime(),

        module:
            "AutoCare AI",

        moduleKey:
            "autocare",

        vehicleModel:
            vehicleModel.value.trim(),

        healthScore:
            analysis.healthScore,

        score:
            analysis.healthScore,

        vehicleHealthScore:
            analysis.healthScore,

        status,

        vehicleStatus:
            status,

        risk,

        maintenanceRisk:
            risk,

        safetyRisk:
            risk,

        recommendedAction:
            action,

        action,

        recommendationTitle:
            getAutoCareRecommendationTitle(
                risk
            ),

        recommendationText:
            reportRecommendationText,

        engineStatus:
            getEngineStatus(
                analysis.temperature
            ),

        batteryStatus:
            getBatteryStatus(
                analysis.battery
            ),

        brakeStatus:
            getBrakeStatus(
                analysis.wear
            ),

        engineHealth:
            analysis.engineHealth,

        batteryHealth:
            analysis.batteryHealth,

        brakeHealth:
            analysis.brakeHealth,

        fluidHealth:
            analysis.fluidHealth,

        serviceHealth:
            analysis.serviceHealth,

        serviceDateHealth:
            analysis.serviceDateHealth,

        engineTemperature:
            analysis.temperature,

        battery:
            analysis.battery,

        brakeWear:
            analysis.wear,

        oilLevel:
            analysis.oil,

        coolantLevel:
            analysis.coolant,

        currentMileage:
            Number(
                currentMileage.value
            ),

        lastServiceMileage:
            Number(
                lastServiceMileage.value
            ),

        distanceSinceService:
            analysis.distanceSinceService,

        lastServiceDate:
            lastServiceDate.value || null,

        nextServicePrediction:

            risk === "High"

                ? "Service Prediction: Immediate inspection recommended."

                : getNextServicePrediction(
                    analysis.distanceSinceService
                ),

        analysisDate:
            reportDate.toISOString(),

        timestamp:
            reportDate.getTime()

    };


    try {

        localStorage.setItem(

            "autoCareResult",

            JSON.stringify(
                report
            )

        );


        let analysisHistory =
            [];


        const storedHistory =

            localStorage.getItem(
                "analysisHistory"
            );


        if (
            storedHistory
        ) {

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

            catch (
                historyError
            ) {

                console.warn(
                    "Unable to parse analysis history.",
                    historyError
                );


                analysisHistory =
                    [];

            }

        }


        analysisHistory.unshift(
            report
        );


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
            "AUTOCARE REPORT SAVED",
            report
        );

    }

    catch (
        storageError
    ) {

        console.error(
            "Unable to save AutoCare report:",
            storageError
        );

    }

}


/* =========================================================
   CLEAR RESULT STATE
   ========================================================= */

function clearResultState() {

    resultSection.classList.remove(
        "low-risk",
        "moderate-risk",
        "high-risk"
    );

}


/* =========================================================
   ANALYZE AGAIN
   ========================================================= */

function analyzeAgain() {

    resultSection.classList.add(
        "hidden"
    );


    clearResultState();


    document
        .querySelector(
            ".content-card"
        )
        .scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

engineTemperature.addEventListener(
    "input",
    updateSensorDisplays
);


batteryHealth.addEventListener(
    "input",
    updateSensorDisplays
);


brakeWear.addEventListener(
    "input",
    updateSensorDisplays
);


oilLevel.addEventListener(
    "input",
    updateSensorDisplays
);


coolantLevel.addEventListener(
    "input",
    updateSensorDisplays
);


currentMileage.addEventListener(
    "input",
    updateServiceDistance
);


lastServiceMileage.addEventListener(
    "input",
    updateServiceDistance
);


analyzeVehicleBtn.addEventListener(
    "click",
    startVehicleAnalysis
);


analyzeAgainBtn.addEventListener(
    "click",
    analyzeAgain
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

updateSensorDisplays();

resetAnalysisProgress();


console.log(
    "================================"
);

console.log(
    "AUTOCARE AI UPDATED LOGIC LOADED"
);

console.log(
    "ENGINE > 100°C = MODERATE OVERRIDE"
);

console.log(
    "ENGINE >= 115°C = CRITICAL OVERRIDE"
);

console.log(
    "BATTERY <= 60% = MODERATE OVERRIDE"
);

console.log(
    "BATTERY <= 25% = CRITICAL OVERRIDE"
);

console.log(
    "BRAKE WEAR >= 31% = MODERATE OVERRIDE"
);

console.log(
    "BRAKE WEAR >= 71% = CRITICAL OVERRIDE"
);

console.log(
    "OIL <= 45% = MODERATE OVERRIDE"
);

console.log(
    "OIL <= 20% = CRITICAL OVERRIDE"
);

console.log(
    "COOLANT <= 45% = MODERATE OVERRIDE"
);

console.log(
    "COOLANT <= 20% = CRITICAL OVERRIDE"
);

console.log(
    "================================"
);