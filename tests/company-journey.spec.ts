import path from 'path';
import type { Page, Route } from '@playwright/test';
import { encode as encodeJwt } from 'next-auth/jwt';
import { test, expect } from './fixtures';

const MEDIA_FIXTURE = path.resolve(process.cwd(), 'tests/assets/sample-resume.pdf');

type UserRole = 'Company' | 'CPSK' | 'Visitor';

type CompanySessionUser = {
  name: string;
  email: string;
};

type CompanySessionAccount = {
  id?: string;
  email?: string | null;
  tel?: string | null;
  username?: string | null;
};

type CompanySessionBackendUser = {
  id?: string | number;
  role: UserRole;
  name?: string | null;
  overview?: string | null;
  industry?: string | null;
  size?: string | null;
  verified_status?: 'Verified' | 'Pending' | 'Unverified' | null;
  company?: Record<string, unknown> | null;
  User?: CompanySessionAccount | null;
  user?: CompanySessionAccount | null;
  program?: string | null;
};

type CompanySessionState = {
  user: CompanySessionUser;
  backendToken: string | null;
  backendUser: CompanySessionBackendUser;
  role: UserRole;
  isRegistered: boolean;
  expires: string;
};

type CompanySessionOverride = Partial<Omit<CompanySessionState, 'user' | 'backendUser'>> & {
  user?: Partial<CompanySessionUser>;
  backendUser?: Partial<CompanySessionBackendUser>;
};

const mergeSessionState = (
  session: CompanySessionState,
  patch?: CompanySessionOverride
): CompanySessionState => {
  if (!patch) return session;

  const nextCompany = {
    ...((session.backendUser.company as Record<string, unknown> | undefined) ?? {}),
    ...((patch.backendUser?.company as Record<string, unknown> | undefined) ?? {}),
  };

  return {
    ...session,
    ...patch,
    user: { ...session.user, ...(patch.user ?? {}) },
    backendUser: {
      ...session.backendUser,
      ...(patch.backendUser ?? {}),
      company: Object.keys(nextCompany).length > 0 ? nextCompany : session.backendUser.company,
      User: {
        ...(session.backendUser.User ?? {}),
        ...(patch.backendUser?.User ?? {}),
      },
      user: {
        ...(session.backendUser.user ?? {}),
        ...(patch.backendUser?.user ?? {}),
      },
    },
  };
};

const createCompanySessionState = (overrides: CompanySessionOverride = {}): CompanySessionState => {
  const base: CompanySessionState = {
    user: {
      name: 'Olivia Owner',
      email: 'owner@ocs-global.test',
    },
    backendToken: 'mock-company-token',
    backendUser: {
      id: 'comp-123',
      role: 'Company',
      name: 'OCS Global',
      overview: 'Default test company',
      industry: 'technology',
      size: '51-200 employees',
      verified_status: 'Verified',
      company: {
        id: 'comp-123',
        verified_status: 'Verified',
      },
      User: {
        id: 'company-user-1',
        email: 'owner@ocs-global.test',
        tel: '0812345678',
        username: 'ocs.global',
      },
    },
    role: 'Company',
    isRegistered: true,
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  return mergeSessionState(base, overrides);
};

const mapAccount = (account?: CompanySessionAccount | null) =>
  account
    ? {
        ...account,
        tel: account.tel ?? undefined,
        email: account.email ?? undefined,
        username: account.username ?? undefined,
        ID: undefined,
        CreatedAt: undefined,
        UpdatedAt: undefined,
        DeletedAt: undefined,
        profile_picture: undefined,
      }
    : undefined;

const encodeCompanySessionToken = async (session: CompanySessionState): Promise<string> => {
  const secret = process.env.NEXTAUTH_SECRET ?? 'dev-secret-key-change-in-production';
  const backendUserPayload = {
    ...session.backendUser,
    User: mapAccount(session.backendUser.User),
    user: mapAccount(session.backendUser.user),
  };
  return await encodeJwt({
    token: {
      name: session.user.name,
      email: session.user.email,
      backendToken: session.backendToken || undefined,
      backendUser: backendUserPayload,
      role: session.role,
      isRegistered: session.isRegistered,
      sub: session.backendUser.id ? String(session.backendUser.id) : undefined,
    },
    secret,
    maxAge: 60 * 60,
  });
};

const setupCompanySession = async (page: Page, overrides?: CompanySessionOverride) => {
  let sessionState = createCompanySessionState(overrides);

  const applySessionCookie = async () => {
    const tokenValue = await encodeCompanySessionToken(sessionState);
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: tokenValue,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
      },
    ]);
  };

  await applySessionCookie();

  await page.route('**/api/auth/session**', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      const body = route.request().postData();
      if (body) {
        try {
          const payload = JSON.parse(body);
          const patch = payload?.data ?? payload;
          sessionState = mergeSessionState(sessionState, patch);
          await applySessionCookie();
        } catch (error) {
          console.warn('Failed to merge session patch', error);
        }
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sessionState),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionState),
    });
  });

  return {
    async set(patch: CompanySessionOverride) {
      sessionState = mergeSessionState(sessionState, patch);
      await applySessionCookie();
    },
    get() {
      return sessionState;
    },
  };
};

