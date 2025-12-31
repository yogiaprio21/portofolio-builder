const path = require('path');
const cvParser = require('../services/cvParser');

exports.parseCv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filepath = path.resolve(req.file.path);
    const parsed = await cvParser.parsePdf(filepath);

    return res.json({
      message: "CV parsed successfully",
      data: parsed
    });

  } catch (error) {
    console.error("ParseCV Error:", error);
    res.status(500).json({ error: "Failed to parse CV" });
  }
};
