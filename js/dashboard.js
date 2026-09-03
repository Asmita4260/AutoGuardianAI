import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   AUTOGUARDIAN AI
   FINAL DASHBOARD
   SYNCHRONIZED WITH REPORTS PAGE
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const userName =
    document.getElementById("userName");

const welcomeText =
    document.getElementById("welcomeText");

const avatar =
    document.querySelector(".avatar");

const logoutBtn =
    document.getElementById("logoutBtn");


const overallScoreElement =
    document.querySelector(".health-score span");


const vehicleHealthValue =
    document.getElementById("vehicleHealthValue");

const vehicleHealthBar =
    document.getElementById("vehicleHealthBar");

const vehicleHealthText =
    document.getElementById("vehicleHealthText");


const tyreHealthValue =
    document.getElementById("tyreHealthValue");

const tyreHealthBar =
    document.getElementById("tyreHealthBar");

const tyreHealthText =
    document.getElementById("tyreHealthText");


const driverStatusValue =
    document.getElementById("driverStatusValue");

const driverStatusBar =
    document.getElementById("driverStatusBar");

const driverStatusText =
    document.getElementById("driverStatusText");


const nextServiceValue =
    document.getElementById("nextServiceValue");

const nextServiceDate =
    document.getElementById("nextServiceDate");

const nextServiceText =
    document.getElementById("nextServiceText");


const alertsList =
    document.querySelector(".alerts-list");

const chartCanvas =
    document.getElementById("healthChart");


const REPORT_STORAGE_KEY =
    "analysisHistory";


let healthChartInstance = null;


/* =========================================================
   USER AUTHENTICATION
   ========================================================= */

onAuthStateChanged(auth, (user) => {

    if (user) {

        const currentUserName =

            user.displayName ||

            user.email.split("@")[0];


        if (userName) {

            userName.textContent =
                currentUserName;
        }


        if (welcomeText) {

            welcomeText.textContent =
                `Welcome ${currentUserName} 👋`;
        }


        if (avatar) {

            avatar.textContent =

                currentUserName
                    .charAt(0)
                    .toUpperCase();
        }


        initializeDashboard();

    } else {

        window.location.href =
            "login.html";
    }

});


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

                alert(
                    "Unable to logout."
                );
            }

        }
    );
}


/* =========================================================
   SAFE JSON PARSER
   ========================================================= */

function safeParse(value) {

    if (!value) {

        return null;
    }


    try {

        return JSON.parse(value);

    } catch (error) {

        console.warn(
            "Unable to parse stored report data.",
            error
        );

        return null;
    }
}


/* =========================================================
   NORMALIZE NUMBER
   ========================================================= */

function normalizeNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;
    }


    if (typeof value === "number") {

        return Number.isFinite(value)
            ? value
            : null;
    }


    const parsed =

        parseFloat(

            String(value)
                .replace("%", "")
                .trim()

        );


    return Number.isFinite(parsed)
        ? parsed
        : null;
}


/* =========================================================
   CLAMP SCORE
   ========================================================= */

function clampScore(value) {

    const number =
        normalizeNumber(value);


    if (number === null) {

        return null;
    }


    return Math.max(
        0,
        Math.min(
            100,
            Math.round(number)
        )
    );
}


/* =========================================================
   GET FIRST VALUE
   ========================================================= */

function getFirstValue(object, keys) {

    if (!object) {

        return null;
    }


    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return object[key];
        }
    }


    return null;
}


/* =========================================================
   NORMALIZE RISK
   ========================================================= */

function normalizeRisk(value) {

    const risk =

        String(value || "")
            .trim()
            .toLowerCase();


    if (risk === "low") {

        return "Low";
    }


    if (
        risk === "moderate" ||
        risk === "medium"
    ) {

        return "Moderate";
    }


    if (
        risk === "high" ||
        risk === "critical"
    ) {

        return "High";
    }


    return null;
}


/* =========================================================
   GET RISK FROM SCORE
   ========================================================= */