type CompanyUserAccount = {
  id: string;
  email: string;
  tel: string;
  username: string;
};

type CompanyJobApplicationRecord = {
  id: number;
  post_id: number;
  cpsk_id: string;
  cpsk_user: {
    first_name: string;
    last_name: string;
    program: string;
    year: string;
    resume_id: number;
    soft_skill: string[];
    user: {
      id: string;
      email: string;
      tel: string;
    };
  };
  answer: {
    expected_salary: string;
    programming_languages: string[];
    right_to_work: string;
    year_of_experience: number;
  };
  status: string;
  applied_at: string;
  resume_id: number;
};

type CompanyJobRecord = {
  id: number;
  company_id: string;
  title: string;
  desc: string;
  exp_lvl: string;
  location: string;
  type: string;
  req: string;
  salary?: string;
  tags: string[];
  post_time: string;
  expiring: string;
  applications: CompanyJobApplicationRecord[];
  default_form?: boolean;
  optional_forms?: string[];
};

type CompanyProfileRecord = {
  id: string;
  name: string;
  overview: string;
  industry: string;
  size: string;
  location: string;
  email: string;
  tel: string;
  verified_status: 'Verified' | 'Pending' | 'Unverified';
  banner_id?: number;
  logo_id?: number;
  job_post: CompanyJobRecord[];
  User: CompanyUserAccount;
  user?: CompanyUserAccount;
};

type StoredFile = {
  buffer: Buffer;
  contentType: string;
};

type CompanyBackendState = {
  ownerCompanyId: string;
  companies: Record<string, CompanyProfileRecord>;
  files: Record<number, StoredFile>;
  nextFileId: number;
  nextJobId: number;
};

