function stringField(value, { min = 0, max = 1000, required = false, trim = true } = {}) {
  if (value == null || value === '') {
    if (required) return { error: 'is required' };
    return { value: undefined };
  }
  if (typeof value !== 'string') return { error: 'must be a string' };
  const normalized = trim ? value.trim() : value;
  if (normalized.length < min) return { error: `must be at least ${min} characters` };
  if (normalized.length > max) return { error: `must be at most ${max} characters` };
  return { value: normalized };
}

function emailField(value) {
  const result = stringField(value, { required: true, max: 254 });
  if (result.error) return result;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.value)) {
    return { error: 'must be a valid email' };
  }
  return { value: result.value.toLowerCase() };
}

function passwordField(value) {
  const result = stringField(value, { required: true, min: 8, max: 128, trim: false });
  if (result.error) return result;
  if (!/[A-Za-z]/.test(result.value) || !/[0-9]/.test(result.value)) {
    return { error: 'must contain letters and numbers' };
  }
  return { value: result.value };
}

function urlField(value, { required = false } = {}) {
  const result = stringField(value, { required, max: 2048 });
  if (result.error || result.value == null) return result;
  try {
    const parsed = new URL(result.value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { error: 'must use http or https' };
    }
    return { value: parsed.toString() };
  } catch {
    return { error: 'must be a valid URL' };
  }
}

function integerQuery(value, { min = 0, max = 100, fallback = null } = {}) {
  if (value == null || value === '') return { value: fallback };
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return { error: 'must be an integer' };
  if (parsed < min || parsed > max) return { error: `must be between ${min} and ${max}` };
  return { value: parsed };
}

function validateBody(schema) {
  return (req, res, next) => {
    const input = req.body || {};
    const output = {};
    const errors = {};
    for (const [key, validator] of Object.entries(schema)) {
      const result = validator(input[key], input);
      if (result.error) errors[key] = result.error;
      else if (result.value !== undefined) output[key] = result.value;
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }
    req.validatedBody = { ...input, ...output };
    next();
  };
}

module.exports = {
  emailField,
  passwordField,
  stringField,
  urlField,
  integerQuery,
  validateBody
};
