const { enhanceCv } = require('../services/aiParser');

exports.parseText = async (req, res) => {
  try {
    const { text, hintLanguageBySection } = req.body || {};
    if (!text || String(text).trim().length < 20) {
      return res.status(400).json({ error: 'text is required and should be at least 20 chars' });
    }
    const { cv, languageBySection } = enhanceCv(text, hintLanguageBySection);
    return res.json({ cv, languageBySection });
  } catch (err) {
    console.error('AI parse error:', err);
    return res.status(500).json({ error: 'Failed to enhance CV' });
  }
};