const buildDefaultCompany = (): CompanyProfileRecord => {
  const ownerAccount: CompanyUserAccount = {
    id: 'company-user-1',
    email: 'owner@ocs-global.test',
    tel: '0812345678',
    username: 'ocs.global',
  };

  const defaultApplications: CompanyJobApplicationRecord[] = [
    {
      id: 8001,
      post_id: 101,
      cpsk_id: 'cpsk-applicant-1',
      cpsk_user: {
        first_name: 'Casey',
        last_name: 'Candidate',
        program: 'CPE',
        year: 'Year 4',
        resume_id: 7001,
        soft_skill: ['Teamwork', 'Problem Solving'],
        user: {
          id: 'user-cpsk-1',
          email: 'casey.candidate@test.com',
          tel: '0800000000',
        },
      },
      answer: {
        expected_salary: '30,000-50,000 THB',
        programming_languages: ['TypeScript', 'Python'],
        right_to_work: 'I am a Thai citizen',
        year_of_experience: 3,
      },
      status: 'Pending',
      applied_at: new Date('2025-01-05').toISOString(),
      resume_id: 7001,
    },
  ];

  const jobOne: CompanyJobRecord = {
    id: 101,
    company_id: 'comp-123',
    title: 'Frontend Engineer',
    desc: 'Build and iterate on delightful candidate experiences.',
    exp_lvl: 'Mid-Level',
    location: 'Bangkok, Thailand',
    type: 'Hybrid',
    req: 'React, TypeScript, UI testing',
    salary: '50,000 - 70,000 THB',
    tags: ['Frontend', 'React', 'TypeScript'],
    post_time: new Date('2025-01-01').toISOString(),
    expiring: '',
    applications: defaultApplications,
    default_form: true,
    optional_forms: [],
  };

  const jobTwo: CompanyJobRecord = {
    id: 102,
    company_id: 'comp-123',
    title: 'Backend Engineer',
    desc: 'Scale the hiring platform services and APIs.',
    exp_lvl: 'Senior',
    location: 'Bangkok, Thailand',
    type: 'Onsite',
    req: 'Go, PostgreSQL, Clean architecture',
    salary: '70,000 - 90,000 THB',
    tags: ['Backend', 'Go', 'PostgreSQL'],
    post_time: new Date('2025-01-10').toISOString(),
    expiring: new Date('2025-02-10').toISOString(),
    applications: [],
    default_form: true,
    optional_forms: [],
  };

  return {
    id: 'comp-123',
    name: 'OCS Global',
    overview: 'Leading digital talent platform for CPSK students.',
    industry: 'Technology',
    size: '51-200 employees',
    location: 'Bangkok, Thailand',
    email: 'hr@ocs-global.test',
    tel: '0812345678',
    verified_status: 'Verified',
    banner_id: 9201,
    logo_id: 9101,
    job_post: [jobOne, jobTwo],
    User: ownerAccount,
    user: ownerAccount,
  };
};

const createCompanyBackendState = (
  overrides: Partial<CompanyBackendState> = {}
): CompanyBackendState => {
  const defaultCompany = buildDefaultCompany();
  const baseFiles: Record<number, StoredFile> = {
    9101: { buffer: Buffer.from('PNG_LOGO'), contentType: 'image/png' },
    9201: { buffer: Buffer.from('PNG_BANNER'), contentType: 'image/png' },
    7001: { buffer: Buffer.from('%PDF RESUME%'), contentType: 'application/pdf' },
  };

  const companies = overrides.companies ?? { [defaultCompany.id]: defaultCompany };
  const jobIds = Object.values(companies)
    .flatMap((company) => company.job_post?.map((job) => job.id) ?? [])
    .filter((id): id is number => typeof id === 'number');

  return {
    ownerCompanyId: overrides.ownerCompanyId ?? defaultCompany.id,
    companies,
    files: { ...baseFiles, ...(overrides.files ?? {}) },
    nextFileId: overrides.nextFileId ?? 9500,
    nextJobId: overrides.nextJobId ?? (jobIds.length ? Math.max(...jobIds) + 1 : 1001),
  };
};

type BackendOptions = {
  aiVerifyMode?: 'success' | 'failure';
};

const escapeRegex = (value: string) => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

