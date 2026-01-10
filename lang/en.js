// English language pack
const LANG_EN = {
  // Extension UI
  extensionTitle: "YouTube AI Summarizer",
  boxTitle: "AI Video Summary",
  generateBtn: "Generate Summary",
  regenerateBtn: "Regenerate",
  generatingBtn: "Generating...",
  placeholder:
    'Click "Generate Summary" to get an AI-powered summary of this video',
  loading: "Analyzing video content...",
  generated: "Generated",

  // Popup UI
  popupTitle: "YouTube AI Summarizer",
  apiKeyLabel: "Google Gemini API Key:",
  apiKeyPlaceholder: "Enter your Gemini API Key",
  languageLabel: "Summary Language:",
  saveBtn: "Save Settings",
  apiKeyInfo: "How to get API Key:",
  apiKeyInfoLink:
    "Visit Google AI Studio to generate your free Gemini API Key.",

  // Messages
  msgSaveSuccess: "✓ Settings saved successfully!",
  msgEnterApiKey: "Please enter a valid API Key",
  msgInvalidApiKey:
    'Invalid API Key format. Gemini keys usually start with "AIza"',

  // Errors
  errorNoApiKey: "Please enter your Gemini API Key in the extension settings",
  errorHintApiKey: "Click the extension icon to configure",
  errorTitle: "Error:",
  errorHintRetry: "Please check your API key and try again",

  // Prompt template
  buildPrompt: (videoTitle, videoUrl, videoDescription) => {
    return `Summarize the following video in English:

Title: ${videoTitle}
URL: ${videoUrl}
${
  videoDescription
    ? `\nDescription:\n${videoDescription.substring(0, 2000)}`
    : ""
}`;
  },
};

// Export for use in other files
if (typeof window !== "undefined") {
  window.LANG_EN = LANG_EN;
}
