const Portfolio = require('../models/Portfolio');
const PortfolioItem = require('../models/PortfolioItem');

const emptyCv = {
  personal: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
  },
  summary: { id: '', en: '' },
  workExperience: [],
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  achievements: [],
  references: [],
  languageBySection: {
    summary: 'id',
    workExperience: 'id',
    experience: 'id',
    education: 'id',
    skills: 'id',
    certifications: 'id',
    projects: 'id',
    achievements: 'id',
    references: 'id',
    additional: 'id'
  },
  additional: {
    languages: { id: '', en: '' },
    interests: { id: '', en: '' },
    awards: { id: '', en: '' },
    volunteer: { id: '', en: '' },
    publications: { id: '', en: '' }
  }
};

const normalizeCv = (cv) => {
  if (!cv) return emptyCv;
  return {
    personal: { ...emptyCv.personal, ...(cv.personal || {}) },
    summary: typeof cv.summary === 'object' ? { ...emptyCv.summary, ...cv.summary } : (cv.summary || ''),
    workExperience: Array.isArray(cv.workExperience) ? cv.workExperience : [],
    experience: Array.isArray(cv.experience) ? cv.experience : [],
    education: Array.isArray(cv.education) ? cv.education : [],
    skills: Array.isArray(cv.skills) ? cv.skills : [],
    certifications: Array.isArray(cv.certifications) ? cv.certifications : [],
    projects: Array.isArray(cv.projects) ? cv.projects : [],
    achievements: Array.isArray(cv.achievements) ? cv.achievements : [],
    references: Array.isArray(cv.references) ? cv.references : [],
    languageBySection: { ...emptyCv.languageBySection, ...(cv.languageBySection || {}) },
    additional: { ...emptyCv.additional, ...(cv.additional || {}) }
  };
};

const mapFromForm = (form) => {
  const skillsItems = (form.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const experienceEntry = form.experience
    ? [
      {
        role: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        highlights: [form.experience]
      }
    ]
    : [];
  return normalizeCv({
    personal: {
      fullName: form.name || '',
      email: form.email || ''
    },
    summary: { id: form.bio || form.about || '', en: '' },
    skills: skillsItems.length ? [{ category: 'Skills', items: skillsItems }] : [],
    experience: experienceEntry
  });
};

exports.createPortfolio = async (req, res) => {
  try {
    const { cv, form, templateId, theme, sectionsOrder, template } = req.body;

    if (!cv && !form) {
      return res.status(400).json({ error: 'Missing CV data' });
    }
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const normalizedCv = cv ? normalizeCv(cv) : mapFromForm(form);

    const p = await Portfolio.create({
      cv: normalizedCv,
      templateId: templateId || template || 1,
      theme: theme || {},
      sectionsOrder: Array.isArray(sectionsOrder) ? sectionsOrder : [],
      userId: req.user.sub
    });

    res.status(201).json({ id: p.id });

    try {
      const title = normalizedCv?.personal?.fullName || 'Portfolio';
      const summaryValue = normalizedCv?.summary;
      const description =
        typeof summaryValue === 'object'
          ? (summaryValue.id || summaryValue.en || '')
          : (summaryValue || '');
      const firstProjectLink = Array.isArray(normalizedCv?.projects) && normalizedCv.projects.length
        ? normalizedCv.projects[0]?.link?.id || normalizedCv.projects[0]?.link || null
        : null;
      // Sync image from CV personal data
      const imageUrl = normalizedCv?.personal?.image || null;

      await PortfolioItem.create({
        title,
        description: description || 'Portfolio',
        imageUrl,
        projectUrl: firstProjectLink,
        userId: req.user.sub,
        portfolioId: p.id
      });
    } catch (err) {
      console.error('Sync PortfolioItem error:', err);
    }

  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const p = await Portfolio.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    if (p.userId && (!req.user || p.userId !== req.user.sub)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!p.userId && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(p);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePortfolio = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await Portfolio.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    if (p.userId && (!req.user || p.userId !== req.user.sub)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!p.userId && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { cv, templateId, theme, sectionsOrder } = req.body || {};
    const updated = await p.update({
      cv: cv ? normalizeCv(cv) : p.cv,
      templateId: templateId != null ? templateId : p.templateId,
      theme: theme != null ? theme : p.theme,
      sectionsOrder: Array.isArray(sectionsOrder) ? sectionsOrder : p.sectionsOrder
    });
    try {
      const summaryValue = updated.cv?.summary;
      const description =
        typeof summaryValue === 'object'
          ? (summaryValue.id || summaryValue.en || '')
          : (summaryValue || '');
      const title = updated.cv?.personal?.fullName || 'Portfolio';
      const firstProjectLink = Array.isArray(updated.cv?.projects) && updated.cv.projects.length
        ? updated.cv.projects[0]?.link?.id || updated.cv.projects[0]?.link || null
        : null;
      const imageUrl = updated.cv?.personal?.image || null;

      const item = await PortfolioItem.findOne({ where: { portfolioId: updated.id } });
      if (item) {
        await item.update({
          title,
          description: description || item.description,
          imageUrl: imageUrl != null ? imageUrl : item.imageUrl,
          projectUrl: firstProjectLink != null ? firstProjectLink : item.projectUrl
        });
      }
    } catch (err) {
      console.error('Sync PortfolioItem on update error:', err);
    }
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePortfolio = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await Portfolio.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    if (p.userId && (!req.user || p.userId !== req.user.sub)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!p.userId && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await p.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