function getRiskFromHealth(score) {

    const value =
        clampScore(score);


    if (value === null) {

        return "No Data";
    }


    if (value >= 70) {

        return "Low";
    }


    if (value >= 31) {

        return "Moderate";
    }


    return "High";
}


/* =========================================================
   GET SCORE FROM RISK
   ========================================================= */

function getScoreFromRisk(risk) {

    const normalizedRisk =
        normalizeRisk(risk);


    if (normalizedRisk === "Low") {

        return 90;
    }


    if (normalizedRisk === "Moderate") {

        return 55;
    }


    if (normalizedRisk === "High") {

        return 20;
    }


    return null;
}


/* =========================================================
   GET REPORT DATE
   ========================================================= */

function getReportDateValue(report) {

    return getFirstValue(
        report,
        [
            "analysisDate",
            "date",
            "createdAt",
            "timestamp"
        ]
    );
}


/* =========================================================
   GET ANALYSIS HISTORY
   ========================================================= */

function getAnalysisHistory() {

    const storedHistory =

        safeParse(

            localStorage.getItem(
                REPORT_STORAGE_KEY
            )

        );


    if (!Array.isArray(storedHistory)) {

        return [];
    }


    return storedHistory;
}


/* =========================================================
   DETECT MODULE KEY
   ========================================================= */

function detectModuleKey(report) {

    const moduleKey =

        String(report.moduleKey || "")
            .trim()
            .toLowerCase();


    if (
        moduleKey === "tyrevision" ||
        moduleKey === "tyre"
    ) {

        return "tyrevision";
    }


    if (
        moduleKey === "saferide" ||
        moduleKey === "driver"
    ) {

        return "saferide";
    }


    if (
        moduleKey === "autocare" ||
        moduleKey === "maintenance"
    ) {

        return "autocare";
    }


    const moduleName =

        String(
            report.module ||
            report.type ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        moduleName.includes("tyrevision") ||
        moduleName.includes("tyre") ||
        moduleName.includes("tire")
    ) {

        return "tyrevision";
    }


    if (
        moduleName.includes("saferide") ||
        moduleName.includes("driver")
    ) {

        return "saferide";
    }


    if (
        moduleName.includes("autocare") ||
        moduleName.includes("maintenance")
    ) {

        return "autocare";
    }


    return null;
}


/* =========================================================
   NORMALIZE TYREVISION REPORT
   ========================================================= */

function normalizeTyreReport(report) {

    let score =

        clampScore(

            getFirstValue(
                report,
                [
                    "healthScore",
                    "tyreHealthScore",
                    "score",
                    "health"
                ]
            )

        );


    let risk =

        normalizeRisk(

            getFirstValue(
                report,
                [
                    "risk",
                    "safetyRisk",
                    "riskLevel"
                ]
            )

        );


    if (
        score === null &&
        risk
    ) {

        score =
            getScoreFromRisk(risk);
    }


    if (score === null) {

        return null;
    }


    if (!risk) {

        risk =
            getRiskFromHealth(score);
    }


    let status =

        getFirstValue(
            report,
            [
                "condition",
                "tyreCondition",
                "status",
                "wearClassification"
            ]
        );


    if (!status) {

        if (score >= 70) {

            status =
                "Healthy Condition";

        } else if (score >= 31) {

            status =
                "Visible Wear";

        } else {

            status =
                "Heavily Damaged";
        }
    }


    let action =

        getFirstValue(
            report,
            [
                "recommendedAction",
                "action",
                "recommendation"
            ]
        );


    if (!action) {

        if (risk === "Low") {

            action =
                "Continue Monitoring";

        } else if (risk === "Moderate") {

            action =
                "Schedule Inspection";

        } else {

            action =
                "Stop and Inspect";
        }
    }


    return {

        id:
            report.id ||
            `tyrevision-${getReportDateValue(report) || Date.now()}`,

        module:
            "TyreVision AI",

        moduleKey:
            "tyrevision",

        score,

        status,

        risk,

        action,

        date:
            getReportDateValue(report),

        raw:
            report
    };
}


