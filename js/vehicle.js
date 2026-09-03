const temperatureSlider =
    document.getElementById("temperature");

const batterySlider =
    document.getElementById("battery");

const brakeSlider =
    document.getElementById("brake");

const coolantSlider =
    document.getElementById("coolant");


const temperatureValue =
    document.getElementById("temperatureValue");

const batteryValue =
    document.getElementById("batteryValue");

const brakeValue =
    document.getElementById("brakeValue");

const coolantValue =
    document.getElementById("coolantValue");


const diagnosticBtn =
    document.getElementById("diagnosticBtn");

const analysisLoader =
    document.getElementById("analysisLoader");

const diagnosticResult =
    document.getElementById("diagnosticResult");


const healthScore =
    document.getElementById("healthScore");

const scoreCircle =
    document.getElementById("scoreCircle");

const healthStatus =
    document.getElementById("healthStatus");

const healthMessage =
    document.getElementById("healthMessage");


const predictedIssue =
    document.getElementById("predictedIssue");

const riskLevel =
    document.getElementById("riskLevel");

const recommendedAction =
    document.getElementById("recommendedAction");

const servicePrediction =
    document.getElementById("servicePrediction");

const alertsContainer =
    document.getElementById("alertsContainer");


/* SENSOR SLIDER VALUES */

temperatureSlider.addEventListener("input", function () {

    temperatureValue.textContent =
        temperatureSlider.value + "°C";

});


batterySlider.addEventListener("input", function () {

    batteryValue.textContent =
        batterySlider.value + "%";

});


brakeSlider.addEventListener("input", function () {

    brakeValue.textContent =
        brakeSlider.value + "%";

});


coolantSlider.addEventListener("input", function () {

    coolantValue.textContent =
        coolantSlider.value + "%";

});


/* RUN AI DIAGNOSTIC */