const setupCompanyBackend = async (
  page: Page,
  backend: CompanyBackendState,
  options: BackendOptions = {}
) => {
  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://hirememaybe-backend.onrender.com/api/v1'
  ).replace(/\/$/, '');
  const escapedBase = escapeRegex(backendBase);

  const fulfillJson = (route: Route, payload: unknown, status = 200) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });

  const getOwnerCompany = () => backend.companies[backend.ownerCompanyId];

  const respondWithCompany = (route: Route, companyId: string) => {
    const company = backend.companies[companyId];
    if (!company) {
      return fulfillJson(route, { error: 'Company not found' }, 404);
    }
    return fulfillJson(route, company);
  };

  await page.route(new RegExp(`${escapedBase}/company/myprofile`), (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    return respondWithCompany(route, backend.ownerCompanyId);
  });

  await page.route(new RegExp(`${escapedBase}/company/profile$`), async (route) => {
    const method = route.request().method();
    if (method === 'PATCH') {
      const body = route.request().postData();
      const parsed = body ? JSON.parse(body) : {};
      const company = getOwnerCompany();
      Object.assign(company, {
        name: parsed.name ?? company.name,
        overview: parsed.overview ?? company.overview,
        industry: parsed.industry ?? company.industry,
        size: parsed.size ?? company.size,
        tel: parsed.tel ?? company.tel,
        email: parsed.email ?? company.email,
      });
      backend.companies[company.id] = company;
      return fulfillJson(route, company);
    }
    if (method === 'GET') {
      return respondWithCompany(route, backend.ownerCompanyId);
    }
    return route.continue();
  });

  await page.route(new RegExp(`${escapedBase}/company/profile/(logo|banner)`), (route) => {
    const company = getOwnerCompany();
    const fileId = backend.nextFileId++;
    backend.files[fileId] = { buffer: Buffer.from('UPLOAD'), contentType: 'image/png' };
    if (route.request().url().includes('/logo')) {
      company.logo_id = fileId;
    } else {
      company.banner_id = fileId;
    }
    backend.companies[company.id] = company;
    return fulfillJson(route, company);
  });

  await page.route(new RegExp(`${escapedBase}/company/ai-verify`), (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue();
    }

    if (options.aiVerifyMode === 'failure') {
      return fulfillJson(route, { error: 'AI temporarily unavailable' }, 500);
    }

    const company = getOwnerCompany();
    company.verified_status = 'Verified';
    backend.companies[company.id] = company;
    return fulfillJson(route, {
      ai_decision: 'Verified',
      confidence: '0.94',
      reasoning: 'Documents matched',
      company,
    });
  });

  await page.route(
    new RegExp(`${escapedBase}/company/(?!myprofile|profile|ai-verify)([^/?]+)`),
    (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      const match = route
        .request()
        .url()
        .match(/\/company\/([^/?]+)/);
      const companyId = match?.[1];
      if (!companyId) {
        return fulfillJson(route, { error: 'Company not found' }, 404);
      }
      return respondWithCompany(route, companyId);
    }
  );

  const jobCollectionRegex = new RegExp(`${escapedBase}/jobpost(?:\\?.*)?$`);
  await page.route(jobCollectionRegex, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const jobs = Object.values(backend.companies).flatMap((company) => company.job_post ?? []);
      return fulfillJson(route, jobs);
    }

    if (method === 'POST') {
      const body = route.request().postData();
      const parsed = body ? JSON.parse(body) : {};
      const company = getOwnerCompany();
      const newJob: CompanyJobRecord = {
        id: backend.nextJobId++,
        company_id: company.id,
        title: parsed.title ?? 'Untitled Role',
        desc: parsed.desc ?? '',
        exp_lvl: parsed.exp_lvl ?? '',
        location: parsed.location ?? '',
        type: parsed.type ?? 'Onsite',
        req: parsed.req ?? '',
        salary: parsed.salary,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        post_time: new Date().toISOString(),
        expiring: parsed.expiring ?? new Date(Date.now() + 7 * 86400000).toISOString(),
        applications: [],
        default_form: Boolean(parsed.default_form),
        optional_forms: parsed.optional_forms ?? [],
      };
      company.job_post.push(newJob);
      backend.companies[company.id] = company;
      return fulfillJson(route, {
        id: newJob.id,
        title: newJob.title,
        desc: newJob.desc,
        exp_lvl: newJob.exp_lvl,
        location: newJob.location,
        type: newJob.type,
        req: newJob.req,
        salary: newJob.salary,
        tags: newJob.tags,
      });
    }

    return route.continue();
  });

  const jobDetailRegex = new RegExp(`${escapedBase}/jobpost/(\\d+)`);
  await page.route(jobDetailRegex, (route) => {
    const match = route
      .request()
      .url()
      .match(/\/jobpost\/(\d+)/);
    const jobId = match ? Number(match[1]) : null;
    if (!jobId) {
      return fulfillJson(route, { error: 'Job not found' }, 404);
    }

    const findJob = () => {
      for (const company of Object.values(backend.companies)) {
        const job = company.job_post.find((entry) => entry.id === jobId);
        if (job) {
          return { company, job };
        }
      }
      return null;
    };

    const located = findJob();
    if (!located) {
      return fulfillJson(route, { error: 'Job not found' }, 404);
    }

    const { company, job } = located;
    const method = route.request().method();

    if (method === 'GET') {
      return fulfillJson(route, {
        ...job,
        company_user: {
          id: company.id,
          name: company.name,
          industry: company.industry,
          size: company.size,
          logo_id: company.logo_id,
          banner_id: company.banner_id,
          verified_status: company.verified_status,
        },
      });
    }

    if (method === 'PATCH') {
      const body = route.request().postData();
      const parsed = body ? JSON.parse(body) : {};
      Object.assign(job, {
        title: parsed.title ?? job.title,
        desc: parsed.desc ?? job.desc,
        exp_lvl: parsed.exp_lvl ?? job.exp_lvl,
        location: parsed.location ?? job.location,
        type: parsed.type ?? job.type,
        req: parsed.req ?? job.req,
        salary: parsed.salary ?? job.salary,
        tags: Array.isArray(parsed.tags) ? parsed.tags : job.tags,
        expiring: parsed.expiring ?? job.expiring,
      });
      return fulfillJson(route, job);
    }

    if (method === 'DELETE') {
      company.job_post = company.job_post.filter((entry) => entry.id !== jobId);
      backend.companies[company.id] = company;
      return fulfillJson(route, { message: 'deleted' });
    }

    return route.continue();
  });

  await page.route(new RegExp(`${escapedBase}/file/(\\d+)`), (route) => {
    const match = route
      .request()
      .url()
      .match(/\/file\/(\d+)/);
    const fileId = match ? Number(match[1]) : null;
    const file = fileId ? backend.files[fileId] : undefined;

    if (!file) {
      return route.fulfill({ status: 404, body: 'Not found' });
    }

    return route.fulfill({
      status: 200,
      headers: { 'Content-Type': file.contentType },
      body: file.buffer,
    });
  });
};