/* =========================================================
   NORMALIZE SAFERIDE REPORT
   ========================================================= */

function normalizeSafeRideReport(report) {

    const rawState =

        String(

            getFirstValue(
                report,
                [
                    "driverState",
                    "state",
                    "driverStatus",
                    "status"
                ]
            ) || ""

        )
            .trim()
            .toLowerCase();


    let risk =

        normalizeRisk(

            getFirstValue(
                report,
                [
                    "risk",
                    "safetyRisk",
                    "riskLevel"
                ]
            )

        );


    if (!risk) {

        if (
            rawState.includes("drowsy") ||
            rawState.includes("critical") ||
            rawState.includes("danger")
        ) {

            risk = "High";

        } else if (
            rawState.includes("fatigue") ||
            rawState.includes("warning")
        ) {

            risk = "Moderate";

        } else if (
            rawState.includes("alert") ||
            rawState.includes("normal") ||
            rawState.includes("safe")
        ) {

            risk = "Low";
        }
    }


    let score =

        clampScore(

            getFirstValue(
                report,
                [
                    "driverScore",
                    "safetyScore",
                    "healthScore",
                    "score",
                    "alertnessScore"
                ]
            )

        );


    if (
        score === null &&
        risk
    ) {

        score =
            getScoreFromRisk(risk);
    }


    if (score === null) {

        return null;
    }


    if (!risk) {

        risk =
            getRiskFromHealth(score);
    }


    let status =

        getFirstValue(
            report,
            [
                "status",
                "driverStatus",
                "driverState",
                "state",
                "condition"
            ]
        );


    if (!status) {

        if (risk === "Low") {

            status =
                "Driver Alert";

        } else if (risk === "Moderate") {

            status =
                "Driver Fatigued";

        } else {

            status =
                "Drowsiness Detected";
        }
    }


    let action =

        getFirstValue(
            report,
            [
                "recommendedAction",
                "action",
                "recommendation"
            ]
        );


    if (!action) {

        if (risk === "Low") {

            action =
                "Continue Driving Safely";

        } else if (risk === "Moderate") {

            action =
                "Take a Rest Break";

        } else {

            action =
                "Stop Vehicle and Rest";
        }
    }


    return {

        id:
            report.id ||
            `saferide-${getReportDateValue(report) || Date.now()}`,

        module:
            "SafeRide AI",

        moduleKey:
            "saferide",

        score,

        status,

        risk,

        action,

        date:
            getReportDateValue(report),

        raw:
            report
    };
}


/* =========================================================
   NORMALIZE AUTOCARE REPORT
   ========================================================= */

function normalizeAutoCareReport(report) {

    let score =

        clampScore(

            getFirstValue(
                report,
                [
                    "healthScore",
                    "vehicleHealthScore",
                    "maintenanceScore",
                    "score",
                    "vehicleHealth"
                ]
            )

        );


    let risk =

        normalizeRisk(

            getFirstValue(
                report,
                [
                    "risk",
                    "maintenanceRisk",
                    "riskLevel"
                ]
            )

        );


    if (
        score === null &&
        risk
    ) {

        score =
            getScoreFromRisk(risk);
    }


    if (score === null) {

        return null;
    }


    if (!risk) {

        risk =
            getRiskFromHealth(score);
    }


    let status =

        getFirstValue(
            report,
            [
                "status",
                "condition",
                "vehicleCondition",
                "maintenanceStatus"
            ]
        );


    if (!status) {

        if (score >= 70) {

            status =
                "Vehicle Health Good";

        } else if (score >= 31) {

            status =
                "Maintenance Due Soon";

        } else {

            status =
                "Critical Maintenance Required";
        }
    }


    let action =

        getFirstValue(
            report,
            [
                "recommendedAction",
                "action",
                "recommendation"
            ]
        );


    if (!action) {

        if (risk === "Low") {

            action =
                "Continue Monitoring";

        } else if (risk === "Moderate") {

            action =
                "Schedule Service";

        } else {

            action =
                "Immediate Inspection";
        }
    }


    return {

        id:
            report.id ||
            `autocare-${getReportDateValue(report) || Date.now()}`,

        module:
            "AutoCare AI",

        moduleKey:
            "autocare",

        score,

        status,

        risk,

        action,

        date:
            getReportDateValue(report),

        raw:
            report
    };
}


