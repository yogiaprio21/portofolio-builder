const config = require('../config/env');
const { normalizeCv } = require('./aiParser');
const { parseOpenAiCompatible } = require('./aiProviderUtils');

async function parseWithOpenRouter(text, hintLanguageBySection = {}, options = {}) {
  const headers = {};
  if (config.ai.openrouterReferer) headers['HTTP-Referer'] = config.ai.openrouterReferer;
  if (config.ai.openrouterTitle) headers['X-Title'] = config.ai.openrouterTitle;

  const parsed = await parseOpenAiCompatible({
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: config.ai.openrouterApiKey,
    model: config.ai.openrouterModel,
    text,
    hintLanguageBySection,
    targetLanguageMode: options.targetLanguageMode,
    currentCv: options.currentCv,
    timeoutMs: config.ai.timeoutMs,
    provider: 'openrouter',
    headers
  });
  const languageBySection = { ...(hintLanguageBySection || {}), ...(parsed.languageBySection || parsed.cv?.languageBySection || {}) };

  return {
    cv: normalizeCv(parsed.cv, languageBySection),
    languageBySection,
    provider: 'openrouter',
    model: config.ai.openrouterModel
  };
}

module.exports = { parseWithOpenRouter };
