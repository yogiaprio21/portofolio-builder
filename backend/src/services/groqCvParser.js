const config = require('../config/env');
const { normalizeCv } = require('./aiParser');
const { parseOpenAiCompatible } = require('./aiProviderUtils');

async function parseWithGroq(text, hintLanguageBySection = {}, options = {}) {
  const parsed = await parseOpenAiCompatible({
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: config.ai.groqApiKey,
    model: config.ai.groqModel,
    text,
    hintLanguageBySection,
    targetLanguageMode: options.targetLanguageMode,
    currentCv: options.currentCv,
    timeoutMs: config.ai.timeoutMs,
    provider: 'groq'
  });
  const languageBySection = { ...(hintLanguageBySection || {}), ...(parsed.languageBySection || parsed.cv?.languageBySection || {}) };

  return {
    cv: normalizeCv(parsed.cv, languageBySection),
    languageBySection,
    provider: 'groq',
    model: config.ai.groqModel
  };
}

module.exports = { parseWithGroq };