/* =========================================================
   NORMALIZE REPORT
   ========================================================= */

function normalizeReport(report) {

    if (
        !report ||
        typeof report !== "object"
    ) {

        return null;
    }


    const moduleKey =
        detectModuleKey(report);


    if (moduleKey === "tyrevision") {

        return normalizeTyreReport(report);
    }


    if (moduleKey === "saferide") {

        return normalizeSafeRideReport(report);
    }


    if (moduleKey === "autocare") {

        return normalizeAutoCareReport(report);
    }


    return null;
}


/* =========================================================
   REMOVE DUPLICATE REPORTS
   ========================================================= */

function removeDuplicateReports(reports) {

    const uniqueReports = [];

    const seenExactReports =
        new Set();


    reports.forEach(report => {

        const exactKey = [

            report.moduleKey,

            report.score,

            String(report.status || "")
                .trim()
                .toLowerCase(),

            String(report.risk || "")
                .trim()
                .toLowerCase(),

            String(report.action || "")
                .trim()
                .toLowerCase()

        ].join("|");


        if (
            seenExactReports.has(exactKey)
        ) {

            return;
        }


        seenExactReports.add(
            exactKey
        );


        uniqueReports.push(
            report
        );

    });


    return uniqueReports;
}


/* =========================================================
   GET NORMALIZED REPORTS
   ========================================================= */

function getNormalizedReports() {

    const history =
        getAnalysisHistory();


    let reports =

        history
            .map(normalizeReport)
            .filter(Boolean);


    reports.sort(
        (
            firstReport,
            secondReport
        ) => {

            const firstDate =

                new Date(
                    firstReport.date || 0
                ).getTime();


            const secondDate =

                new Date(
                    secondReport.date || 0
                ).getTime();


            return (
                secondDate -
                firstDate
            );
        }
    );


    reports =
        removeDuplicateReports(
            reports
        );


    return reports;
}


/* =========================================================
   GET LATEST MODULE REPORT
   ========================================================= */

function getLatestModuleReport(
    reports,
    moduleKey
) {

    return (

        reports.find(

            report =>
                report.moduleKey ===
                moduleKey

        ) || null

    );
}


/* =========================================================
   CALCULATE OVERALL SCORE
   ========================================================= */

function calculateOverallScore(
    tyreData,
    safeRideData,
    autoCareData
) {

    const scores = [];


    if (
        tyreData &&
        clampScore(tyreData.score) !== null
    ) {

        scores.push(
            clampScore(tyreData.score)
        );
    }


    if (
        safeRideData &&
        clampScore(safeRideData.score) !== null
    ) {

        scores.push(
            clampScore(safeRideData.score)
        );
    }


    if (
        autoCareData &&
        clampScore(autoCareData.score) !== null
    ) {

        scores.push(
            clampScore(autoCareData.score)
        );
    }


    if (scores.length === 0) {

        return null;
    }


    const total =

        scores.reduce(
            (sum, score) =>
                sum + score,
            0
        );


    return Math.round(
        total / scores.length
    );
}


/* =========================================================
   UPDATE OVERALL SCORE
   ========================================================= */

