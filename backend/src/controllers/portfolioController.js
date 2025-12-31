const Portfolio = require('../models/Portfolio');

exports.createPortfolio = async (req, res) => {
  try {
    const { form, template } = req.body;

    if (!form) {
      return res.status(400).json({ error: "Missing form data" });
    }

    const p = await Portfolio.create({
      name: form.name || "",
      email: form.email || "",
      bio: form.bio || "",
      skills: form.skills || "",
      experience: form.experience || "",
      template: template || 1
    });

    res.json({ id: p.id });

  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const p = await Portfolio.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });

    res.json(p);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
