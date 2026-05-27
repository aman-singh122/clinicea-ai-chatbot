import { GoogleGenAI }
from "@google/genai";

// =========================
// CREATE GEMINI CLIENT
// =========================

function createGeminiClient(
  apiKey
) {

  return new GoogleGenAI({

    apiKey

  });

}

export default createGeminiClient;