/* =========================================================
   AUTOGUARDIAN AI
   SETTINGS PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("AutoGuardian Settings JS loaded");


    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const audioAlertToggle =
        document.getElementById("audioAlertToggle");

    const notificationToggle =
        document.getElementById("notificationToggle");

    const riskSensitivity =
        document.getElementById("riskSensitivity");

    const saveSettingsBtn =
        document.getElementById("saveSettingsBtn");

    const clearHistoryBtn =
        document.getElementById("clearHistoryBtn");

    const storedReportCount =
        document.getElementById("storedReportCount");

    const settingsMessage =
        document.getElementById("settingsMessage");

    const settingsMessageText =
        document.getElementById("settingsMessageText");


    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    const SETTINGS_STORAGE_KEY =
        "autoGuardianSettings";

    const REPORT_STORAGE_KEY =
        "analysisHistory";


    /* =====================================================
       DEFAULT SETTINGS
       ===================================================== */

    const defaultSettings = {

        audioAlerts: true,

        safetyNotifications: true,

        riskSensitivity: "moderate"

    };


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
                "Unable to parse stored data.",
                error
            );

            return null;
        }
    }


    /* =====================================================
       SHOW SETTINGS MESSAGE
       ===================================================== */

    let messageTimer = null;


    function showMessage(
        message,
        type = "success"
    ) {

        if (
            !settingsMessage ||
            !settingsMessageText
        ) {

            return;
        }


        if (messageTimer) {

            clearTimeout(messageTimer);
        }


        settingsMessageText.textContent =
            message;


        settingsMessage.classList.remove(
            "show",
            "error"
        );


        if (type === "error") {

            settingsMessage.classList.add(
                "error"
            );
        }


        requestAnimationFrame(() => {

            settingsMessage.classList.add(
                "show"
            );

        });


        messageTimer = setTimeout(() => {

            settingsMessage.classList.remove(
                "show"
            );

        }, 3000);
    }


    /* =====================================================
       GET SAVED SETTINGS
       ===================================================== */

    function getSavedSettings() {

        const savedSettings =
            safeParse(
                localStorage.getItem(
                    SETTINGS_STORAGE_KEY
                )
            );


        if (
            !savedSettings ||
            typeof savedSettings !== "object"
        ) {

            return {
                ...defaultSettings
            };
        }


        return {

            audioAlerts:
                typeof savedSettings.audioAlerts ===
                "boolean"
                    ? savedSettings.audioAlerts
                    : defaultSettings.audioAlerts,


            safetyNotifications:
                typeof savedSettings.safetyNotifications ===
                "boolean"
                    ? savedSettings.safetyNotifications
                    : defaultSettings.safetyNotifications,


            riskSensitivity:
                [
                    "low",
                    "moderate",
                    "high"
                ].includes(
                    savedSettings.riskSensitivity
                )
                    ? savedSettings.riskSensitivity
                    : defaultSettings.riskSensitivity

        };
    }


    /* =====================================================
       LOAD SETTINGS
       ===================================================== */

    function loadSettings() {

        const settings =
            getSavedSettings();


        if (audioAlertToggle) {

            audioAlertToggle.checked =
                settings.audioAlerts;
        }


        if (notificationToggle) {

            notificationToggle.checked =
                settings.safetyNotifications;
        }


        if (riskSensitivity) {

            riskSensitivity.value =
                settings.riskSensitivity;
        }


        console.log(
            "Loaded AutoGuardian settings:",
            settings
        );
    }


    /* =====================================================
       SAVE SETTINGS
       ===================================================== */

    function saveSettings() {

        const settings = {

            audioAlerts:
                audioAlertToggle
                    ? audioAlertToggle.checked
                    : defaultSettings.audioAlerts,


            safetyNotifications:
                notificationToggle
                    ? notificationToggle.checked
                    : defaultSettings.safetyNotifications,


            riskSensitivity:
                riskSensitivity
                    ? riskSensitivity.value
                    : defaultSettings.riskSensitivity

        };


        try {

            localStorage.setItem(
                SETTINGS_STORAGE_KEY,
                JSON.stringify(settings)
            );


            console.log(
                "Saved AutoGuardian settings:",
                settings
            );


            showMessage(
                "Settings saved successfully."
            );


        } catch (error) {

            console.error(
                "Unable to save settings.",
                error
            );


            showMessage(
                "Unable to save settings.",
                "error"
            );
        }
    }


    /* =====================================================
       GET ANALYSIS HISTORY
       ===================================================== */

    function getAnalysisHistory() {

        const history =
            safeParse(
                localStorage.getItem(
                    REPORT_STORAGE_KEY
                )
            );


        if (!Array.isArray(history)) {

            return [];
        }


        return history;
    }


    /* =====================================================
       UPDATE STORED REPORT COUNT
       ===================================================== */

    function updateStoredReportCount() {

        if (!storedReportCount) {

            return;
        }


        const history =
            getAnalysisHistory();


        storedReportCount.textContent =
            history.length;


        console.log(
            "Stored analysis reports:",
            history.length
        );
    }


    /* =====================================================
       CLEAR ANALYSIS HISTORY
       ===================================================== */

    function clearAnalysisHistory() {

        const history =
            getAnalysisHistory();


        if (history.length === 0) {

            showMessage(
                "No analysis history is available to clear.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to permanently clear all TyreVision AI, SafeRide AI and AutoCare AI analysis history?"
            );


        if (!confirmed) {

            return;
        }


        try {

            localStorage.removeItem(
                REPORT_STORAGE_KEY
            );


            updateStoredReportCount();


            console.log(
                "AutoGuardian analysis history cleared."
            );


            showMessage(
                "Analysis history cleared successfully."
            );


        } catch (error) {

            console.error(
                "Unable to clear analysis history.",
                error
            );


            showMessage(
                "Unable to clear analysis history.",
                "error"
            );
        }
    }


    /* =====================================================
       SAVE SETTINGS EVENT
       ===================================================== */

    if (saveSettingsBtn) {

        saveSettingsBtn.addEventListener(
            "click",
            saveSettings
        );
    }


    /* =====================================================
       CLEAR HISTORY EVENT
       ===================================================== */

    if (clearHistoryBtn) {

        clearHistoryBtn.addEventListener(
            "click",
            clearAnalysisHistory
        );
    }


    /* =====================================================
       INITIALIZE SETTINGS PAGE
       ===================================================== */

    function initializeSettingsPage() {

        loadSettings();

        updateStoredReportCount();

    }


    /* =====================================================
       START SETTINGS PAGE
       ===================================================== */

    initializeSettingsPage();

});