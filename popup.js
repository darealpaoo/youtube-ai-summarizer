// DOM Elements
const apiKeyInput = document.getElementById("apiKey");
const languageSelect = document.getElementById("language");
const saveBtn = document.getElementById("saveBtn");
const messageDiv = document.getElementById("message");

// Get language pack
function getLang(langCode) {
  return langCode === "en" ? LANG_EN : LANG_VI;
}

// Update popup UI with selected language
function updatePopupUI(lang) {
  document.getElementById("popupTitle").textContent = lang.popupTitle;
  document.getElementById("apiKeyLabel").textContent = lang.apiKeyLabel;
  document.getElementById("apiKey").placeholder = lang.apiKeyPlaceholder;
  document.getElementById("languageLabel").textContent = lang.languageLabel;
  document.getElementById("saveBtn").textContent = lang.saveBtn;
  document.getElementById("infoTitle").innerHTML = `ℹ️ ${lang.apiKeyInfo}`;
  document.getElementById("infoText").innerHTML = lang.apiKeyInfoLink.replace(
    "Google AI Studio",
    '<a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a>'
  );
}

// Load existing settings on popup open
chrome.storage.local.get(["geminiApiKey", "summaryLanguage"], (result) => {
  if (result.geminiApiKey) {
    apiKeyInput.value = result.geminiApiKey;
  }

  const currentLang = result.summaryLanguage || "vi";
  languageSelect.value = currentLang;

  // Apply language to popup UI
  updatePopupUI(getLang(currentLang));
});

// Language change event - update UI immediately
languageSelect.addEventListener("change", () => {
  updatePopupUI(getLang(languageSelect.value));
});

// Save settings
saveBtn.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();
  const language = languageSelect.value;
  const lang = getLang(language);

  if (!apiKey) {
    showMessage(lang.msgEnterApiKey, "error");
    return;
  }

  // Basic validation - Gemini API keys typically start with "AIza"
  if (!apiKey.startsWith("AIza")) {
    showMessage(lang.msgInvalidApiKey, "error");
    return;
  }

  // Save to storage
  chrome.storage.local.set(
    { geminiApiKey: apiKey, summaryLanguage: language },
    () => {
      showMessage(lang.msgSaveSuccess, "success");

      // Notify all YouTube tabs to refresh with new language
      chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs
            .sendMessage(tab.id, { action: "languageUpdated" })
            .catch(() => {});
        });
      });
    }
  );
});

// Enter key support
apiKeyInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    saveBtn.click();
  }
});

// Show message helper
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";

  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 3000);
}