diagnosticBtn.addEventListener("click", function () {

    const vehicleModel =
        document.getElementById("vehicleModel").value.trim();

    const vehicleYear =
        document.getElementById("vehicleYear").value;

    const vehicleKm =
        document.getElementById("vehicleKm").value;


    if (
        vehicleModel === "" ||
        vehicleYear === "" ||
        vehicleKm === ""
    ) {

        alert(
            "Please enter complete vehicle information before running the diagnostic."
        );

        return;

    }


    diagnosticResult.classList.add("hidden");

    analysisLoader.classList.remove("hidden");


    diagnosticBtn.disabled = true;

    diagnosticBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Vehicle';


    setTimeout(function () {

        runVehicleDiagnostic();


        analysisLoader.classList.add("hidden");

        diagnosticResult.classList.remove("hidden");


        diagnosticBtn.disabled = false;

        diagnosticBtn.innerHTML =
            '<i class="fa-solid fa-brain"></i> Run AI Diagnostic';


        diagnosticResult.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 1800);

});


/* AI VEHICLE DIAGNOSTIC ENGINE */

function runVehicleDiagnostic() {

    const temperature =
        Number(temperatureSlider.value);

    const battery =
        Number(batterySlider.value);

    const brake =
        Number(brakeSlider.value);

    const coolant =
        Number(coolantSlider.value);


    let score = 100;

    let highestRisk = 0;

    let issues = [];

    let alerts = [];


    /* ENGINE TEMPERATURE */

    if (temperature >= 115) {

        score -= 35;

        highestRisk = Math.max(highestRisk, 3);

        issues.push("Critical Engine Overheating");

        alerts.push({

            type: "danger",

            message:
                "Critical engine temperature detected. Immediate cooling system inspection is required."

        });

    }
    else if (temperature >= 105) {

        score -= 20;

        highestRisk = Math.max(highestRisk, 2);

        issues.push("Engine Overheating Risk");

        alerts.push({

            type: "warning",

            message:
                "Engine temperature is above the recommended operating range."

        });

    }
    else if (temperature >= 95) {

        score -= 8;

        highestRisk = Math.max(highestRisk, 1);

        alerts.push({

            type: "warning",

            message:
                "Engine temperature is slightly elevated."

        });

    }


    /* BATTERY HEALTH */

    if (battery <= 20) {

        score -= 30;

        highestRisk = Math.max(highestRisk, 3);

        issues.push("Critical Battery Health");

        alerts.push({

            type: "danger",

            message:
                "Battery health is critically low. Battery replacement may be required."

        });

    }
    else if (battery <= 40) {

        score -= 20;

        highestRisk = Math.max(highestRisk, 2);

        issues.push("Battery Degradation");

        alerts.push({

            type: "warning",

            message:
                "Battery degradation detected. Schedule a battery inspection."

        });

    }
    else if (battery <= 60) {

        score -= 8;

        highestRisk = Math.max(highestRisk, 1);

        alerts.push({

            type: "warning",

            message:
                "Battery health is declining. Continue monitoring battery performance."

        });

    }


    /* BRAKE HEALTH */

    if (brake <= 20) {

        score -= 35;

        highestRisk = Math.max(highestRisk, 3);

        issues.push("Critical Brake Wear");

        alerts.push({

            type: "danger",

            message:
                "Critical brake wear detected. Immediate brake inspection is recommended."

        });

    }
    else if (brake <= 40) {

        score -= 25;

        highestRisk = Math.max(highestRisk, 2);

        issues.push("Brake Wear Detected");

        alerts.push({

            type: "warning",

            message:
                "Brake health is low. Brake servicing should be scheduled."

        });

    }
    else if (brake <= 60) {

        score -= 10;

        highestRisk = Math.max(highestRisk, 1);

        alerts.push({

            type: "warning",

            message:
                "Moderate brake wear detected."

        });

    }


    /* COOLANT LEVEL */

    if (coolant <= 20) {

        score -= 30;

        highestRisk = Math.max(highestRisk, 3);

        issues.push("Critical Coolant Level");

        alerts.push({

            type: "danger",

            message:
                "Coolant level is critically low. Engine overheating risk is high."

        });

    }
    else if (coolant <= 40) {

        score -= 20;

        highestRisk = Math.max(highestRisk, 2);

        issues.push("Low Coolant Level");

        alerts.push({

            type: "warning",

            message:
                "Low coolant level detected. Coolant refill and system inspection are recommended."

        });

    }
    else if (coolant <= 60) {

        score -= 8;

        highestRisk = Math.max(highestRisk, 1);

        alerts.push({

            type: "warning",

            message:
                "Coolant level is below the optimal range."

        });

    }


    /* AI CORRELATION ANALYSIS */

    if (
        temperature >= 105 &&
        coolant <= 40
    ) {

        score -= 15;

        highestRisk = Math.max(highestRisk, 3);

        issues.push("Cooling System Failure Risk");

        alerts.push({

            type: "danger",

            message:
                "AI correlation detected high engine temperature with low coolant level. Cooling system failure risk is high."

        });

    }


    if (
        battery <= 40 &&
        brake <= 40
    ) {

        score -= 10;

        highestRisk = Math.max(highestRisk, 2);

        alerts.push({

            type: "warning",

            message:
                "Multiple vehicle component degradation patterns detected."

        });

    }


    /* SCORE LIMIT */

    if (score < 0) {

        score = 0;

    }


    /* HEALTHY VEHICLE */

    if (alerts.length === 0) {

        alerts.push({

            type: "success",

            message:
                "All vehicle parameters are within configured safe operating limits."

        });

    }


    updateDiagnosticResult(

        score,

        highestRisk,

        issues,

        alerts

    );

}


/* UPDATE DIAGNOSTIC RESULT */

function updateDiagnosticResult(

    score,

    highestRisk,

    issues,

    alerts

) {

    healthScore.textContent = score;


    const scoreDegree =
        (score / 100) * 360;


    let scoreColor;


    if (score >= 80) {

        scoreColor = "#16a34a";

    }
    else if (score >= 55) {

        scoreColor = "#f59e0b";

    }
    else {

        scoreColor = "#dc2626";

    }


    scoreCircle.style.background =

        `conic-gradient(
            ${scoreColor} 0deg,
            ${scoreColor} ${scoreDegree}deg,
            #e2e8f0 ${scoreDegree}deg
        )`;


    /* HEALTH STATUS */

    if (score >= 85) {

        healthStatus.textContent =
            "Excellent Vehicle Health";

        healthMessage.textContent =
            "AI analysis indicates that the vehicle is operating within safe parameters.";

    }
    else if (score >= 70) {

        healthStatus.textContent =
            "Good Vehicle Health";

        healthMessage.textContent =
            "Minor vehicle abnormalities were detected. Continue monitoring vehicle health.";

    }
    else if (score >= 50) {

        healthStatus.textContent =
            "Vehicle Attention Required";

        healthMessage.textContent =
            "AI analysis detected abnormal vehicle parameters that may require maintenance.";

    }
    else {

        healthStatus.textContent =
            "Critical Vehicle Risk";

        healthMessage.textContent =
            "Critical vehicle abnormalities were detected. Immediate vehicle inspection is recommended.";

    }


    /* PREDICTED ISSUE */

    if (issues.length === 0) {

        predictedIssue.textContent =
            "No Critical Issue";

    }
    else {

        predictedIssue.textContent =
            issues[0];

    }


    /* RISK LEVEL */

    if (highestRisk === 0) {

        riskLevel.textContent = "Low";

        riskLevel.style.color = "#16a34a";

    }
    else if (highestRisk === 1) {

        riskLevel.textContent = "Moderate";

        riskLevel.style.color = "#f59e0b";

    }
    else if (highestRisk === 2) {

        riskLevel.textContent = "High";

        riskLevel.style.color = "#ea580c";

    }
    else {

        riskLevel.textContent = "Critical";

        riskLevel.style.color = "#dc2626";

    }


    /* RECOMMENDED ACTION */

    if (highestRisk === 0) {

        recommendedAction.textContent =
            "Continue Regular Monitoring";

    }
    else if (highestRisk === 1) {

        recommendedAction.textContent =
            "Monitor Vehicle Parameters";

    }
    else if (highestRisk === 2) {

        recommendedAction.textContent =
            "Schedule Vehicle Inspection";

    }
    else {

        recommendedAction.textContent =
            "Immediate Service Recommended";

    }


    /* SERVICE PREDICTION */

    if (score >= 85) {

        servicePrediction.textContent =
            "Service after 5,000 km";

    }
    else if (score >= 70) {

        servicePrediction.textContent =
            "Inspection within 2,000 km";

    }
    else if (score >= 50) {

        servicePrediction.textContent =
            "Inspection within 500 km";

    }
    else {

        servicePrediction.textContent =
            "Immediate Inspection";

    }


    /* DISPLAY ALERTS */

    alertsContainer.innerHTML = "";


    alerts.forEach(function (alert) {

        const alertElement =
            document.createElement("div");


        alertElement.classList.add(

            "diagnostic-alert",

            "alert-" + alert.type

        );


        let icon;


        if (alert.type === "success") {

            icon = "fa-circle-check";

        }
        else if (alert.type === "warning") {

            icon = "fa-triangle-exclamation";

        }
        else {

            icon = "fa-circle-exclamation";

        }


        alertElement.innerHTML =

            `<i class="fa-solid ${icon}"></i>
             ${alert.message}`;


        alertsContainer.appendChild(
            alertElement
        );

    });

}