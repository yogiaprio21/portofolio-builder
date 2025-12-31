const fs = require('fs');
const pdf = require('pdf-parse');

exports.parsePdf = async (filepath) => {
  try {
    const buffer = fs.readFileSync(filepath);
    const data = await pdf(buffer);

    const text = data.text || "";
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    let name = "";
    let email = "";
    let skills = "";
    let experience = "";

    // detect email
    for (const l of lines) {
      const m = l.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      if (m) {
        email = m[0];
        break;
      }
    }

    // detect name
    if (lines.length > 0 && lines[0].length < 60) {
      name = lines[0];
    }

    // detect skills
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].toLowerCase();
      if (l.includes("skill")) {
        skills = lines[i + 1] || lines[i].replace(/skills?:/i, "");
        break;
      }
    }

    // detect experience
    const expLines = lines.filter(l =>
      /experience|intern|project|worked|freelance/i.test(l)
    );

    experience = expLines.slice(0, 4).join(" | ");

    return { name, email, skills, experience };

  } catch (err) {
    console.error("CV parse error:", err);
    return { name: "", email: "", skills: "", experience: "" };
  }
};