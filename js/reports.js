/* =========================================================
   AUTOGUARDIAN AI
   FINAL REPORTS PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("AutoGuardian Reports JS loaded");

    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const summaryCard =
        document.querySelector(".summary-card");

    const overallScoreCircle =
        document.getElementById("overallScoreCircle");

    const overallScore =
        document.getElementById("overallScore");

    const overallStatus =
        document.getElementById("overallStatus");

    const overallMessage =
        document.getElementById("overallMessage");

    const overallRiskBadge =
        document.getElementById("overallRiskBadge");


    const vehicleHealthValue =
        document.getElementById("vehicleHealthValue");

    const vehicleHealthBar =
        document.getElementById("vehicleHealthBar");

    const vehicleModuleBadge =
        document.getElementById("vehicleModuleBadge");

    const vehicleHealthText =
        document.getElementById("vehicleHealthText");


    const tyreHealthValue =
        document.getElementById("tyreHealthValue");

    const tyreHealthBar =
        document.getElementById("tyreHealthBar");

    const tyreModuleBadge =
        document.getElementById("tyreModuleBadge");

    const tyreHealthText =
        document.getElementById("tyreHealthText");


    const driverStatusValue =
        document.getElementById("driverStatusValue");

    const driverStatusBar =
        document.getElementById("driverStatusBar");

    const driverModuleBadge =
        document.getElementById("driverModuleBadge");

    const driverStatusText =
        document.getElementById("driverStatusText");


    const maintenanceRiskValue =
        document.getElementById("maintenanceRiskValue");

    const maintenanceRiskBar =
        document.getElementById("maintenanceRiskBar");

    const maintenanceModuleBadge =
        document.getElementById("maintenanceModuleBadge");

    const maintenanceRiskText =
        document.getElementById("maintenanceRiskText");


    const reportTableBody =
        document.getElementById("reportTableBody");

    const emptyReportState =
        document.getElementById("emptyReportState");

    const moduleFilter =
        document.getElementById("moduleFilter");

    const downloadReportBtn =
        document.getElementById("downloadReportBtn");


    const safetyInsightTitle =
        document.getElementById("safetyInsightTitle");

    const safetyInsightText =
        document.getElementById("safetyInsightText");


    /* =====================================================
       STORAGE
       ===================================================== */

    const REPORT_STORAGE_KEY = "analysisHistory";


    /* =====================================================
       SAFE JSON PARSER
       ===================================================== */

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


    /* =====================================================
       NORMALIZE NUMBER
       ===================================================== */

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

        const parsed = parseFloat(
            String(value)
                .replace("%", "")
                .trim()
        );

        return Number.isFinite(parsed)
            ? parsed
            : null;
    }


    /* =====================================================
       CLAMP SCORE
       ===================================================== */

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


    /* =====================================================
       GET FIRST VALUE
       ===================================================== */

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


    /* =====================================================
       NORMALIZE RISK
       ===================================================== */

    function normalizeRisk(value) {

        const risk = String(value || "")
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


    /* =====================================================
       RISK FROM HEALTH SCORE
       ===================================================== */

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


    /* =====================================================
       SCORE FROM RISK
       ===================================================== */

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


    /* =====================================================
       STATUS CLASS
       ===================================================== */

    function getStatusClass(risk) {

        const normalizedRisk =
            normalizeRisk(risk);

        if (normalizedRisk === "Low") {
            return "status-low";
        }

        if (normalizedRisk === "Moderate") {
            return "status-moderate";
        }

        if (normalizedRisk === "High") {
            return "status-high";
        }

        return "";
    }


    /* =====================================================
       RISK CLASS
       ===================================================== */

    function getRiskClass(risk) {

        const normalizedRisk =
            normalizeRisk(risk);

        if (normalizedRisk === "Low") {
            return "risk-low";
        }

        if (normalizedRisk === "Moderate") {
            return "risk-moderate";
        }

        if (normalizedRisk === "High") {
            return "risk-high";
        }

        return "";
    }


    /* =====================================================
       REPORT DATE VALUE
       ===================================================== */

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


    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "--";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return date.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    }


    /* =====================================================
       GET ANALYSIS HISTORY
       ===================================================== */

    function getAnalysisHistory() {

        const storedHistory =
            safeParse(
                localStorage.getItem(
                    REPORT_STORAGE_KEY
                )
            );

        if (
            !Array.isArray(storedHistory)
        ) {
            return [];
        }

        return storedHistory;
    }


    /* =====================================================
       DETECT MODULE KEY
       ===================================================== */

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
            String(report.module || "")
                .trim()
                .toLowerCase();

        if (
            moduleName.includes("tyrevision") ||
            moduleName.includes("tyre")
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


    /* =====================================================
       TYREVISION NORMALIZER
       ===================================================== */

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


    /* =====================================================
       SAFERIDE NORMALIZER
       ===================================================== */

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


    /* =====================================================
       AUTOCARE NORMALIZER
       ===================================================== */

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


    /* =====================================================
       NORMALIZE REPORT
       ===================================================== */

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

            return normalizeTyreReport(
                report
            );
        }

        if (moduleKey === "saferide") {

            return normalizeSafeRideReport(
                report
            );
        }

        if (moduleKey === "autocare") {

            return normalizeAutoCareReport(
                report
            );
        }

        return null;
    }


    /* =====================================================
       REMOVE DUPLICATE REPORTS
       ===================================================== */

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

                console.log(
                    "Duplicate report hidden:",
                    report
                );

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


    /* =====================================================
       NORMALIZE ALL REPORTS
       ===================================================== */

    function getNormalizedReports() {

        const history =
            getAnalysisHistory();

        let reports =
            history
                .map(normalizeReport)
                .filter(Boolean);

        reports.sort(
            (firstReport, secondReport) => {

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


    /* =====================================================
       GET LATEST MODULE REPORT
       ===================================================== */

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


    /* =====================================================
       UPDATE STANDARD SCORE CARD
       ===================================================== */

    function updateModuleCard({

        data,

        valueElement,

        barElement,

        badgeElement,

        textElement

    }) {

        if (
            !valueElement ||
            !barElement ||
            !badgeElement ||
            !textElement
        ) {
            return;
        }

        const card =
            valueElement.closest(
                ".module-summary-card"
            );

        if (card) {

            card.classList.remove(
                "status-low",
                "status-moderate",
                "status-high"
            );
        }

        if (!data) {

            valueElement.textContent =
                "--";

            barElement.style.width =
                "0%";

            badgeElement.textContent =
                "No Data";

            return;
        }

        const score =
            clampScore(data.score);

        valueElement.textContent =
            score === null
                ? "--"
                : `${score}/100`;

        barElement.style.width =
            score === null
                ? "0%"
                : `${score}%`;

        badgeElement.textContent =
            data.risk;

        textElement.textContent =
            data.status;

        const statusClass =
            getStatusClass(
                data.risk
            );

        if (
            card &&
            statusClass
        ) {

            card.classList.add(
                statusClass
            );
        }
    }


    /* =====================================================
       UPDATE MAINTENANCE RISK CARD
       ===================================================== */

    function updateMaintenanceRiskCard(
        autoCareData
    ) {

        if (
            !maintenanceRiskValue ||
            !maintenanceRiskBar ||
            !maintenanceModuleBadge ||
            !maintenanceRiskText
        ) {
            return;
        }

        const card =
            maintenanceRiskValue.closest(
                ".module-summary-card"
            );

        if (card) {

            card.classList.remove(
                "status-low",
                "status-moderate",
                "status-high"
            );
        }

        if (!autoCareData) {

            maintenanceRiskValue.textContent =
                "--";

            maintenanceRiskBar.style.width =
                "0%";

            maintenanceModuleBadge.textContent =
                "No Data";

            maintenanceRiskText.textContent =
                "Complete AutoCare AI analysis";

            return;
        }

        const risk =
            normalizeRisk(
                autoCareData.risk
            ) || "No Data";

        maintenanceRiskValue.textContent =
            risk;

        let riskLevel = 0;

        if (risk === "Low") {

            riskLevel = 25;

        } else if (
            risk === "Moderate"
        ) {

            riskLevel = 60;

        } else if (
            risk === "High"
        ) {

            riskLevel = 100;
        }

        maintenanceRiskBar.style.width =
            `${riskLevel}%`;

        maintenanceModuleBadge.textContent =
            risk;

        maintenanceRiskText.textContent =
            autoCareData.action;

        const statusClass =
            getStatusClass(risk);

        if (
            card &&
            statusClass
        ) {

            card.classList.add(
                statusClass
            );
        }
    }


    /* =====================================================
       UPDATE MODULE CARDS
       ===================================================== */

    function updateModuleCards(
        tyreData,
        safeRideData,
        autoCareData
    ) {

        updateModuleCard({

            data:
                autoCareData,

            valueElement:
                vehicleHealthValue,

            barElement:
                vehicleHealthBar,

            badgeElement:
                vehicleModuleBadge,

            textElement:
                vehicleHealthText
        });


        updateModuleCard({

            data:
                tyreData,

            valueElement:
                tyreHealthValue,

            barElement:
                tyreHealthBar,

            badgeElement:
                tyreModuleBadge,

            textElement:
                tyreHealthText
        });


        updateModuleCard({

            data:
                safeRideData,

            valueElement:
                driverStatusValue,

            barElement:
                driverStatusBar,

            badgeElement:
                driverModuleBadge,

            textElement:
                driverStatusText
        });


        updateMaintenanceRiskCard(
            autoCareData
        );
    }


    /* =====================================================
       CALCULATE OVERALL SAFETY SCORE
       ===================================================== */

    function calculateOverallScore(
        tyreData,
        safeRideData,
        autoCareData
    ) {

        const scores = [];

        if (
            tyreData &&
            clampScore(
                tyreData.score
            ) !== null
        ) {

            scores.push(
                clampScore(
                    tyreData.score
                )
            );
        }

        if (
            safeRideData &&
            clampScore(
                safeRideData.score
            ) !== null
        ) {

            scores.push(
                clampScore(
                    safeRideData.score
                )
            );
        }

        if (
            autoCareData &&
            clampScore(
                autoCareData.score
            ) !== null
        ) {

            scores.push(
                clampScore(
                    autoCareData.score
                )
            );
        }

        if (
            scores.length === 0
        ) {
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


    /* =====================================================
       UPDATE OVERALL SUMMARY
       ===================================================== */

    function updateOverallSummary(score) {

        if (!summaryCard) {
            return;
        }

        summaryCard.classList.remove(
            "status-low",
            "status-moderate",
            "status-high"
        );

        if (score === null) {

            overallScore.textContent =
                "--";

            overallScoreCircle.style.setProperty(
                "--score-degree",
                "0deg"
            );

            overallStatus.textContent =
                "No Analysis Available";

            overallMessage.textContent =
                "Complete AutoGuardian AI analysis modules to generate your vehicle safety summary.";

            overallRiskBadge.textContent =
                "Safety Risk: --";

            return;
        }

        const risk =
            getRiskFromHealth(score);

        overallScore.textContent =
            score;

        const degree =
            score * 3.6;

        overallScoreCircle.style.setProperty(
            "--score-degree",
            `${degree}deg`
        );

        if (risk === "Low") {

            overallStatus.textContent =
                "Vehicle Safety Looks Good";

            overallMessage.textContent =
                "AutoGuardian AI detected an overall healthy vehicle safety condition. Continue regular monitoring.";

        } else if (
            risk === "Moderate"
        ) {

            overallStatus.textContent =
                "Vehicle Needs Attention";

            overallMessage.textContent =
                "One or more AutoGuardian AI modules detected conditions that should be inspected soon.";

        } else {

            overallStatus.textContent =
                "High Safety Risk Detected";

            overallMessage.textContent =
                "Critical safety conditions were detected. Inspect the vehicle and resolve high-risk issues before continuing normal use.";
        }

        overallRiskBadge.textContent =
            `Safety Risk: ${risk}`;

        const statusClass =
            getStatusClass(risk);

        if (statusClass) {

            summaryCard.classList.add(
                statusClass
            );
        }
    }


    /* =====================================================
       GET MODULE ICON
       ===================================================== */

    function getModuleIcon(module) {

        if (
            module === "TyreVision AI"
        ) {
            return "fa-circle-dot";
        }

        if (
            module === "SafeRide AI"
        ) {
            return "fa-eye";
        }

        if (
            module === "AutoCare AI"
        ) {
            return "fa-screwdriver-wrench";
        }

        return "fa-chart-line";
    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       RENDER REPORT HISTORY
       ===================================================== */

    function renderReports(
        reports,
        selectedModule = "all"
    ) {

        if (
            !reportTableBody ||
            !emptyReportState
        ) {
            return;
        }

        reportTableBody.innerHTML =
            "";

        const filteredReports =
            selectedModule === "all"
                ? reports
                : reports.filter(
                    report =>
                        report.module ===
                        selectedModule
                );

        if (
            filteredReports.length === 0
        ) {

            emptyReportState.style.display =
                "flex";

            return;
        }

        emptyReportState.style.display =
            "none";

        filteredReports.forEach(
            report => {

                const row =
                    document.createElement(
                        "tr"
                    );

                const riskClass =
                    getRiskClass(
                        report.risk
                    );

                const icon =
                    getModuleIcon(
                        report.module
                    );

                row.innerHTML = `

                    <td>
                        <div class="report-module">

                            <div class="report-module-icon">
                                <i class="fa-solid ${icon}"></i>
                            </div>

                            ${escapeHtml(report.module)}

                        </div>
                    </td>

                    <td>
                        ${escapeHtml(
                            formatDate(
                                report.date
                            )
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                report.score
                            )}/100
                        </strong>

                        <br>

                        <small>
                            ${escapeHtml(
                                report.status
                            )}
                        </small>
                    </td>

                    <td>
                        <span class="risk-pill ${riskClass}">
                            ${escapeHtml(
                                report.risk
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHtml(
                            report.action
                        )}
                    </td>

                    <td>
                        <button
                            type="button"
                            class="view-report-btn"
                            data-report-id="${escapeHtml(
                                report.id
                            )}"
                        >
                            View Report
                        </button>
                    </td>
                `;

                reportTableBody.appendChild(
                    row
                );
            }
        );

        attachViewReportEvents(
            reports
        );
    }


    /* =====================================================
       VIEW REPORT EVENTS
       ===================================================== */

    function attachViewReportEvents(
        reports
    ) {

        const buttons =
            document.querySelectorAll(
                ".view-report-btn"
            );

        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const reportId =
                            button.dataset.reportId;

                        const report =
                            reports.find(
                                item =>
                                    String(item.id) ===
                                    String(reportId)
                            );

                        if (!report) {
                            return;
                        }

                        showReportDetails(
                            report
                        );
                    }
                );
            }
        );
    }


    /* =====================================================
       SHOW REPORT DETAILS
       ===================================================== */

    function showReportDetails(report) {

        let details =
            "AUTOGUARDIAN AI REPORT\n\n" +

            `Module: ${report.module}\n` +

            `Analysis Date: ${formatDate(
                report.date
            )}\n` +

            `Health / Safety Score: ${report.score}/100\n` +

            `Condition: ${report.status}\n` +

            `Risk Level: ${report.risk}\n` +

            `Recommended Action: ${report.action}`;

        if (
            report.moduleKey === "saferide"
        ) {

            const duration =
                getFirstValue(
                    report.raw,
                    [
                        "monitoringDuration",
                        "duration"
                    ]
                );

            const eyeStatus =
                getFirstValue(
                    report.raw,
                    [
                        "eyeStatus"
                    ]
                );

            if (duration) {

                details +=
                    `\nMonitoring Duration: ${duration}`;
            }

            if (eyeStatus) {

                details +=
                    `\nEye Status: ${eyeStatus}`;
            }
        }

        alert(details);
    }


    /* =====================================================
       UPDATE AI SAFETY INSIGHT
       ===================================================== */

    function updateSafetyInsight(
        tyreData,
        safeRideData,
        autoCareData,
        overallScoreValue
    ) {

        if (
            !safetyInsightTitle ||
            !safetyInsightText
        ) {
            return;
        }

        if (
            overallScoreValue === null
        ) {

            safetyInsightTitle.textContent =
                "Complete Vehicle Analysis";

            safetyInsightText.textContent =
                "AutoGuardian AI combines tyre condition, driver monitoring and predictive maintenance results to provide a unified vehicle safety view.";

            return;
        }

        const criticalModules = [];

        if (
            tyreData &&
            tyreData.risk === "High"
        ) {

            criticalModules.push(
                "tyre condition"
            );
        }

        if (
            safeRideData &&
            safeRideData.risk === "High"
        ) {

            criticalModules.push(
                "driver safety"
            );
        }

        if (
            autoCareData &&
            autoCareData.risk === "High"
        ) {

            criticalModules.push(
                "vehicle maintenance"
            );
        }

        if (
            criticalModules.length > 0
        ) {

            safetyInsightTitle.textContent =
                "Immediate Safety Attention Required";

            safetyInsightText.textContent =
                `AutoGuardian AI detected high-risk conditions in ${criticalModules.join(
                    ", "
                )}. Resolve these safety issues before normal vehicle operation.`;

            return;
        }

        if (
            overallScoreValue >= 70
        ) {

            safetyInsightTitle.textContent =
                "Vehicle Safety Condition Looks Good";

            safetyInsightText.textContent =
                "Current AutoGuardian AI results indicate a healthy overall safety condition. Continue regular tyre checks, driver monitoring and scheduled vehicle maintenance.";

            return;
        }

        safetyInsightTitle.textContent =
            "Preventive Inspection Recommended";

        safetyInsightText.textContent =
            "AutoGuardian AI detected moderate safety indicators. Review module recommendations and schedule preventive inspection where required.";
    }


    /* =====================================================
       DOWNLOAD REPORT
       ===================================================== */

    function downloadReports(
        reports,
        overallScoreValue
    ) {

        if (
            reports.length === 0
        ) {

            alert(
                "No AutoGuardian AI reports are available to download."
            );

            return;
        }

        const overallRisk =
            overallScoreValue === null
                ? "No Data"
                : getRiskFromHealth(
                    overallScoreValue
                );

        let reportContent =
            "AUTOGUARDIAN AI\n" +
            "VEHICLE SAFETY REPORT\n" +
            "========================================\n\n" +

            `Generated: ${new Date().toLocaleString()}\n` +

            `Overall Safety Score: ${
                overallScoreValue === null
                    ? "--"
                    : overallScoreValue + "/100"
            }\n` +

            `Overall Safety Risk: ${overallRisk}\n\n` +

            "ANALYSIS HISTORY\n" +
            "========================================\n\n";

        reports.forEach(
            (report, index) => {

                reportContent +=
                    `REPORT ${index + 1}\n` +

                    `Module: ${report.module}\n` +

                    `Analysis Date: ${formatDate(
                        report.date
                    )}\n` +

                    `Score: ${report.score}/100\n` +

                    `Condition: ${report.status}\n` +

                    `Risk Level: ${report.risk}\n` +

                    `Recommended Action: ${report.action}\n`;

                if (
                    report.moduleKey === "saferide"
                ) {

                    const duration =
                        getFirstValue(
                            report.raw,
                            [
                                "monitoringDuration",
                                "duration"
                            ]
                        );

                    const eyeStatus =
                        getFirstValue(
                            report.raw,
                            [
                                "eyeStatus"
                            ]
                        );

                    if (duration) {

                        reportContent +=
                            `Monitoring Duration: ${duration}\n`;
                    }

                    if (eyeStatus) {

                        reportContent +=
                            `Eye Status: ${eyeStatus}\n`;
                    }
                }

                reportContent +=
                    "----------------------------------------\n\n";
            }
        );

        reportContent +=
            "AUTOGUARDIAN AI SAFETY NOTICE\n" +

            "This report provides prototype AI-based vehicle safety insights. Critical vehicle conditions should be inspected by a qualified automotive professional.\n";

        const blob =
            new Blob(
                [reportContent],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );

        const downloadUrl =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            downloadUrl;

        link.download =
            `AutoGuardian-AI-Report-${Date.now()}.txt`;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            downloadUrl
        );
    }


    /* =====================================================
       INITIALIZE REPORTS PAGE
       ===================================================== */

    function initializeReportsPage() {

        const reports =
            getNormalizedReports();

        console.log(
            "Shared analysis history:",
            getAnalysisHistory()
        );

        console.log(
            "Final unique reports:",
            reports
        );

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

        console.log(
            "Latest TyreVision:",
            tyreData
        );

        console.log(
            "Latest SafeRide:",
            safeRideData
        );

        console.log(
            "Latest AutoCare:",
            autoCareData
        );

        updateModuleCards(
            tyreData,
            safeRideData,
            autoCareData
        );

        const overallScoreValue =
            calculateOverallScore(
                tyreData,
                safeRideData,
                autoCareData
            );

        console.log(
            "Overall Safety Score:",
            overallScoreValue
        );

        updateOverallSummary(
            overallScoreValue
        );

        renderReports(
            reports
        );

        updateSafetyInsight(
            tyreData,
            safeRideData,
            autoCareData,
            overallScoreValue
        );


        /* =================================================
           MODULE FILTER
           ================================================= */

        if (moduleFilter) {

            moduleFilter.addEventListener(
                "change",
                () => {

                    renderReports(
                        reports,
                        moduleFilter.value
                    );
                }
            );
        }


        /* =================================================
           DOWNLOAD REPORT
           ================================================= */

        if (downloadReportBtn) {

            downloadReportBtn.addEventListener(
                "click",
                () => {

                    downloadReports(
                        reports,
                        overallScoreValue
                    );
                }
            );
        }
    }


    /* =====================================================
       START REPORTS PAGE
       ===================================================== */

    initializeReportsPage();

});