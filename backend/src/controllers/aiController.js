const { parseCvText } = require('../services/aiParser');

exports.parseText = async (req, res) => {
  try {
    const { text, hintLanguageBySection, targetLanguageMode, currentCv } = req.body || {};
    if (!text || String(text).trim().length < 20) {
      return res.status(400).json({ error: 'text is required and should be at least 20 chars' });
    }
    const result = await parseCvText(text, hintLanguageBySection, { targetLanguageMode, currentCv });
    return res.json(result);
  } catch (err) {
    console.error('AI parse error:', err);
    return res.status(500).json({ error: 'Failed to enhance CV' });
  }
};
