// Global state
let summaryContainer = null;
let currentVideoUrl = null;
let isProcessing = false;
let currentLang = null;

// Initialize extension
initialize();

// Listen for YouTube SPA navigation
document.addEventListener("yt-navigate-finish", handleNavigation);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.action === "apiKeyUpdated" ||
    message.action === "languageUpdated"
  ) {
    // Reload language and refresh UI
    loadLanguageAndRefresh();
  }
});

// Main initialization
async function initialize() {
  // Load language first
  currentLang = await LanguageManager.init();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleNavigation);
  } else {
    setTimeout(handleNavigation, 1000);
  }
}

// Load language and refresh UI
async function loadLanguageAndRefresh() {
  currentLang = await LanguageManager.init();
  // Force recreate summary box with new language
  currentVideoUrl = null;
  handleNavigation();
}

// Get video ID from URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

// Check if current video is a livestream
function isLivestream() {
  const liveBadges = [
    document.querySelector(".ytp-live-badge"),
    document.querySelector(".ytp-live"),
    document.querySelector(
      "ytd-badge-supported-renderer .badge-style-type-live-now"
    ),
    document.querySelector('[aria-label="LIVE"]'),
    document.querySelector(".badge.badge-style-type-live-now"),
  ];

  for (const badge of liveBadges) {
    if (badge && badge.offsetParent !== null) {
      return true;
    }
  }

  const title = document.querySelector(
    "h1.ytd-watch-metadata yt-formatted-string"
  );
  if (title && title.textContent.includes("🔴")) {
    return true;
  }

  return false;
}

// Handle navigation/video change
function handleNavigation() {
  if (!window.location.pathname.startsWith("/watch")) {
    removeSummaryBox();
    return;
  }

  const videoId = getVideoId();
  if (!videoId) {
    removeSummaryBox();
    return;
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (
    videoUrl === currentVideoUrl &&
    summaryContainer &&
    document.getElementById("yt-ai-summary-container")
  ) {
    return;
  }

  currentVideoUrl = videoUrl;
  createSummaryBox();
}

// Create summary box UI
function createSummaryBox() {
  removeSummaryBox();

  if (document.getElementById("yt-ai-summary-container")) {
    return;
  }

  let attempts = 0;
  const maxAttempts = 50;

  const checkSecondary = setInterval(() => {
    attempts++;
    const secondary = document.querySelector("#secondary");

    if (secondary) {
      clearInterval(checkSecondary);

      setTimeout(() => {
        if (isLivestream()) {
          removeSummaryBox();
          return;
        }
      }, 1500);

      if (document.getElementById("yt-ai-summary-container")) {
        return;
      }

      // Use language pack for UI text
      const lang = currentLang || LanguageManager.getLang("vi");

      summaryContainer = document.createElement("div");
      summaryContainer.id = "yt-ai-summary-container";
      summaryContainer.className = "yt-ai-summary";

      summaryContainer.innerHTML = `
        <div class="summary-header">
          <div class="summary-title">
            <span class="summary-icon">✨</span>
            <span>${lang.boxTitle}</span>
          </div>
          <button class="summary-generate-btn" id="generateSummaryBtn">
            ${lang.generateBtn}
          </button>
        </div>
        <div class="summary-content" id="summaryContent">
          <div class="summary-placeholder">
            ${lang.placeholder}
          </div>
        </div>
      `;

      secondary.insertBefore(summaryContainer, secondary.firstChild);

      const btn = document.getElementById("generateSummaryBtn");
      if (btn) {
        btn.addEventListener("click", generateSummary);
      }
    }

    if (attempts >= maxAttempts) {
      clearInterval(checkSecondary);
    }
  }, 100);
}

// Remove summary box
function removeSummaryBox() {
  if (summaryContainer && summaryContainer.parentNode) {
    summaryContainer.remove();
  }

  const existingBox = document.getElementById("yt-ai-summary-container");
  if (existingBox) {
    existingBox.remove();
  }

  summaryContainer = null;
  isProcessing = false;
}

// Generate summary
async function generateSummary() {
  if (isProcessing) return;

  const contentDiv = document.getElementById("summaryContent");
  const generateBtn = document.getElementById("generateSummaryBtn");

  // Ensure lang is initialized
  if (!currentLang) {
    currentLang = LanguageManager.getLang("vi");
  }
  const lang = currentLang;

  chrome.storage.local.get(
    ["geminiApiKey", "summaryLanguage"],
    async (result) => {
      if (!result.geminiApiKey) {
        contentDiv.innerHTML = `
        <div class="summary-error">
          <span class="error-icon">⚠️</span>
          <div>${lang.errorNoApiKey}</div>
          <div class="error-hint">${lang.errorHintApiKey}</div>
        </div>
      `;
        return;
      }

      // Update language if changed
      if (
        result.summaryLanguage &&
        result.summaryLanguage !== LanguageManager.getCurrentLangCode()
      ) {
        currentLang = await LanguageManager.setLang(result.summaryLanguage);
      }

      isProcessing = true;
      generateBtn.disabled = true;
      generateBtn.textContent = lang.generatingBtn;

      contentDiv.innerHTML = `
      <div class="summary-loading">
        <div class="loader"></div>
        <div>${lang.loading}</div>
      </div>
    `;

      try {
        const videoTitle =
          document.querySelector("h1.ytd-watch-metadata yt-formatted-string")
            ?.textContent || "Unknown title";
        const videoDescription =
          document.querySelector(
            "#description-inline-expander yt-formatted-string"
          )?.textContent || "";

        // Build prompt using language pack
        const prompt = lang.buildPrompt(
          videoTitle,
          currentVideoUrl,
          videoDescription
        );

        const response = await chrome.runtime.sendMessage({
          action: "generateSummary",
          prompt: prompt,
          apiKey: result.geminiApiKey,
        });

        if (!response) {
          displayError("Failed to communicate with background script");
          return;
        }

        if (response.success) {
          displaySummary(response.summary);
        } else {
          displayError(response.error || "Failed to generate summary");
        }
      } catch (error) {
        displayError(error.message || "An unexpected error occurred");
      } finally {
        isProcessing = false;
        generateBtn.disabled = false;
        generateBtn.textContent = lang.regenerateBtn;
      }
    }
  );
}

// Display summary
// Escape HTML to prevent XSS from external content
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function displaySummary(summary) {
  const contentDiv = document.getElementById("summaryContent");
  const lang = currentLang || LanguageManager.getLang("vi");

  // Escape content first, then apply simple markdown-like formatting
  const safe = escapeHtml(summary);
  const formattedSummary = safe
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  contentDiv.innerHTML = `
    <div class="summary-text">
      <p>${formattedSummary}</p>
    </div>
    <div class="summary-footer">
      <span class="summary-timestamp">${
        lang.generated
      }: ${new Date().toLocaleTimeString()}</span>
    </div>
  `;
}

// Display error
function displayError(errorMessage) {
  const contentDiv = document.getElementById("summaryContent");
  const lang = currentLang || LanguageManager.getLang("vi");

  // Ensure error messages are escaped
  const safeError = escapeHtml(errorMessage || "");

  contentDiv.innerHTML = `
    <div class="summary-error">
      <span class="error-icon">❌</span>
      <div><strong>${lang.errorTitle}</strong> ${safeError}</div>
      <div class="error-hint">${lang.errorHintRetry}</div>
    </div>
  `;
}
