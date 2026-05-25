const fs = require('fs');
const path = require('path');

const base = (process.env.BASE_URL || process.env.VERIFY_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const email = process.env.TEST_EMAIL || process.env.SEED_DEMO_EMAIL || '';
const password = process.env.TEST_PASSWORD || process.env.SEED_DEMO_PASSWORD || '';
const imagePath = process.env.TEST_IMAGE_PATH || '';
const cvPath = process.env.TEST_CV_PATH || '';

const results = [];
let cookieJar = '';
let token = '';

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const icon = ok ? 'PASS' : 'FAIL';
  console.log(`${icon} ${name}${detail ? ` - ${detail}` : ''}`);
}

function mergeCookies(res) {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return;
  const values = setCookie.split(/,(?=[^;,]+=)/).map((value) => value.split(';')[0]);
  const jar = new Map(cookieJar.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    const [name, ...rest] = part.split('=');
    return [name, rest.join('=')];
  }));
  for (const value of values) {
    const [name, ...rest] = value.split('=');
    jar.set(name.trim(), rest.join('='));
  }
  cookieJar = [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function request(label, url, options = {}, expected = [200]) {
  const headers = {
    ...(options.headers || {})
  };
  if (cookieJar) headers.Cookie = cookieJar;
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${url}`, { ...options, headers });
  mergeCookies(res);
  const data = await res.json().catch(() => ({}));
  if (!expected.includes(res.status)) {
    throw new Error(`${label} returned ${res.status}: ${JSON.stringify(data)}`);
  }
  return { res, data };
}

async function testPublicHealth() {
  await request('healthz', '/healthz');
  record('healthz', true);
  await request('readyz', '/readyz');
  record('readyz', true);
}

async function testTemplates() {
  const { data } = await request('templates', '/templates');
  if (!Array.isArray(data) || data.length < 30) throw new Error(`expected at least 30 templates, got ${Array.isArray(data) ? data.length : 'non-array'}`);
  const atsSafe = data.filter((item) => item.metadata?.isAtsSafe);
  if (atsSafe.length < 6) throw new Error('ATS-safe template metadata missing');
  record('templates seed and metadata', true, `${data.length} templates`);
}

async function testAiParser() {
  const cvText = [
    'Yogi Aprio',
    'Frontend Developer',
    'yogi@example.com',
    'Summary',
    'Builds responsive portfolio applications.',
    'Work Experience',
    'Frontend Developer - Studio Digital 2022 - Present',
    '- Built reusable React components',
    'Education',
    'S1 Informatika, Universitas Contoh 2018 - 2022',
    'Skills',
    'React, Node.js, PostgreSQL',
    'Projects',
    'Portfolio Builder',
    '- CV builder with templates and upload'
  ].join('\n');

  const { data } = await request('ai parse', '/ai/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: cvText })
  });
  if (!data.cv?.personal?.fullName || !Array.isArray(data.cv.skills) || !data.cv.skills.length) {
    throw new Error('AI parser returned incomplete CV structure');
  }
  record('ai parser', true, data.provider || 'unknown provider');
}

async function loginIfConfigured() {
  if (!email || !password) {
    record('auth login', true, 'skipped, TEST_EMAIL/TEST_PASSWORD not provided');
    return false;
  }

  const { data } = await request('login', '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!data.token) throw new Error('login did not return token');
  token = data.token;
  record('auth login', true, email);

  const refresh = await request('refresh', '/auth/refresh', { method: 'POST' });
  if (!refresh.data.token) throw new Error('refresh did not return token');
  token = refresh.data.token;
  record('auth refresh', true);
  return true;
}

async function testPortfolioCrud() {
  const create = await request('portfolio item create', '/api/portfolios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Verification Project',
      description: 'Created by backend verification suite.',
      project_url: 'https://example.com'
    })
  }, [201]);
  const id = create.data.id;
  if (!id) throw new Error('created portfolio item has no id');

  const update = await request('portfolio item update', `/api/portfolios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Verification Project Updated' })
  });
  if (update.data.title !== 'Verification Project Updated') throw new Error('portfolio update mismatch');

  await request('my portfolio list', '/api/my/portfolios?limit=5');
  await request('portfolio item delete', `/api/portfolios/${id}`, { method: 'DELETE' });
  record('portfolio CRUD', true);
}

function mimeFor(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

async function appendFile(form, fieldName, filepath) {
  const absolute = path.resolve(filepath);
  const buffer = fs.readFileSync(absolute);
  const file = new Blob([buffer], { type: mimeFor(absolute) });
  form.append(fieldName, file, path.basename(absolute));
}

async function testImageUpload() {
  if (!imagePath) {
    record('image upload', true, 'skipped, TEST_IMAGE_PATH not provided');
    return;
  }
  const form = new FormData();
  await appendFile(form, 'image', imagePath);
  const { data } = await request('image upload', '/upload/image', {
    method: 'POST',
    body: form
  }, [201]);
  if (!data.url) throw new Error('upload did not return url');
  record('image upload', true, data.provider || 'unknown provider');
}

async function testCvUpload() {
  if (!cvPath) {
    record('cv upload', true, 'skipped, TEST_CV_PATH not provided');
    return;
  }
  const form = new FormData();
  await appendFile(form, 'cv', cvPath);
  const { data } = await request('cv upload', '/upload/cv', {
    method: 'POST',
    body: form
  });
  if (!data.cv && !data.data) throw new Error('cv upload returned incomplete data');
  record('cv upload', true, data.provider || 'parser');
}

async function main() {
  try {
    await testPublicHealth();
    await testTemplates();
    await testAiParser();
    const authenticated = await loginIfConfigured();
    if (authenticated) {
      await testPortfolioCrud();
      await testImageUpload();
      await testCvUpload();
      await request('logout', '/auth/logout', { method: 'POST' });
      record('auth logout', true);
    } else {
      record('authenticated flows', true, 'skipped');
    }

    const failed = results.filter((result) => !result.ok);
    if (failed.length) process.exit(1);
    console.log(`Backend verification passed against ${base}`);
    process.exit(0);
  } catch (err) {
    record('verification suite', false, err.message);
    process.exit(1);
  }
}

main();