function updateOverallScore(score) {

    if (!overallScoreElement) {

        console.error(
            "Dashboard health score element not found."
        );

        return;
    }


    if (score === null) {

        overallScoreElement.textContent =
            "--";

        return;
    }


    overallScoreElement.textContent =
        `${score}%`;


    const vehicleBanner =

        document.querySelector(
            ".vehicle-banner"
        );


    if (!vehicleBanner) {

        return;
    }


    const bannerTitle =

        vehicleBanner.querySelector(
            "h2"
        );


    const bannerMessage =

        bannerTitle
            ? bannerTitle.nextElementSibling
            : null;


    const risk =
        getRiskFromHealth(score);


    if (risk === "Low") {

        if (bannerTitle) {

            bannerTitle.textContent =
                "Your vehicle is performing well";
        }


        if (bannerMessage) {

            bannerMessage.textContent =
                "AI analysis shows no critical safety issues detected.";
        }

    } else if (risk === "Moderate") {

        if (bannerTitle) {

            bannerTitle.textContent =
                "Your vehicle needs attention";
        }


        if (bannerMessage) {

            bannerMessage.textContent =
                "AI analysis detected conditions that should be inspected soon.";
        }

    } else {

        if (bannerTitle) {

            bannerTitle.textContent =
                "High safety risk detected";
        }


        if (bannerMessage) {

            bannerMessage.textContent =
                "Critical safety conditions require immediate attention.";
        }
    }
}


/* =========================================================
   UPDATE VEHICLE HEALTH CARD
   ========================================================= */

function updateVehicleHealthCard(
    autoCareData
) {

    if (
        !vehicleHealthValue ||
        !vehicleHealthBar ||
        !vehicleHealthText
    ) {

        return;
    }


    if (!autoCareData) {

        vehicleHealthValue.textContent =
            "--";

        vehicleHealthBar.style.width =
            "0%";

        vehicleHealthText.textContent =
            "No analysis available";

        return;
    }


    const score =
        clampScore(
            autoCareData.score
        );


    vehicleHealthValue.textContent =
        score === null
            ? "--"
            : `${score}%`;


    vehicleHealthBar.style.width =
        score === null
            ? "0%"
            : `${score}%`;


    vehicleHealthText.textContent =
        autoCareData.status;
}


/* =========================================================
   UPDATE TYRE HEALTH CARD
   ========================================================= */

function updateTyreHealthCard(
    tyreData
) {

    if (
        !tyreHealthValue ||
        !tyreHealthBar ||
        !tyreHealthText
    ) {

        return;
    }


    if (!tyreData) {

        tyreHealthValue.textContent =
            "--";

        tyreHealthBar.style.width =
            "0%";

        tyreHealthText.textContent =
            "No analysis available";

        return;
    }


    const score =
        clampScore(
            tyreData.score
        );


    tyreHealthValue.textContent =
        score === null
            ? "--"
            : `${score}%`;


    tyreHealthBar.style.width =
        score === null
            ? "0%"
            : `${score}%`;


    tyreHealthText.textContent =
        tyreData.status;
}


/* =========================================================
   UPDATE DRIVER STATUS CARD
   ========================================================= */

function updateDriverStatusCard(
    safeRideData
) {

    if (
        !driverStatusValue ||
        !driverStatusText
    ) {

        return;
    }


    if (!safeRideData) {

        driverStatusValue.textContent =
            "--";


        if (driverStatusBar) {

            driverStatusBar.style.width =
                "0%";
        }


        driverStatusText.textContent =
            "No driver analysis available";

        return;
    }


    driverStatusValue.textContent =
        safeRideData.status;


    if (driverStatusBar) {

        driverStatusBar.style.width =
            `${safeRideData.score}%`;
    }


    driverStatusText.textContent =
        safeRideData.action;
}


/* =========================================================
   UPDATE NEXT SERVICE CARD
   ========================================================= */

