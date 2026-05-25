const bcrypt = require('bcryptjs');
const Template = require('../models/Template');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const PortfolioItem = require('../models/PortfolioItem');
const templateSeeds = require('../data/templates');
const config = require('../config/env');
const logger = require('../utils/logger');

const sampleCv = {
  personal: {
    fullName: 'Demo Portfolio Builder',
    headline: 'Frontend Developer',
    email: 'demo@example.com',
    phone: '+62 812 0000 0000',
    location: 'Jakarta, Indonesia',
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/demo',
    github: 'https://github.com/demo'
  },
  summary: {
    id: 'Frontend developer yang membangun aplikasi web responsif, mudah digunakan, dan terukur.',
    en: 'Frontend developer building responsive, usable, and scalable web applications.'
  },
  workExperience: [
    {
      role: 'Frontend Developer',
      company: 'Sample Studio',
      location: 'Remote',
      startDate: '2023',
      endDate: 'Present',
      highlights: [
        'Built reusable React components used across multiple portfolio pages.',
        'Improved page performance by optimizing image delivery and component rendering.'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Computer Science',
      institution: 'Sample University',
      location: 'Indonesia',
      startDate: '2019',
      endDate: '2023',
      gpa: '3.75'
    }
  ],
  skills: [
    { category: 'Frontend', items: ['React', 'Vite', 'CSS', 'Accessibility'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'PostgreSQL'] }
  ],
  projects: [
    {
      name: 'Portfolio Builder',
      role: 'Full Stack Developer',
      description: 'Created a CV and portfolio builder with authentication, templates, and media upload.',
      tech: 'React, Express, PostgreSQL, Cloudinary',
      link: 'https://example.com'
    }
  ],
  certifications: [],
  achievements: [
    { title: 'Completed production deployment workflow', date: '2026', description: 'Configured Render, Neon, Vercel, SMTP, and Cloudinary.' }
  ],
  references: [],
  languageBySection: {
    summary: 'id',
    workExperience: 'en',
    education: 'en',
    skills: 'en',
    projects: 'en',
    achievements: 'en'
  },
  additional: {
    languages: { id: 'Bahasa Indonesia, English', en: 'Indonesian, English' },
    interests: { id: 'UI engineering, product design', en: 'UI engineering, product design' },
    awards: { id: '', en: '' },
    volunteer: { id: '', en: '' },
    publications: { id: '', en: '' }
  }
};

async function seedTemplates({ updateExisting = config.seed.updateExistingTemplates } = {}) {
  let createdTemplates = 0;
  let updatedTemplates = 0;

  for (const seed of templateSeeds) {
    const existing = await Template.findByPk(seed.id);
    if (!existing) {
      await Template.create(seed);
      createdTemplates += 1;
    } else if (updateExisting) {
      await existing.update(seed);
      updatedTemplates += 1;
    }
  }

  return { createdTemplates, updatedTemplates, totalTemplates: templateSeeds.length };
}

async function seedAdminUser() {
  const { adminEmail, adminPassword } = config.seed;
  if (!adminEmail || !adminPassword) return { skipped: true };

  const existing = await User.findOne({ where: { email: adminEmail } });
  if (existing) {
    if (existing.role !== 'admin' || !existing.emailVerified) {
      await existing.update({ role: 'admin', emailVerified: true });
      return { created: false, updated: true, email: adminEmail };
    }
    return { created: false, updated: false, email: adminEmail };
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    email: adminEmail,
    passwordHash,
    role: 'admin',
    emailVerified: true
  });
  return { created: true, updated: false, email: adminEmail };
}

async function seedDemoPortfolio() {
  if (!config.seed.demoPortfolio) return { skipped: true };
  const { demoEmail, demoPassword } = config.seed;
  if (!demoEmail || !demoPassword) return { skipped: true, reason: 'missing demo credentials' };

  let user = await User.findOne({ where: { email: demoEmail } });
  if (!user) {
    user = await User.create({
      email: demoEmail,
      passwordHash: await bcrypt.hash(demoPassword, 10),
      role: 'user',
      emailVerified: true
    });
  }

  const existing = await Portfolio.findOne({ where: { userId: user.id } });
  if (existing) return { created: false, userId: user.id };

  const portfolio = await Portfolio.create({
    cv: sampleCv,
    templateId: 1,
    theme: { layout: 'single' },
    sectionsOrder: ['summary', 'workExperience', 'projects', 'skills', 'education'],
    userId: user.id
  });

  await PortfolioItem.create({
    title: sampleCv.personal.fullName,
    description: sampleCv.summary.id,
    projectUrl: sampleCv.projects[0].link,
    userId: user.id,
    portfolioId: portfolio.id
  });

  return { created: true, userId: user.id, portfolioId: portfolio.id };
}

async function seedDatabase(options = {}) {
  const templateResult = await seedTemplates(options);
  const adminResult = await seedAdminUser();
  const demoResult = await seedDemoPortfolio();

  const result = { templates: templateResult, admin: adminResult, demo: demoResult };
  logger.info('Database seed complete', result);
  return result;
}

module.exports = {
  seedDatabase,
  seedTemplates
};
