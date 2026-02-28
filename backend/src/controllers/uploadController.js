const path = require('path');
const cvParser = require('../services/cvParser');
const fs = require('fs');

exports.parseCv = async (req, res) => {
  const filepath = req.file ? path.resolve(req.file.path) : null;
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const parsed = await cvParser.parsePdf(filepath);

    return res.json({
      message: "CV parsed successfully",
      data: parsed
    });

  } catch (error) {
    console.error("ParseCV Error:", error);
    res.status(500).json({ error: "Failed to parse CV" });
  } finally {
    if (filepath) fs.unlink(filepath, () => {});
  }
};
