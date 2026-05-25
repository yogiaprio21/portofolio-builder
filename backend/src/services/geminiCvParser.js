const config = require('../config/env');
const { normalizeCv } = require('./aiParser');
const { cvJsonSchema, parseJsonObject, postJson, systemPrompt } = require('./aiProviderUtils');

async function parseWithGemini(text, hintLanguageBySection = {}, options = {}) {
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required for AI_PROVIDER=gemini');
  }

  const model = config.ai.geminiModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const data = await postJson(url, {
    timeoutMs: config.ai.timeoutMs,
    headers: {
      'x-goog-api-key': config.ai.geminiApiKey
    },
    body: {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\n${JSON.stringify({ text, hintLanguageBySection, targetLanguageMode: options.targetLanguageMode, currentCv: options.currentCv })}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseJsonSchema: cvJsonSchema
      }
    }
  });

  const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  const parsed = parseJsonObject(content);
  const languageBySection = { ...(hintLanguageBySection || {}), ...(parsed.languageBySection || parsed.cv?.languageBySection || {}) };

  return {
    cv: normalizeCv(parsed.cv, languageBySection),
    languageBySection,
    provider: 'gemini',
    model
  };
}

module.exports = { parseWithGemini };
