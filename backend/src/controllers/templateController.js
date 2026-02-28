const Template = require('../models/Template');

exports.listTemplates = async (req, res) => {
  try {
    const templates = await Template.findAll({ order: [['id', 'ASC']] });
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, category, layout, style, sections, tags } = req.body;
    if (!name || !layout) {
      return res.status(400).json({ error: 'Missing template data' });
    }
    const template = await Template.create({
      name,
      category: category || 'Custom',
      layout,
      style: style || {},
      sections: sections || [],
      tags: tags || [],
      isActive: true
    });
    res.status(201).json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
