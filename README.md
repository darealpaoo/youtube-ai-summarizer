# YouTube AI Summarizer Chrome Extension

## English

A small Chrome extension (Manifest V3) that summarizes YouTube videos using the Google Gemini API.

Quick Start

- Install: Load the `youtube-ai-summarizer` folder in Chrome via `chrome://extensions` → "Load unpacked".
- Configure: Open the extension popup, paste your Gemini API key (starts with `AIza...`), choose language, and save.
- Use: Open any YouTube video, click "Generate Summary" in the summary box above comments.

Files

- `manifest.json` — extension config
- `popup.html`, `popup.js` — settings UI and logic
- `content.js` — injects summary box into YouTube pages
- `background.js` — calls Gemini API and returns the result
- `styles.css` — UI styling
- `icons/` — icons (16x16, 48x48, 128x128)

Notes

- API key is stored locally in Chrome storage (not sent anywhere else).
- Handles missing/invalid keys, network errors, and rate limits.

---

## Tiếng Việt

Một extension nhỏ cho Chrome (Manifest V3) giúp tóm tắt video YouTube bằng Google Gemini API.

Bắt đầu nhanh

- Cài đặt: Vào `chrome://extensions` → "Load unpacked" và chọn thư mục `youtube-ai-summarizer`.
- Cấu hình: Mở popup extension, dán Gemini API Key (bắt đầu bằng `AIza...`), chọn ngôn ngữ và lưu.
- Sử dụng: Mở video YouTube bất kỳ, click "Generate Summary" ở ô tóm tắt phía trên phần bình luận.

Tệp chính

- `manifest.json` — cấu hình extension
- `popup.html`, `popup.js` — giao diện cài đặt và logic
- `content.js` — chèn ô tóm tắt vào trang YouTube
- `background.js` — gọi API Gemini và trả kết quả
- `styles.css` — kiểu giao diện
- `icons/` — icon (16x16, 48x48, 128x128)

Ghi chú

- API key được lưu cục bộ trong Chrome storage.
- Có xử lý lỗi khi thiếu/không hợp lệ API key, lỗi mạng, hoặc vượt hạn mức.

---

Made with ❤️ - MIT License
