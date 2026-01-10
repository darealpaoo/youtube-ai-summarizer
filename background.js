// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateSummary") {
    handleGenerateSummary(request.prompt, request.apiKey)
      .then((summary) => {
        sendResponse({ success: true, summary });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  }
});

// Generate summary using Gemini API
async function handleGenerateSummary(prompt, apiKey) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  console.log("🔥 Background: Sending request to Gemini...");

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error cases
      if (response.status === 400) {
        throw new Error("Invalid API request. Please check your API key.");
      } else if (response.status === 403) {
        throw new Error("API key is invalid or doesn't have permission.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else {
        throw new Error(
          errorData.error?.message || `API Error: ${response.status}`
        );
      }
    }

    const data = await response.json();

    console.log("📦 Full API response:", data);

    // Extract text from response
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        const summaryText = candidate.content.parts[0].text;
        if (!summaryText) {
          throw new Error("No text in API response content");
        }
        console.log("✅ Extracted summary length:", summaryText.length);
        console.log("✅ Extracted summary:", summaryText);
        console.log("📊 Finish reason:", candidate.finishReason);
        return summaryText;
      }
    }

    throw new Error("No summary generated. Please try again.");
  } catch (error) {
    // Network or parsing errors
    if (error.message.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection.");
    }

    throw error;
  }
}

// Optional: Log installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("YouTube AI Summarizer installed successfully!");
  } else if (details.reason === "update") {
    console.log(
      "YouTube AI Summarizer updated to version:",
      chrome.runtime.getManifest().version
    );
  }
});
