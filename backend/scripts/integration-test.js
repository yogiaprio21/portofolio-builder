const base = process.env.BASE_URL || 'http://localhost:3001';

async function json(res) {
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function registerAndLogin() {
  const email = `user${Date.now()}@example.com`;
  const password = 'Str0ngP@ss!';
  const reg = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const regJ = await json(reg);
  if (!regJ.ok) throw new Error(`register failed: ${regJ.status} ${JSON.stringify(regJ.data)}`);
  const verifyUrl = regJ.data.verification_url;
  if (!verifyUrl) throw new Error('no verification_url');
  const verify = await fetch(verifyUrl);
  const verifyJ = await json(verify);
  if (!verifyJ.ok) throw new Error(`verify failed: ${verifyJ.status} ${JSON.stringify(verifyJ.data)}`);
  const login = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginJ = await json(login);
  if (!loginJ.ok) throw new Error(`login failed: ${loginJ.status} ${JSON.stringify(loginJ.data)}`);
  return loginJ.data.token;
}

async function testPortfolioItemCRUD(token) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const create = await fetch(`${base}/api/portfolios`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'My App', description: 'Desc', project_url: 'https://example.com' })
  });
  const createJ = await json(create);
  if (!createJ.ok || !createJ.data.id) throw new Error(`create item failed: ${createJ.status} ${JSON.stringify(createJ.data)}`);
  const id = createJ.data.id;
  const get = await fetch(`${base}/api/portfolios/${id}`);
  const getJ = await json(get);
  if (!getJ.ok || getJ.data.title !== 'My App') throw new Error('get item mismatch');
  const update = await fetch(`${base}/api/portfolios/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ title: 'My App V2' })
  });
  const updateJ = await json(update);
  if (!updateJ.ok || updateJ.data.title !== 'My App V2') throw new Error('update item mismatch');
  const del = await fetch(`${base}/api/portfolios/${id}`, { method: 'DELETE', headers });
  const delJ = await json(del);
  if (!delJ.ok || !delJ.data.success) throw new Error('delete item failed');
}

async function testCvCreate(token) {
  const payload = {
    cv: {
      personal: { fullName: 'Nama', email: 'nama@example.com' },
      summary: { id: 'Ringkas', en: 'Brief' },
      workExperience: [{ role: { id: 'Dev' }, company: { id: 'ACME' }, startDate: '2020', endDate: '2021', highlights: ['A'] }],
      education: [{ degree: { id: 'S1' }, institution: { id: 'UI' }, startDate: '2016', endDate: '2020' }],
      skills: [{ category: { id: 'Tech' }, items: ['React', 'Node'] }],
      languageBySection: { summary: 'id', workExperience: 'id' },
      additional: { languages: { id: 'ID,EN' } }
    },
    templateId: 1,
    theme: { layout: 'single' },
    sectionsOrder: ['summary', 'workExperience', 'education', 'skills']
  };
  const create = await fetch(`${base}/portfolios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const createJ = await json(create);
  if (!createJ.ok || !createJ.data.id) throw new Error(`create cv failed: ${createJ.status} ${JSON.stringify(createJ.data)}`);
  const id = createJ.data.id;
  const get = await fetch(`${base}/portfolios/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const getJ = await json(get);
  if (!getJ.ok) throw new Error('get cv failed');
  const cv = getJ.data.cv || {};
  if (!Array.isArray(cv.workExperience) || cv.workExperience.length === 0) throw new Error('workExperience missing');
  if (!cv.summary) throw new Error('summary missing');
  if (!Array.isArray(cv.skills)) throw new Error('skills missing');
}

async function main() {
  try {
    const token = await registerAndLogin();
    await testPortfolioItemCRUD(token);
    await testCvCreate(token);
    console.log('Integration tests passed');
    process.exit(0);
  } catch (err) {
    console.error('Integration tests failed:', err);
    process.exit(1);
  }
}

main();
