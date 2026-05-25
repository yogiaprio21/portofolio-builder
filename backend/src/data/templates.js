const sections = {
  ats: ['summary', 'workExperience', 'education', 'skills', 'projects', 'certifications', 'achievements'],
  professional: ['summary', 'workExperience', 'projects', 'skills', 'education', 'certifications', 'achievements'],
  creative: ['summary', 'projects', 'workExperience', 'skills', 'education', 'achievements', 'additional'],
  executive: ['summary', 'workExperience', 'achievements', 'skills', 'education', 'certifications', 'references']
};

const fonts = {
  system: 'Arial, Helvetica, sans-serif',
  inter: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  source: 'Source Sans 3, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  lato: 'Lato, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  serif: 'Georgia, Times New Roman, serif'
};

const templateGroups = [
  {
    category: 'ATS',
    isAtsSafe: true,
    layout: 'single',
    roleTargets: ['General', 'Fresh Graduate', 'Administration', 'Finance', 'Operations', 'Engineering'],
    tags: ['ATS', 'Single Column', 'Recruiter Friendly'],
    sectionSet: sections.ats,
    styles: [
      { name: 'ATS Classic', accentColor: '#111827', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#111827', fontFamily: fonts.system },
      { name: 'ATS Blueline', accentColor: '#1d4ed8', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.inter },
      { name: 'ATS Compact', accentColor: '#334155', backgroundColor: '#ffffff', headingColor: '#0f172a', textColor: '#111827', fontFamily: fonts.source },
      { name: 'ATS Graduate', accentColor: '#047857', backgroundColor: '#ffffff', headingColor: '#064e3b', textColor: '#111827', fontFamily: fonts.lato },
      { name: 'ATS Technical', accentColor: '#4338ca', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#111827', fontFamily: fonts.inter },
      { name: 'ATS Executive', accentColor: '#0f172a', backgroundColor: '#ffffff', headingColor: '#020617', textColor: '#1f2937', fontFamily: fonts.serif }
    ]
  },
  {
    category: 'Professional',
    isAtsSafe: false,
    layout: 'single',
    roleTargets: ['Corporate', 'Management', 'Consulting', 'Sales', 'Product'],
    tags: ['Professional', 'Clean', 'Structured'],
    sectionSet: sections.professional,
    styles: [
      { name: 'Professional Slate', accentColor: '#0f766e', backgroundColor: '#f8fafc', headingColor: '#0f172a', textColor: '#1f2937', fontFamily: fonts.inter },
      { name: 'Professional Navy', accentColor: '#1e40af', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.source },
      { name: 'Professional Emerald', accentColor: '#15803d', backgroundColor: '#ffffff', headingColor: '#14532d', textColor: '#111827', fontFamily: fonts.lato },
      { name: 'Professional Graphite', accentColor: '#374151', backgroundColor: '#f9fafb', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.inter },
      { name: 'Professional Burgundy', accentColor: '#9f1239', backgroundColor: '#fffafa', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.source },
      { name: 'Professional Focus', accentColor: '#0369a1', backgroundColor: '#ffffff', headingColor: '#0f172a', textColor: '#111827', fontFamily: fonts.lato }
    ]
  },
  {
    category: 'Tech',
    isAtsSafe: false,
    layout: 'sidebar-left',
    roleTargets: ['Software Engineer', 'Data Analyst', 'Product Designer', 'DevOps', 'QA Engineer'],
    tags: ['Tech', 'Projects', 'Skills First'],
    sectionSet: sections.professional,
    styles: [
      { name: 'Tech Matrix', accentColor: '#2563eb', backgroundColor: '#f8fafc', headingColor: '#0f172a', textColor: '#111827', fontFamily: fonts.inter },
      { name: 'Tech Mint', accentColor: '#0d9488', backgroundColor: '#f0fdfa', headingColor: '#134e4a', textColor: '#111827', fontFamily: fonts.source },
      { name: 'Tech Mono', accentColor: '#111827', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.system },
      { name: 'Tech Product', accentColor: '#7c3aed', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.inter },
      { name: 'Tech Systems', accentColor: '#0891b2', backgroundColor: '#ecfeff', headingColor: '#164e63', textColor: '#111827', fontFamily: fonts.lato },
      { name: 'Tech Builder', accentColor: '#ea580c', backgroundColor: '#fff7ed', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.source }
    ]
  },
  {
    category: 'Creative',
    isAtsSafe: false,
    layout: 'split',
    roleTargets: ['Designer', 'Marketing', 'Content Creator', 'Photographer', 'Frontend Developer'],
    tags: ['Creative', 'Portfolio', 'Visual'],
    sectionSet: sections.creative,
    styles: [
      { name: 'Creative Coral', accentColor: '#e11d48', backgroundColor: '#fff1f2', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.inter },
      { name: 'Creative Indigo', accentColor: '#4f46e5', backgroundColor: '#eef2ff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.source },
      { name: 'Creative Forest', accentColor: '#166534', backgroundColor: '#f0fdf4', headingColor: '#14532d', textColor: '#111827', fontFamily: fonts.lato },
      { name: 'Creative Amber', accentColor: '#b45309', backgroundColor: '#fffbeb', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.inter },
      { name: 'Creative Rose', accentColor: '#be123c', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.serif },
      { name: 'Creative Studio', accentColor: '#0e7490', backgroundColor: '#ffffff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.source }
    ]
  },
  {
    category: 'Executive',
    isAtsSafe: false,
    layout: 'sidebar-right',
    roleTargets: ['Leadership', 'Founder', 'Director', 'Senior Manager', 'Consultant'],
    tags: ['Executive', 'Leadership', 'Impact'],
    sectionSet: sections.executive,
    styles: [
      { name: 'Executive Classic', accentColor: '#0f172a', backgroundColor: '#ffffff', headingColor: '#020617', textColor: '#111827', fontFamily: fonts.serif },
      { name: 'Executive Blue', accentColor: '#1e3a8a', backgroundColor: '#f8fafc', headingColor: '#0f172a', textColor: '#1f2937', fontFamily: fonts.inter },
      { name: 'Executive Green', accentColor: '#065f46', backgroundColor: '#ffffff', headingColor: '#064e3b', textColor: '#111827', fontFamily: fonts.source },
      { name: 'Executive Copper', accentColor: '#92400e', backgroundColor: '#fffbeb', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.serif },
      { name: 'Executive Minimal', accentColor: '#334155', backgroundColor: '#ffffff', headingColor: '#0f172a', textColor: '#111827', fontFamily: fonts.lato },
      { name: 'Executive Board', accentColor: '#581c87', backgroundColor: '#faf5ff', headingColor: '#111827', textColor: '#1f2937', fontFamily: fonts.inter }
    ]
  }
];

const previewByCategory = {
  ATS: {
    headline: 'Operations Analyst',
    summary: 'Profesional operasional dengan pengalaman menyusun proses kerja, membaca data kinerja, dan mendukung eksekusi proyek lintas tim secara rapi.',
    work: {
      role: 'Operations Analyst',
      company: 'Nusantara Growth Lab',
      highlights: [
        'Menyusun dashboard pelacakan operasional mingguan untuk mempercepat keputusan tim.',
        'Merapikan SOP onboarding sehingga waktu adaptasi anggota baru turun 30%.'
      ]
    },
    project: 'Process Improvement Tracker',
    skills: ['Process Mapping', 'Excel', 'Data Reporting', 'Stakeholder Coordination']
  },
  Professional: {
    headline: 'Product Marketing Specialist',
    summary: 'Spesialis marketing yang menggabungkan riset pasar, positioning produk, dan kampanye digital untuk meningkatkan kualitas akuisisi pelanggan.',
    work: {
      role: 'Product Marketing Specialist',
      company: 'BrightWorks Indonesia',
      highlights: [
        'Meluncurkan kampanye produk B2B yang meningkatkan qualified leads sebesar 42%.',
        'Membuat sales enablement kit untuk membantu tim sales menjelaskan value proposition.'
      ]
    },
    project: 'Customer Persona Refresh',
    skills: ['Market Research', 'Campaign Strategy', 'Copywriting', 'Analytics']
  },
  Tech: {
    headline: 'Full Stack Developer',
    summary: 'Developer yang membangun aplikasi web responsif dengan fokus pada performa, maintainability, API integration, dan pengalaman pengguna yang jelas.',
    work: {
      role: 'Full Stack Developer',
      company: 'KodeKita Studio',
      highlights: [
        'Membangun dashboard React dan Express dengan autentikasi, upload asset, dan PostgreSQL.',
        'Mengoptimalkan bundle dan query API sehingga waktu muat halaman utama lebih cepat 38%.'
      ]
    },
    project: 'Portfolio Builder Platform',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Cloudinary']
  },
  Creative: {
    headline: 'Brand Designer',
    summary: 'Desainer kreatif yang merancang identitas visual, sistem konten, dan pengalaman digital untuk brand yang ingin tampil konsisten dan mudah dikenali.',
    work: {
      role: 'Brand Designer',
      company: 'Studio Aksara',
      highlights: [
        'Mendesain ulang identitas visual UMKM premium untuk memperkuat konsistensi kanal digital.',
        'Membuat template konten sosial yang mempercepat produksi aset kampanye mingguan.'
      ]
    },
    project: 'Visual Identity System',
    skills: ['Brand Identity', 'Figma', 'Art Direction', 'Content Design']
  },
  Executive: {
    headline: 'Business Development Lead',
    summary: 'Pemimpin pengembangan bisnis dengan rekam jejak membangun kemitraan strategis, membaca peluang pasar, dan mengelola target pertumbuhan.',
    work: {
      role: 'Business Development Lead',
      company: 'Aruna Ventures',
      highlights: [
        'Membangun pipeline partnership senilai lebih dari Rp2 miliar dalam dua kuartal.',
        'Memimpin koordinasi proposal strategis untuk klien enterprise lintas industri.'
      ]
    },
    project: 'Strategic Partnership Playbook',
    skills: ['Partnerships', 'Negotiation', 'Revenue Strategy', 'Team Leadership']
  }
};

function createPreviewCv(group, style, index) {
  const source = previewByCategory[group.category] || previewByCategory.ATS;
  const roleTarget = group.roleTargets[index % group.roleTargets.length];
  const fullName = `${roleTarget} Candidate`;
  return {
    personal: {
      fullName,
      headline: source.headline,
      email: 'candidate@example.com',
      phone: '+62 812 3456 7890',
      location: 'Jakarta, Indonesia',
      website: 'https://portfolio.example.com',
      linkedin: 'https://linkedin.com/in/candidate',
      github: group.category === 'Tech' ? 'https://github.com/candidate' : ''
    },
    summary: {
      id: source.summary,
      en: source.summary
    },
    workExperience: [
      {
        role: source.work.role,
        company: source.work.company,
        location: 'Hybrid',
        startDate: '2022',
        endDate: 'Present',
        highlights: source.work.highlights
      }
    ],
    experience: [],
    education: [
      {
        degree: group.category === 'Creative' ? 'Bachelor of Visual Communication Design' : 'Bachelor of Business / Technology',
        institution: 'Universitas Contoh',
        location: 'Indonesia',
        startDate: '2018',
        endDate: '2022',
        gpa: '3.78'
      }
    ],
    skills: [
      {
        category: group.category === 'Tech' ? 'Technical Skills' : 'Core Skills',
        items: source.skills
      }
    ],
    certifications: [
      {
        name: group.isAtsSafe ? 'Professional Communication Certificate' : `${group.category} Excellence Certificate`,
        issuer: 'Learning Hub',
        date: '2024',
        credentialUrl: ''
      }
    ],
    projects: [
      {
        name: source.project,
        role: source.work.role,
        description: group.isAtsSafe
          ? 'Membuat dokumentasi ringkas, metrik hasil, dan alur kerja yang mudah dibaca recruiter.'
          : 'Membangun studi kasus portfolio dengan konteks masalah, proses, hasil, dan dampak bisnis.',
        tech: group.category === 'Tech' ? 'React, Node.js, PostgreSQL' : 'Research, Planning, Delivery',
        link: 'https://portfolio.example.com/project'
      }
    ],
    achievements: [
      {
        title: group.category === 'Executive' ? 'Exceeded annual growth target' : 'Delivered measurable portfolio impact',
        date: '2025',
        description: group.category === 'ATS'
          ? 'Mendokumentasikan dampak kerja dengan angka agar mudah dipindai oleh recruiter dan sistem ATS.'
          : 'Mengubah pekerjaan utama menjadi cerita portfolio yang jelas, terukur, dan mudah dipahami.'
      }
    ],
    references: [
      {
        name: 'Reference Available',
        title: 'Manager',
        company: 'Upon Request',
        contact: 'Available upon request'
      }
    ],
    languageBySection: {
      summary: 'id',
      workExperience: 'id',
      experience: 'id',
      education: 'en',
      skills: 'en',
      certifications: 'en',
      projects: 'id',
      achievements: 'id',
      references: 'en',
      additional: 'id'
    },
    additional: {
      languages: { id: 'Bahasa Indonesia, English', en: 'Indonesian, English' },
      interests: { id: `${style.name}, portfolio storytelling`, en: `${style.name}, portfolio storytelling` },
      awards: { id: '', en: '' },
      volunteer: { id: '', en: '' },
      publications: { id: '', en: '' }
    }
  };
}

const templates = [];
let id = 1;

for (const group of templateGroups) {
  group.styles.forEach((style, index) => {
    templates.push({
      id,
      name: style.name,
      category: group.category,
      layout: group.layout,
      style: {
        accentColor: style.accentColor,
        backgroundColor: style.backgroundColor,
        textColor: style.textColor,
        headingColor: style.headingColor,
        fontFamily: style.fontFamily,
        sectionGap: group.isAtsSafe ? 14 : 20,
        density: group.isAtsSafe ? 'compact' : 'comfortable',
        showPhoto: false,
        showIcons: !group.isAtsSafe,
        pageMargin: group.isAtsSafe ? 36 : 44
      },
      sections: group.sectionSet,
      tags: [...group.tags, group.roleTargets[index % group.roleTargets.length]],
      metadata: {
        seedKey: `template-${id}`,
        isAtsSafe: group.isAtsSafe,
        roleTarget: group.roleTargets[index % group.roleTargets.length],
        recommendedFor: group.isAtsSafe
          ? 'Lamaran kerja dengan sistem ATS dan recruiter screening cepat'
          : 'Portfolio/CV visual untuk dibagikan melalui link atau PDF',
        atsNotes: group.isAtsSafe
          ? ['Single column', 'Standard headings', 'No image', 'No sidebar', 'No decorative icons']
          : ['Gunakan template ATS jika diminta upload ke job portal yang sensitif parsing'],
        previewCv: createPreviewCv(group, style, index),
        previewLabel: `${style.name} preview for ${group.roleTargets[index % group.roleTargets.length]}`
      }
    });
    id += 1;
  });
}

module.exports = templates;
