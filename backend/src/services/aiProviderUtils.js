const cvJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    cv: {
      type: 'object',
      additionalProperties: true,
      properties: {
        personal: { type: 'object', additionalProperties: true },
        summary: { type: 'object', additionalProperties: true },
        workExperience: { type: 'array', items: { type: 'object', additionalProperties: true } },
        experience: { type: 'array', items: { type: 'object', additionalProperties: true } },
        education: { type: 'array', items: { type: 'object', additionalProperties: true } },
        skills: { type: 'array', items: { type: 'object', additionalProperties: true } },
        projects: { type: 'array', items: { type: 'object', additionalProperties: true } },
        certifications: { type: 'array', items: { type: 'object', additionalProperties: true } },
        achievements: { type: 'array', items: { type: 'object', additionalProperties: true } },
        references: { type: 'array', items: {} },
        languageBySection: { type: 'object', additionalProperties: { type: 'string' } },
        additional: { type: 'object', additionalProperties: true }
      }
    },
    languageBySection: {
      type: 'object',
      additionalProperties: { type: 'string' }
    }
  },
  required: ['cv', 'languageBySection']
};

const openAiJsonSchema = {
  name: 'cv_schema',
  strict: false,
  schema: cvJsonSchema
};

const systemPrompt = [
  'You extract CV/resume text into a JSON object for a portfolio builder.',
  'Preserve Indonesian and English content when present.',
  'Use these section keys only: personal, summary, workExperience, experience, education, skills, projects, certifications, achievements, references, languageBySection, additional.',
  'Do not invent facts that are not present in the CV text.',
  'Return JSON only.'
].join(' ');

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timeout) };
}

function parseJsonObject(content) {
  if (!content) throw new Error('AI response content is empty');
  const value = String(content).trim();
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI response is not valid JSON');
    return JSON.parse(match[0]);
  }
}

async function postJson(url, { headers, body, timeoutMs }) {
  const { controller, clear } = withTimeout(timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || `AI provider request failed with ${response.status}`);
    }
    return data;
  } finally {
    clear();
  }
}

async function parseOpenAiCompatible({
  endpoint,
  apiKey,
  model,
  text,
  hintLanguageBySection,
  timeoutMs,
  provider,
  headers = {},
  responseFormat = { type: 'json_object' }
}) {
  if (!apiKey) throw new Error(`${provider.toUpperCase()} API key is required`);
  if (!model) throw new Error(`${provider.toUpperCase()} model is required`);

  const data = await postJson(endpoint, {
    timeoutMs,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...headers
    },
    body: {
      model,
      temperature: 0.1,
      response_format: responseFormat,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: JSON.stringify({ text, hintLanguageBySection })
        }
      ]
    }
  });

  return parseJsonObject(data.choices?.[0]?.message?.content);
}

module.exports = {
  cvJsonSchema,
  openAiJsonSchema,
  parseJsonObject,
  parseOpenAiCompatible,
  postJson,
  systemPrompt
};