function updateNextServiceCard(
    autoCareData
) {

    if (!autoCareData) {

        if (nextServiceValue) {

            nextServiceValue.textContent =
                "--";
        }


        if (nextServiceDate) {

            nextServiceDate.textContent =
                "No service prediction";
        }


        if (nextServiceText) {

            nextServiceText.textContent =
                "Complete AutoCare analysis";
        }


        return;
    }


    const raw =
        autoCareData.raw || {};


    const nextServiceDays =

        getFirstValue(
            raw,
            [
                "nextServiceDays",
                "daysUntilService",
                "serviceDueIn",
                "remainingDays"
            ]
        );


    const serviceDate =

        getFirstValue(
            raw,
            [
                "nextServiceDate",
                "serviceDate",
                "predictedServiceDate"
            ]
        );


    if (nextServiceValue) {

        if (
            nextServiceDays !== null
        ) {

            nextServiceValue.textContent =
                `${nextServiceDays} Days`;

        } else if (
            autoCareData.risk === "High"
        ) {

            nextServiceValue.textContent =
                "Urgent";

        } else if (
            autoCareData.risk === "Moderate"
        ) {

            nextServiceValue.textContent =
                "Due Soon";

        } else {

            nextServiceValue.textContent =
                "Normal";
        }
    }


    if (nextServiceDate) {

        nextServiceDate.textContent =

            serviceDate ||

            "Based on AutoCare AI";
    }


    if (nextServiceText) {

        nextServiceText.textContent =
            autoCareData.action;
    }
}


/* =========================================================
   UPDATE DASHBOARD CARDS
   ========================================================= */

function updateDashboardCards(
    tyreData,
    safeRideData,
    autoCareData
) {

    updateVehicleHealthCard(
        autoCareData
    );


    updateTyreHealthCard(
        tyreData
    );


    updateDriverStatusCard(
        safeRideData
    );


    updateNextServiceCard(
        autoCareData
    );
}


/* =========================================================
   FORMAT ALERT DATE
   ========================================================= */

function formatAlertDate(value) {

    if (!value) {

        return "Recently";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Recently";
    }


    return date.toLocaleString(
        undefined,
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );
}


/* =========================================================
   GET ALERT ICON
   ========================================================= */

function getAlertIcon(moduleKey) {

    if (moduleKey === "tyrevision") {

        return "fa-circle-dot";
    }


    if (moduleKey === "saferide") {

        return "fa-eye";
    }


    if (moduleKey === "autocare") {

        return "fa-screwdriver-wrench";
    }


    return "fa-shield-halved";
}


/* =========================================================
   GET ALERT CLASS
   ========================================================= */

function getAlertClass(risk) {

    if (
        risk === "High" ||
        risk === "Moderate"
    ) {

        return "warning-alert";
    }


    if (risk === "Low") {

        return "success-alert";
    }


    return "info-alert";
}


/* =========================================================
   RENDER RECENT ALERTS
   ========================================================= */

function renderRecentAlerts(
    tyreData,
    safeRideData,
    autoCareData
) {

    if (!alertsList) {

        return;
    }


    alertsList.innerHTML =
        "";


    const latestReports = [

        tyreData,
        safeRideData,
        autoCareData

    ].filter(Boolean);


    if (latestReports.length === 0) {

        alertsList.innerHTML = `

            <div class="alert-item info-alert">

                <div class="alert-icon">

                    <i class="fa-solid fa-circle-info"></i>

                </div>

                <div>

                    <h4>No AI Analysis Available</h4>

                    <p>
                        Complete AutoGuardian AI analysis modules.
                    </p>

                    <small>
                        Waiting for analysis
                    </small>

                </div>

            </div>

        `;


        return;
    }


    latestReports.forEach(
        report => {

            const alertItem =

                document.createElement(
                    "div"
                );


            alertItem.className =

                `alert-item ${getAlertClass(report.risk)}`;


            alertItem.innerHTML = `

                <div class="alert-icon">

                    <i class="fa-solid ${getAlertIcon(report.moduleKey)}"></i>

                </div>

                <div>

                    <h4>
                        ${report.module}
                    </h4>

                    <p>
                        ${report.status}
                    </p>

                    <small>
                        ${formatAlertDate(report.date)}
                    </small>

                </div>

            `;


            alertsList.appendChild(
                alertItem
            );
        }
    );
}