const fetchSession = async (page: Page) => {
  return page.evaluate(async () => {
    const res = await fetch('/api/auth/session');
    return res.json();
  });
};

const futureDateTimeInput = (daysAhead = 3) => {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

test.describe('@company journey', () => {
  test.skip('CMP-01 Google sign-in as company redirects unfinished profiles to registration', async ({
    page,
    landingPage,
  }) => {
    await landingPage.navigate();
    await page.locator('#login-section').first().scrollIntoViewIfNeeded();
    await landingPage.clickCompanyCard();

    const googleButton = page.getByRole('button', { name: /continue with google/i });
    await expect(googleButton).toBeVisible();

    const oauthNavigation = page.waitForEvent(
      'framenavigated',
      (frame) => frame === page.mainFrame() && frame.url().startsWith('https://accounts.google.com')
    );
    await googleButton.click();
    await oauthNavigation;
    await page.goBack();

    const oauthState = JSON.stringify({ role: 'Company', random: 'cmp-01' });
    await page.route('**/api/auth/forward-code', (route) => {
      const raw = route.request().postData();
      const payload = raw ? (JSON.parse(raw) as { code: string; selectedRole?: string }) : null;
      expect(payload?.code).toBe('cmp-oauth-code');
      expect(payload?.selectedRole).toBe('Company');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            access_token: 'cmp-oauth-token',
            user: { id: 'comp-oauth', role: 'Company', verified_status: 'Unverified' },
          },
        }),
      });
    });

    await page.goto(`/auth/callback?code=cmp-oauth-code&state=${encodeURIComponent(oauthState)}`);
    await page.waitForURL('**/company-register');

    await expect
      .poll(async () => {
        const session = await fetchSession(page);
        return session?.backendUser?.role;
      })
      .toBe('Company');

    const session = await fetchSession(page);
    expect(session.backendUser?.verified_status).toBe('Unverified');
    expect(session.isRegistered).toBeFalsy();
  });

  test.skip('CMP-02 Company registration handles AI fallback path', async ({
    page,
    companyRegisterPage,
  }) => {
    const backendState = createCompanyBackendState();
    await setupCompanyBackend(page, backendState, { aiVerifyMode: 'failure' });
    const companyId = backendState.ownerCompanyId;

    await setupCompanySession(page, {
      isRegistered: false,
      backendUser: {
        id: companyId,
        name: '',
        role: 'Company',
        verified_status: 'Pending',
        company: { id: companyId, verified_status: 'Pending' },
      },
    });

    await companyRegisterPage.navigate();
    await companyRegisterPage.fillRegistrationForm({
      companyName: 'Fallback Robotics',
      email: 'owner@fallback.com',
      phone: '0812345678',
      industry: 'Technology',
      companySize: '51-200 employees',
      overview: 'Testing fallback verification behavior.',
      logoPath: MEDIA_FIXTURE,
      bannerUpload: MEDIA_FIXTURE,
    });

    await companyRegisterPage.submit();
    await expect(companyRegisterPage.successDialog).toBeVisible();
    await expect(companyRegisterPage.successDialog).toContainText(
      'Verification will be completed soon'
    );

    const redirectPromise = page.waitForURL('**/unverify');
    await companyRegisterPage.successDialog
      .getByRole('button', { name: /close|continue/i })
      .first()
      .click();
    await redirectPromise;

    const session = await fetchSession(page);
    expect(session.backendUser?.verified_status).toBe('Unverified');
    await expect(page.getByRole('heading', { name: /company not verified/i })).toBeVisible();
  });

  test('CMP-03 Verified registration routes owner to company profile view', async ({
    page,
    companyRegisterPage,
    companyProfilePage,
  }) => {
    const backendState = createCompanyBackendState();
    await setupCompanyBackend(page, backendState, { aiVerifyMode: 'success' });
    const companyId = backendState.ownerCompanyId;

    const companySession = await setupCompanySession(page, {
      isRegistered: false,
      backendUser: {
        id: companyId,
        name: '',
        role: 'Company',
        verified_status: 'Pending',
        company: { id: companyId, verified_status: 'Pending' },
      },
    });

    await companyRegisterPage.navigate();
    await companyRegisterPage.fillRegistrationForm({
      companyName: 'Atlas Labs',
      email: 'owner@atlaslabs.test',
      phone: '0819997777',
      industry: 'Technology',
      companySize: '51-200 employees',
      overview: 'Automation first laboratory.',
      logoPath: MEDIA_FIXTURE,
      bannerUpload: MEDIA_FIXTURE,
    });

    await companyRegisterPage.submit();
    await expect(companyRegisterPage.successDialog).toBeVisible();
    await expect(companyRegisterPage.successDialog).toContainText('Verification status: Verified');

    await companySession.set({
      isRegistered: true,
      role: 'Company',
      backendUser: {
        id: companyId,
        name: 'Atlas Labs',
        role: 'Company',
        verified_status: 'Verified',
        company: { id: companyId, verified_status: 'Verified' },
      },
    });

    const redirectPromise = page.waitForURL(`**/company/${companyId}`);
    await companyRegisterPage.successCloseButton.click();
    await redirectPromise;

    await companyProfilePage.navigate(companyId, 'owner');
    await expect(companyProfilePage.jobOpeningsSection).toBeVisible();
    await expect(companyProfilePage.getPostNewJobButton()).toBeVisible();
    await expect(companyProfilePage.getEditProfileButton()).toBeVisible();

    const session = await fetchSession(page);
    expect(session.isRegistered).toBeTruthy();
    expect(session.backendUser?.verified_status).toBe('Verified');
  });

  test('CMP-04 Post new job shows up on job post detail and owner dashboard', async ({
    page,
    jobPostPage,
    companyProfilePage,
  }) => {
    const backendState = createCompanyBackendState();
    await setupCompanyBackend(page, backendState, { aiVerifyMode: 'success' });
    const companyId = backendState.ownerCompanyId;

    const company = backendState.companies[companyId];
    await setupCompanySession(page, {
      backendUser: {
        id: companyId,
        name: company.name,
        role: 'Company',
        verified_status: 'Verified',
        company: { id: companyId, verified_status: 'Verified' },
      },
    });

    await jobPostPage.navigate();

    const jobTitle = 'AI Reliability Engineer';
    await jobPostPage.fillJobPostForm({
      openingPosition: jobTitle,
      description: 'Own evaluation plans for ML safety.',
      requirements: 'Python, TensorFlow, incident response.',
      workLocation: 'Remote in Thailand',
      hiringType: 'Remote',
      salary: '80,000 - 120,000',
      experienceLevel: 'Senior',
      tags: ['AI', 'Safety'],
      expiringTime: futureDateTimeInput(5),
      includeDefaultForm: true,
    });

    await jobPostPage.submitButton.click();
    await page.waitForURL('**/job-post/*');
    await expect(page.getByRole('heading', { name: jobTitle })).toBeVisible();

    await companyProfilePage.navigate(companyId, 'owner');
    await expect(companyProfilePage.jobOpeningsSection).toBeVisible();
    const newJobCard = companyProfilePage.jobCards.filter({ hasText: jobTitle });
    await expect(newJobCard.first()).toBeVisible();
  });

  test('CMP-05 Edit job flow persists after forced reload', async ({
    page,
    companyProfilePage,
  }) => {
    const backendState = createCompanyBackendState();
    await setupCompanyBackend(page, backendState);
    const companyId = backendState.ownerCompanyId;
    const company = backendState.companies[companyId];

    await setupCompanySession(page, {
      backendUser: {
        id: companyId,
        name: company.name,
        role: 'Company',
        verified_status: company.verified_status,
        company: { id: companyId, verified_status: company.verified_status },
      },
    });

    await companyProfilePage.navigate(companyId, 'owner');
    await expect(companyProfilePage.jobOpeningsSection).toBeVisible();

    // Wait for job cards to be fully loaded
    await expect(companyProfilePage.jobCards.first()).toBeVisible();

    const targetCard = companyProfilePage.getJobCard(0);
    await expect(targetCard).toBeVisible();

    const editButton = companyProfilePage.getEditJobButton(targetCard);
    await expect(editButton).toBeVisible();
    await editButton.click();

    const dialog = page.getByRole('dialog', { name: /edit job post/i });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Opening Position/i).fill('Principal Frontend Engineer');
    await dialog.getByLabel(/Description/i).fill('Drive design systems for hiring teams.');
    await dialog.getByLabel(/Requirements/i).fill('8+ years of frontend experience.');
    await dialog.getByLabel(/Work Location/i).fill('Bangkok or Remote');
    const hiringSelect = dialog
      .locator('label', { hasText: /Hiring Type/i })
      .locator('..')
      .locator('[data-slot="select-trigger"]')
      .first();
    await hiringSelect.click();
    await page.getByRole('option', { name: 'Hybrid', exact: true }).click();
    const experienceSelect = dialog
      .locator('label', { hasText: /Experience Level/i })
      .locator('..')
      .locator('[data-slot="select-trigger"]')
      .first();
    await experienceSelect.click();
    await page.getByRole('option', { name: 'Senior', exact: true }).click();

    const updateButton = dialog.getByRole('button', { name: /update job post/i });
    await updateButton.click();

    const successDialogHeading = page
      .getByRole('dialog', { name: /job updated successfully/i })
      .getByRole('heading', { name: /job updated successfully/i })
      .first();
    await expect(successDialogHeading).toBeVisible();
    const reloadPromise = page.waitForNavigation();
    await page.getByRole('button', { name: /got it/i }).click();
    await reloadPromise;

    await expect(companyProfilePage.jobOpeningsSection).toBeVisible();
    const updatedCard = companyProfilePage.getJobCard(0);
    await expect(updatedCard.locator('h3').first()).toContainText('Principal Frontend Engineer');
  });

  test('CMP-06 Delete job removes it from openings list', async ({ page, companyProfilePage }) => {
    const backendState = createCompanyBackendState();
    await setupCompanyBackend(page, backendState);
    const companyId = backendState.ownerCompanyId;
    const company = backendState.companies[companyId];

    await setupCompanySession(page, {
      backendUser: {
        id: companyId,
        name: company.name,
        role: 'Company',
        verified_status: company.verified_status,
        company: { id: companyId, verified_status: company.verified_status },
      },
    });

    await companyProfilePage.navigate(companyId, 'owner');
    await expect(companyProfilePage.jobOpeningsSection).toBeVisible();
    const initialCount = await companyProfilePage.jobCards.count();
    expect(initialCount).toBeGreaterThan(0);

    const targetCard = companyProfilePage.getJobCard(initialCount - 1);
    await companyProfilePage.getDeleteJobButton(targetCard).click();

    await page.getByRole('button', { name: /^delete$/i }).click();

    await expect(companyProfilePage.jobCards).toHaveCount(initialCount - 1);
  });

  test('CMP-07 View applications loads candidate cards for selected job', async ({
    page,
    companyProfilePage,
    jobApplicationsPage,
  }) => {
    const backendState = createCompanyBackendState();
    await setupCompanyBackend(page, backendState);
    const companyId = backendState.ownerCompanyId;
    const company = backendState.companies[companyId];
    const targetJob = company.job_post[0];

    await setupCompanySession(page, {
      backendUser: {
        id: companyId,
        name: company.name,
        role: 'Company',
        verified_status: company.verified_status,
        company: { id: companyId, verified_status: company.verified_status },
      },
    });

    await companyProfilePage.navigate(companyId, 'owner');
    const jobCard = companyProfilePage.getJobCard(0);
    await companyProfilePage.getViewApplicationsButton(jobCard).click();

    await page.waitForURL(`**/company/${companyId}/jobs/${targetJob.id}/applications`);
    await expect(jobApplicationsPage.pageTitle).toContainText(targetJob.title);
    await expect(jobApplicationsPage.applicationCount).toContainText('applications received');
    await expect(jobApplicationsPage.applicationCards.first()).toContainText('Casey Candidate');
  });

  test('CMP-08 Public CPSK view hides owner-only controls', async ({
    page,
    companyProfilePage,
  }) => {
    const backendState = createCompanyBackendState();
    await setupCompanyBackend(page, backendState);
    const companyId = backendState.ownerCompanyId;

    await setupCompanySession(page, {
      role: 'CPSK',
      backendUser: {
        role: 'CPSK',
        program: 'CPE',
        name: null,
        company: null,
      },
      isRegistered: true,
    });

    await companyProfilePage.navigate(companyId, 'cpsk');
    await expect(companyProfilePage.jobOpeningsSection).toBeVisible();
    await expect(companyProfilePage.getPostNewJobButton()).toHaveCount(0);

    const jobCard = companyProfilePage.getJobCard(0);
    await expect(companyProfilePage.getEditJobButton(jobCard)).toHaveCount(0);
    await expect(companyProfilePage.getDeleteJobButton(jobCard)).toHaveCount(0);
    await expect(companyProfilePage.getViewApplicationsButton(jobCard)).toHaveCount(0);
    await expect(companyProfilePage.getApplyButton(jobCard)).toBeVisible();
  });
});
