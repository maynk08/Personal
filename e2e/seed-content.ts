import { e2eConfig } from './e2e-config';

// Portfolio content for the end-to-end run, created through the admin API exactly as the CMS would. Includes hidden
// items, which must never appear on the site.

const API = `http://localhost:${e2eConfig.backendPort}/api/admin`;
const HEALTH = `http://localhost:${e2eConfig.backendPort}/health`;

async function waitForBackend(): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await fetch(HEALTH)).ok) {
        return;
      }
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('The e2e backend did not start');
}

async function call(token: string | null, method: string, path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token === null ? {} : { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${await response.text()}`);
  }
  return ((await response.json()) as { data: unknown }).data;
}

export async function seedContent(): Promise<void> {
  await waitForBackend();
  const { token } = (await call(null, 'POST', '/auth/login', { email: e2eConfig.adminEmail, password: e2eConfig.adminPassword })) as {
    token: string;
  };
  const media = (await call(token, 'GET', '/media?pageSize=100')) as { id: string; fileName: string }[];
  const mediaId = (fileName: string): string => {
    const found = media.find((file) => file.fileName === fileName);
    if (found === undefined) {
      throw new Error(`Seeded media ${fileName} is missing`);
    }
    return found.id;
  };

  await call(token, 'PUT', '/profile', {
    name: 'Ada Lovelace',
    headline: 'Full-stack engineer',
    heroPhrases: ['building fast web apps', 'shipping clean APIs'],
    about: 'I write **clear** software.\n\n- TypeScript\n- Node.js\n\n<script>alert("x")</script>',
    photo: mediaId('ocean.png'),
    resume: mediaId('resume.pdf'),
    socialLinks: [
      { platform: 'github', label: null, url: 'https://github.com/ada', isVisible: true },
      { platform: 'linkedin', label: null, url: 'https://linkedin.com/in/ada', isVisible: true },
      { platform: 'x', label: null, url: 'https://x.com/ada', isVisible: false },
    ],
    location: { value: 'London', isVisible: true },
    publicEmail: { value: 'ada@example.com', isVisible: true },
    isOpenToWork: { value: true, isVisible: true },
    yearsOfExperience: { value: 6, isVisible: true },
    languages: { value: [{ name: 'English', proficiency: 'Native' }], isVisible: false },
  });

  await call(token, 'POST', '/experiences', {
    company: 'Acme',
    role: 'Senior Engineer',
    startDate: '2022-03',
    endDate: null,
    highlights: ['Led the checkout rewrite'],
    techStack: ['TypeScript', 'Node.js'],
    companyLogo: mediaId('forest.png'),
    companyUrl: 'https://acme.example.com',
  });
  await call(token, 'POST', '/experiences', { company: 'Initech', role: 'Engineer', startDate: '2019-01', endDate: '2021-12' });
  await call(token, 'POST', '/experiences', {
    company: 'Hidden Corp',
    role: 'Spy',
    startDate: '2018-01',
    endDate: '2018-06',
    isVisible: false,
  });

  await call(token, 'POST', '/projects', {
    title: 'Portfolio CMS',
    summary: 'The CMS behind this site.',
    role: 'Solo',
    techStack: ['Next.js'],
    description: [
      '## How it works',
      '',
      'Content is saved through the **admin API**.',
      '',
      '```ts',
      'const answer = 42;',
      '```',
      '',
      '<script>alert("x")</script>',
    ].join('\n'),
    coverImage: mediaId('ocean.png'),
    gallery: [mediaId('ocean.png'), mediaId('forest.png')],
    isFeatured: true,
    repoUrl: 'https://github.com/ada/cms',
  });
  await call(token, 'POST', '/projects', { title: 'Weather app', isFeatured: true, liveUrl: 'https://weather.example.com' });
  await call(token, 'POST', '/projects', { title: 'Old project' });
  await call(token, 'POST', '/projects', { title: 'Secret project', isFeatured: true, isVisible: false });

  await call(token, 'POST', '/skill-groups', {
    name: 'Backend',
    skills: [
      { name: 'Node.js', icon: 'nodedotjs', isVisible: true },
      { name: 'MongoDB', icon: 'mongodb', isVisible: true },
      { name: 'Hidden skill', icon: null, isVisible: false },
    ],
  });

  await call(token, 'POST', '/education', {
    institution: 'Open University',
    degree: 'BSc',
    field: 'Computer Science',
    startDate: '2015-09',
    endDate: '2018-06',
    grade: 'First',
  });
  await call(token, 'POST', '/certifications', {
    name: 'Cloud Practitioner',
    issuer: 'AWS',
    issueDate: '2024-01',
    expiryDate: '2099-01',
    credentialUrl: 'https://example.com/cred',
  });
  await call(token, 'POST', '/certifications', { name: 'Old Cert', issuer: 'Acme Academy', issueDate: '2019-01', expiryDate: '2021-01' });

  process.stdout.write('E2E content seeded\n');
}
