// Vietnamese language pack
const LANG_VI = {
  // Extension UI
  extensionTitle: "YouTube AI Summarizer",
  boxTitle: "Tóm Tắt Video AI",
  generateBtn: "Tạo Tóm Tắt",
  regenerateBtn: "Tạo Lại",
  generatingBtn: "Đang tạo...",
  placeholder: 'Nhấn "Tạo Tóm Tắt" để nhận bản tóm tắt video bằng AI',
  loading: "Đang phân tích nội dung video...",
  generated: "Đã tạo lúc",

  // Popup UI
  popupTitle: "YouTube AI Summarizer",
  apiKeyLabel: "Google Gemini API Key:",
  apiKeyPlaceholder: "Nhập Gemini API Key của bạn",
  languageLabel: "Ngôn ngữ tóm tắt:",
  saveBtn: "Lưu Cài Đặt",
  apiKeyInfo: "Cách lấy API Key:",
  apiKeyInfoLink: "Truy cập Google AI Studio để tạo Gemini API Key miễn phí.",

  // Messages
  msgSaveSuccess: "✓ Đã lưu cài đặt thành công!",
  msgEnterApiKey: "Vui lòng nhập API Key hợp lệ",
  msgInvalidApiKey:
    'Định dạng API Key không hợp lệ. Key Gemini thường bắt đầu bằng "AIza"',

  // Errors
  errorNoApiKey: "Vui lòng nhập Gemini API Key trong cài đặt extension",
  errorHintApiKey: "Nhấn vào biểu tượng extension để cấu hình",
  errorTitle: "Lỗi:",
  errorHintRetry: "Vui lòng kiểm tra API key và thử lại",

  // Prompt template
  buildPrompt: (videoTitle, videoUrl, videoDescription) => {
    return `Tóm tắt video sau đây bằng tiếng Việt:

Tiêu đề: ${videoTitle}
URL: ${videoUrl}
${videoDescription ? `\nMô tả:\n${videoDescription.substring(0, 2000)}` : ""}`;
  },
};

// Export for use in other files
if (typeof window !== "undefined") {
  window.LANG_VI = LANG_VI;
}
