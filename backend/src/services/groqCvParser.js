const config = require('../config/env');
const { normalizeCv } = require('./aiParser');
const { parseOpenAiCompatible } = require('./aiProviderUtils');

async function parseWithGroq(text, hintLanguageBySection = {}) {
  const parsed = await parseOpenAiCompatible({
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: config.ai.groqApiKey,
    model: config.ai.groqModel,
    text,
    hintLanguageBySection,
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
