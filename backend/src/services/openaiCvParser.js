const config = require('../config/env');
const { normalizeCv } = require('./aiParser');
const { openAiJsonSchema, parseOpenAiCompatible } = require('./aiProviderUtils');

async function parseWithOpenAi(text, hintLanguageBySection = {}) {
  const parsed = await parseOpenAiCompatible({
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: config.ai.openaiApiKey,
    model: config.ai.model,
    text,
    hintLanguageBySection,
    timeoutMs: config.ai.timeoutMs,
    provider: 'openai',
    responseFormat: {
      type: 'json_schema',
      json_schema: openAiJsonSchema
    }
  });

  const languageBySection = { ...(hintLanguageBySection || {}), ...(parsed.languageBySection || parsed.cv?.languageBySection || {}) };
  return {
    cv: normalizeCv(parsed.cv, languageBySection),
    languageBySection,
    provider: 'openai',
    model: config.ai.model
  };
}

module.exports = { parseWithOpenAi };