/* =========================================================
   RENDER VEHICLE HEALTH CHART
   ========================================================= */

function renderHealthChart(reports) {

    if (
        !chartCanvas ||
        typeof Chart === "undefined"
    ) {

        return;
    }


    const autoCareReports =

        reports
            .filter(
                report =>
                    report.moduleKey ===
                    "autocare"
            )
            .slice(0, 7)
            .reverse();


    let labels = [];

    let chartData = [];


    if (autoCareReports.length > 0) {

        labels =

            autoCareReports.map(
                report => {

                    const date =

                        new Date(
                            report.date
                        );


                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {

                        return "Analysis";
                    }


                    return date.toLocaleDateString(
                        undefined,
                        {
                            day:
                                "2-digit",

                            month:
                                "short"
                        }
                    );
                }
            );


        chartData =

            autoCareReports.map(
                report =>
                    report.score
            );

    } else {

        labels = [
            "No Analysis"
        ];


        chartData = [
            null
        ];
    }


    if (healthChartInstance) {

        healthChartInstance.destroy();
    }


    const chartContext =
        chartCanvas.getContext("2d");


    healthChartInstance =

        new Chart(
            chartContext,
            {

                type:
                    "line",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Vehicle Health",

                            data:
                                chartData,

                            borderColor:
                                "#2563eb",

                            backgroundColor:
                                "rgba(37, 99, 235, 0.10)",

                            borderWidth:
                                3,

                            fill:
                                true,

                            tension:
                                0.4,

                            pointRadius:
                                4,

                            pointBackgroundColor:
                                "#2563eb"

                        }

                    ]
                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                false
                        }
                    },

                    scales: {

                        y: {

                            min:
                                0,

                            max:
                                100,

                            grid: {

                                color:
                                    "#e2e8f0"
                            }
                        },

                        x: {

                            grid: {

                                display:
                                    false
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   INITIALIZE DASHBOARD
   ========================================================= */

function initializeDashboard() {

    const reports =
        getNormalizedReports();


    const tyreData =

        getLatestModuleReport(
            reports,
            "tyrevision"
        );


    const safeRideData =

        getLatestModuleReport(
            reports,
            "saferide"
        );


    const autoCareData =

        getLatestModuleReport(
            reports,
            "autocare"
        );


    const overallScoreValue =

        calculateOverallScore(
            tyreData,
            safeRideData,
            autoCareData
        );


    console.log(
        "================================"
    );


    console.log(
        "DASHBOARD ANALYSIS HISTORY:",
        getAnalysisHistory()
    );


    console.log(
        "DASHBOARD NORMALIZED REPORTS:",
        reports
    );


    console.log(
        "DASHBOARD TYRE SCORE:",
        tyreData?.score
    );


    console.log(
        "DASHBOARD SAFERIDE SCORE:",
        safeRideData?.score
    );


    console.log(
        "DASHBOARD AUTOCARE SCORE:",
        autoCareData?.score
    );


    console.log(
        "DASHBOARD OVERALL SCORE:",
        overallScoreValue
    );


    console.log(
        "================================"
    );


    updateOverallScore(
        overallScoreValue
    );


    updateDashboardCards(
        tyreData,
        safeRideData,
        autoCareData
    );


    renderHealthChart(
        reports
    );


    renderRecentAlerts(
        tyreData,
        safeRideData,
        autoCareData
    );
}


/* =========================================================
   STORAGE UPDATE
   ========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            REPORT_STORAGE_KEY
        ) {

            initializeDashboard();
        }
    }
);


/* =========================================================
   PAGE SHOW REFRESH
   ========================================================= */

window.addEventListener(
    "pageshow",
    () => {

        initializeDashboard();
    }
);


/* =========================================================
   PAGE VISIBILITY REFRESH
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            initializeDashboard();
        }
    }
);


console.log(
    "AutoGuardian AI Final Dashboard JS Loaded"
);