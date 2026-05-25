const path = require('path');
const cvParser = require('../services/cvParser');
const { parseCvText } = require('../services/aiParser');
const fs = require('fs');

exports.parseCv = async (req, res) => {
  const filepath = req.file ? path.resolve(req.file.path) : null;
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const parsed = await cvParser.parsePdf(filepath);
    const enhanced = parsed.text && parsed.text.trim().length >= 20
      ? await parseCvText(parsed.text)
      : { cv: null, languageBySection: {}, provider: 'none' };

    return res.json({
      message: "CV parsed successfully",
      data: {
        name: parsed.name,
        email: parsed.email,
        skills: parsed.skills,
        experience: parsed.experience
      },
      textLength: parsed.text.length,
      ...enhanced
    });

  } catch (error) {
    console.error("ParseCV Error:", error);
    res.status(500).json({ error: "Failed to parse CV" });
  } finally {
    if (filepath) fs.unlink(filepath, () => {});
  }
};
