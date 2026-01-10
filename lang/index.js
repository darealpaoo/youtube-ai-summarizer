// Language manager - handles language loading and switching
const LanguageManager = {
  currentLang: null,
  defaultLang: "vi",

  // Get language pack
  getLang(langCode) {
    if (langCode === "en") {
      return window.LANG_EN || LANG_EN;
    }
    return window.LANG_VI || LANG_VI;
  },

  // Initialize language from storage
  async init() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["summaryLanguage"], (result) => {
        this.currentLang = result.summaryLanguage || this.defaultLang;
        resolve(this.getLang(this.currentLang));
      });
    });
  },

  // Set language
  async setLang(langCode) {
    this.currentLang = langCode;
    return this.getLang(langCode);
  },

  // Get current language code
  getCurrentLangCode() {
    return this.currentLang || this.defaultLang;
  },
};

// Export for use in other files
if (typeof window !== "undefined") {
  window.LanguageManager = LanguageManager;
}
