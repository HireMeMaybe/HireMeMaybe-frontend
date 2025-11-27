import path from 'path';
import { test, expect, Page, Route } from '@playwright/test';
import { encode as encodeJwt } from 'next-auth/jwt';
import { LandingPage, CPSKRegisterPage, SearchPage, ApplicationPage, ProfilePage } from './pages';

const TEST_EMAIL = 'e2e_cpsk@test.com';
const RESUME_FIXTURE = path.resolve(process.cwd(), 'tests/assets/sample-resume.pdf');

type BackendUserState = {
  id: string;
  role: 'CPSK';
  first_name?: string;
  last_name?: string;
  program?: string | null;
  year?: string | number | null;
  soft_skill?: string[];
  resume_id?: number | null;
  User?: {
    email?: string;
    tel?: string;
  };
  user?: {
    email?: string;
    tel?: string;
  };
};

type SessionState = {
  user: {
    name: string;
    email: string;
  };
  backendToken: string | null;
  backendUser: BackendUserState;
  role: 'CPSK';
  isRegistered: boolean;
  expires: string;
};

type SessionOverride = Partial<Omit<SessionState, 'backendUser' | 'user'>> & {
  backendUser?: Partial<BackendUserState>;
  user?: Partial<SessionState['user']>;
};

type ApplicationRecord = {
  id: number;
  applied_at: string;
  status: string;
  cpsk_id: string;
  post_id: number;
  answer_id?: number;
  resume_id?: number | null;
  answer?: {
    id?: number;
    expected_salary?: string;
    programming_languages?: string[];
    right_to_work?: string;
    year_of_experience?: number;
  };
};

type ProfileRecord = {
  id: string;
  first_name?: string;
  last_name?: string;
  program?: string | null;
  year?: string | number | null;
  soft_skill?: string[];
  resume_id?: number | null;
  profile_picture?: string | null;
  applications?: ApplicationRecord[];
  User: {
    id: string;
    email: string;
    tel: string;
    username: string;
    profile_picture?: string | null;
  };
};

type JobPostRecord = {
  id: number;
  company_id: string;
  title: string;
  desc: string;
  exp_lvl: string;
  location: string;
  type: string;
  req: string;
  salary: string;
  tags: string[];
  post_time: string;
  expiring: string;
  company: {
    id: string;
    name: string;
    industry?: string;
    location?: string;
  };
};

type CompanyRecord = {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  logo_id?: number;
};

type BackendState = {
  profile: ProfileRecord;
  jobPosts: JobPostRecord[];
  companies: Record<string, CompanyRecord>;
  appliedJobs: Set<string>;
  resumeBlob: Buffer;
  logoBlob: Buffer;
  jobSearchRequests: string[];
};

type BackendOverride = Partial<{
  profile: Partial<ProfileRecord>;
  jobPosts: JobPostRecord[];
  companies: Record<string, CompanyRecord>;
  appliedJobs: Set<string>;
  resumeBlob: Buffer;
  logoBlob: Buffer;
}>;

const questionCopy = {
  rightToWork: 'Which of the following statements best describes your right to work in Thailand?',
  expectedSalary: "What's your expected monthly basic salary?",
  yearsExperience: "How many years' experience do you have as a Software Engineer?",
  languages: 'Which of the following programming languages are you experienced in?',
};

const createSessionState = (overrides: SessionOverride = {}): SessionState => {
  const base: SessionState = {
    user: {
      name: 'CPSK Candidate',
      email: TEST_EMAIL,
    },
    backendToken: 'mock-backend-token',
    backendUser: {
      id: 'cpsk-e2e',
      role: 'CPSK',
      first_name: '',
      last_name: '',
      program: null,
      year: null,
      soft_skill: [],
      resume_id: null,
      User: {
        email: TEST_EMAIL,
        tel: '0800000000',
      },
    },
    role: 'CPSK',
    isRegistered: false,
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  return mergeSessionState(base, overrides);
};

const mergeSessionState = (session: SessionState, patch?: SessionOverride): SessionState => {
  if (!patch) return session;

  return {
    ...session,
    ...patch,
    user: { ...session.user, ...(patch.user ?? {}) },
    backendUser: {
      ...session.backendUser,
      ...(patch.backendUser ?? {}),
      User: {
        ...session.backendUser.User,
        ...(patch.backendUser?.User ?? {}),
      },
      user: {
        ...session.backendUser.user,
        ...(patch.backendUser?.user ?? {}),
      },
    },
    backendToken: patch.backendToken ?? session.backendToken,
    isRegistered: patch.isRegistered ?? session.isRegistered,
  };
};

const mapAccount = (account?: BackendUserState['User']) =>
  account
    ? {
        email: account.email ?? undefined,
        tel: account.tel ?? undefined,
      }
    : undefined;

const normalizeYear = (value: BackendUserState['year']) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) {
      const parsed = Number(match[0]);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
  }
  return value ?? null;
};

const encodeNextAuthToken = async (session: SessionState): Promise<string> => {
  const secret = process.env.NEXTAUTH_SECRET ?? 'dev-secret-key-change-in-production';
  const backendUserPayload = {
    ...session.backendUser,
    User: mapAccount(session.backendUser.User),
    user: mapAccount(session.backendUser.user),
    year: normalizeYear(session.backendUser.year),
  };

  return await encodeJwt({
    token: {
      name: session.user.name,
      email: session.user.email,
      backendToken: session.backendToken ?? undefined,
      backendUser: backendUserPayload,
      role: session.role,
      isRegistered: session.isRegistered,
      sub: session.backendUser.id ? String(session.backendUser.id) : undefined,
    },
    secret,
    maxAge: 60 * 60,
  });
};

const createBackendState = (overrides: BackendOverride = {}): BackendState => {
  const defaultProfile: ProfileRecord = {
    id: 'cpsk-profile',
    first_name: 'Casey',
    last_name: 'Candidate',
    program: 'CPE',
    year: 'Year 4',
    soft_skill: ['Teamwork', 'Problem Solving'],
    resume_id: 7001,
    profile_picture: null,
    User: {
      id: 'user-cpsk',
      email: TEST_EMAIL,
      tel: '0890000000',
      username: 'casey.candidate',
      profile_picture: null,
    },
  };

  const defaultCompany: CompanyRecord = {
    id: 'comp-1',
    name: 'OCS Global',
    industry: 'technology',
    location: 'Bangkok, Thailand',
    logo_id: 9101,
  };

  const jobPosts: JobPostRecord[] = Array.from({ length: 9 }).map((_, index) => ({
    id: index + 1,
    company_id: defaultCompany.id,
    title: index % 2 === 0 ? 'Full Stack Engineer' : 'Frontend Engineer',
    desc: 'Comprehensive role description with stack expectations.',
    exp_lvl: index % 2 === 0 ? 'Mid-Level' : 'Junior',
    location: 'Bangkok, Thailand',
    type: index % 3 === 0 ? 'Hybrid' : 'Remote',
    req: 'Strong TypeScript, React, and testing fundamentals.',
    salary: '50,000 - 70,000 THB',
    tags: ['Engineering', index % 2 === 0 ? 'Technology' : 'Finance'],
    post_time: new Date(2025, 0, index + 1).toISOString(),
    expiring: new Date(2025, 1, index + 1).toISOString(),
    company: {
      id: defaultCompany.id,
      name: defaultCompany.name,
      industry: defaultCompany.industry,
      location: defaultCompany.location,
    },
  }));

  const defaultApplications: ApplicationRecord[] = jobPosts.slice(0, 3).map((job, index) => ({
    id: 5000 + index,
    applied_at: new Date(2025, 1, index + 5).toISOString(),
    status: index === 0 ? 'pending' : index === 1 ? 'in consideration' : 'rejected',
    cpsk_id: defaultProfile.id,
    post_id: job.id,
    answer_id: 7000 + index,
    resume_id: defaultProfile.resume_id,
    answer: {
      id: 9000 + index,
      expected_salary: index === 2 ? '80,000-120,000 THB' : '50,000-70,000 THB',
      programming_languages: ['TypeScript', index % 2 === 0 ? 'Go' : 'Python'],
      right_to_work: 'I am a Thai citizen',
      year_of_experience: index === 0 ? 1 : index === 1 ? 3 : 5,
    },
  }));

  defaultProfile.applications = defaultApplications;

  const backend: BackendState = {
    profile: { ...defaultProfile },
    jobPosts,
    companies: { [defaultCompany.id]: defaultCompany },
    appliedJobs: overrides.appliedJobs ?? new Set<string>(),
    resumeBlob: overrides.resumeBlob ?? Buffer.from('%PDF-FAKE-RESUME%'),
    logoBlob: overrides.logoBlob ?? Buffer.from('PNG'),
    jobSearchRequests: [],
  };

  if (overrides.profile) {
    backend.profile = {
      ...backend.profile,
      ...overrides.profile,
      User: {
        ...backend.profile.User,
        ...(overrides.profile.User ?? {}),
      },
    };
  }

  if (overrides.jobPosts) {
    backend.jobPosts = overrides.jobPosts;
  }

  if (overrides.companies) {
    backend.companies = overrides.companies;
  }

  return backend;
};

const setupSession = async (page: Page, overrides?: SessionOverride) => {
  let sessionState = createSessionState(overrides);

  const applySessionCookie = async () => {
    const tokenValue = await encodeNextAuthToken(sessionState);
    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: tokenValue,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
  };

  await applySessionCookie();

  await page.route('**/api/auth/session**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postData();
      if (body) {
        try {
          const payload = JSON.parse(body);
          const patch = payload?.data ?? payload;
          sessionState = mergeSessionState(sessionState, patch);
          await applySessionCookie();
        } catch (error) {
          console.warn('Failed to merge session update', error);
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
    async set(patch: SessionOverride) {
      sessionState = mergeSessionState(sessionState, patch);
      await applySessionCookie();
    },
    get() {
      return sessionState;
    },
  };
};

const setupBackend = async (page: Page, backend: BackendState) => {
  const fulfillJson = (route: Route, payload: unknown, status = 200) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  };

  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://hirememaybe-backend.onrender.com/api/v1'
  ).replace(/\/$/, '');

  await page.route(`${backendBase}/cpsk/myprofile`, (route) => {
    if (route.request().method() === 'GET') {
      return fulfillJson(route, backend.profile);
    }
    return fulfillJson(route, { error: 'Unsupported method' }, 405);
  });

  await page.route(`${backendBase}/cpsk/profile`, (route) => {
    if (route.request().method() !== 'PATCH') {
      return fulfillJson(route, { error: 'Unsupported method' }, 405);
    }

    const raw = route.request().postData();
    const body = raw
      ? (JSON.parse(raw) as {
          first_name?: string;
          last_name?: string;
          program?: string;
          year?: string;
          soft_skill?: string[];
          tel?: string;
        })
      : undefined;

    const nextProfile: ProfileRecord = {
      ...backend.profile,
      first_name: body?.first_name ?? backend.profile.first_name,
      last_name: body?.last_name ?? backend.profile.last_name,
      program: body?.program ?? backend.profile.program,
      year: body?.year ?? backend.profile.year,
      soft_skill: Array.isArray(body?.soft_skill) ? body?.soft_skill : backend.profile.soft_skill,
      resume_id: backend.profile.resume_id,
      User: {
        ...backend.profile.User,
        tel: body?.tel ?? backend.profile.User.tel,
      },
    };

    backend.profile = nextProfile;
    return fulfillJson(route, backend.profile);
  });

  await page.route(`${backendBase}/jobpost*`, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/jobpost')) {
      backend.jobSearchRequests.push(url.searchParams.toString());
      return fulfillJson(route, backend.jobPosts);
    } else if (/\/jobpost\/\d+$/.test(url.pathname)) {
      const match = url.pathname.match(/\/jobpost\/(\d+)$/);
      const jobId = match ? Number(match[1]) : null;
      const job = jobId ? backend.jobPosts.find((item) => item.id === jobId) : undefined;
      if (!job) {
        return fulfillJson(route, { error: 'Not found' }, 404);
      }
      return fulfillJson(route, job);
    }
    return route.continue();
  });

  await page.route(`${backendBase}/jobs/*/apply`, (route) => {
    const match = route
      .request()
      .url()
      .match(/\/jobs\/(\d+)\/apply/);
    const jobId = match?.[1];
    if (!jobId) {
      return fulfillJson(route, { error: 'Invalid job id' }, 400);
    }

    if (backend.appliedJobs.has(jobId)) {
      return fulfillJson(route, { error: 'Already applied' }, 409);
    }

    backend.appliedJobs.add(jobId);
    return fulfillJson(route, { message: 'Application submitted', applicationId: `app-${jobId}` });
  });

  await page.route(`${backendBase}/company/*`, (route) => {
    const match = route
      .request()
      .url()
      .match(/\/company\/(.+)$/);
    const companyId = match?.[1];
    if (!companyId || !backend.companies[companyId]) {
      return fulfillJson(route, { error: 'Company not found' }, 404);
    }
    return fulfillJson(route, backend.companies[companyId]);
  });

  await page.route(`${backendBase}/file/*`, (route) => {
    const match = route
      .request()
      .url()
      .match(/\/file\/(\d+)/);
    const fileId = match ? Number(match[1]) : null;
    const isResume = fileId && backend.profile.resume_id && fileId === backend.profile.resume_id;

    route.fulfill({
      status: 200,
      headers: {
        'Content-Type': isResume ? 'application/pdf' : 'image/png',
      },
      body: isResume ? backend.resumeBlob : backend.logoBlob,
    });
  });
};

const fetchSession = async (page: Page) => {
  return page.evaluate(async () => {
    const res = await fetch('/api/auth/session');
    return res.json();
  });
};

const answerDefaultQuestions = async (page: Page) => {
  const selectQuestion = async (questionText: string, optionText: string) => {
    const block = page.locator('label', { hasText: questionText }).locator('xpath=..');
    await block.locator('[role="combobox"]').first().click();
    await page.getByRole('option', { name: optionText }).click();
  };

  await selectQuestion(questionCopy.rightToWork, 'I am a Thai citizen');
  await selectQuestion(questionCopy.expectedSalary, '30,000-50,000 THB');
  await selectQuestion(questionCopy.yearsExperience, '1-2 years');

  await page.getByLabel('JavaScript').check();
  await page.getByLabel('Python').check();
};

const submitApplicationForm = async (page: Page) => {
  const applicationPage = new ApplicationPage(page);
  await expect(applicationPage.nameInput).toBeVisible();

  await answerDefaultQuestions(page);

  await applicationPage.uploadResume(RESUME_FIXTURE);
  await applicationPage.submitButton.click();
};

const expectJobSearchRequest = async (
  backend: BackendState,
  predicate: (query: string) => boolean
) => {
  await expect.poll(() => backend.jobSearchRequests.some((q) => predicate(q))).toBeTruthy();
};

const expectSessionRegistered = async (page: Page) => {
  const session = await fetchSession(page);
  expect(session.isRegistered).toBeTruthy();
  expect(session.backendUser?.program).toBeDefined();
};

const goToSearchAndSelectFirstJob = async (page: Page) => {
  const searchPage = new SearchPage(page);
  await searchPage.navigate();
  await expect(searchPage.jobCards.first()).toBeVisible();
  await searchPage.jobCards.first().click();
  await expect(searchPage.jobDetailsPanel).toBeVisible();
  return searchPage;
};

const navigateToApplication = async (page: Page, searchPage: SearchPage, jobId: number) => {
  await searchPage.getApplyButton().click();
  await page.waitForURL(`**/application/${jobId}`);
};

const mockApplicationJobDetail = async (page: Page, backend: BackendState, jobId: number) => {
  const job = backend.jobPosts.find((entry) => entry.id === jobId);
  if (!job) {
    throw new Error(`Job with id ${jobId} not found in backend state`);
  }

  const backendBase = (
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://hirememaybe-backend.onrender.com/api/v1'
  ).replace(/\/$/, '');
  const company = backend.companies[job.company_id];

  await page.route(`${backendBase}/jobpost/${job.id}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...job,
        company_user: company
          ? {
              id: company.id,
              name: company.name,
              industry: company.industry,
              location: company.location,
              logo_id: company.logo_id,
              verified_status: 'Verified',
            }
          : undefined,
      }),
    });
  });
};

test.describe('@cpsk candidate journey', () => {
  test.skip('CPSK-01 Google sign-in handshake sets stub session and OAuth intent', async ({
    page,
  }) => {
    await setupSession(page, { backendToken: null, isRegistered: false });

    const landing = new LandingPage(page);
    await landing.navigate();
    const loginSection = page.locator('#login-section').first();
    await loginSection.waitFor({ state: 'visible' });
    await loginSection.scrollIntoViewIfNeeded();
    await landing.clickCPSKCard();
    const googleButton = page.getByRole('button', { name: /continue with google/i });
    await expect(googleButton).toBeVisible();

    const navigationPromise = page.waitForEvent(
      'framenavigated',
      (frame) => frame === page.mainFrame() && frame.url().startsWith('https://accounts.google.com')
    );
    await googleButton.click();
    await navigationPromise;
    await page.goBack();

    const cookies = await page.context().cookies();
    expect(cookies.some((cookie) => cookie.name.includes('next-auth'))).toBeTruthy();

    const session = await fetchSession(page);
    expect(session.isRegistered).toBeFalsy();
  });

  test('CPSK-02 First-time registration updates profile and session', async ({ page }) => {
    await setupSession(page, {
      backendUser: {
        program: null,
        year: null,
        soft_skill: [],
      },
      isRegistered: false,
    });
    const backendState = createBackendState({
      profile: {
        first_name: '',
        last_name: '',
        program: null,
        year: null,
        soft_skill: [],
        resume_id: null,
      },
    });
    await setupBackend(page, backendState);

    const registerPage = new CPSKRegisterPage(page);
    await registerPage.navigate();

    await registerPage.fillRegistrationForm({
      firstName: 'Casey',
      lastName: 'Candidate',
      email: TEST_EMAIL,
      phone: '0891112222',
      program: 'CPE',
      year: 'Year 4',
      softSkills: ['Leadership'],
    });

    await registerPage.submitButton.click();
    await expect(registerPage.confirmDialog).toBeVisible();
    await registerPage.confirmSubmitButton.click();

    await expect(page).toHaveURL(/\/profile$/);

    const profilePage = new ProfilePage(page);
    await expect(profilePage.userName).toContainText('Casey Candidate');

    await expectSessionRegistered(page);
  });

  test('CPSK-03 Search jobs triggers backend queries, filters, and pagination', async ({
    page,
  }) => {
    await setupSession(page, {
      isRegistered: true,
      backendUser: {
        program: 'CPE',
        year: 'Year 4',
      },
    });
    const backendState = createBackendState();
    await setupBackend(page, backendState);

    const searchPage = new SearchPage(page);
    await searchPage.navigate();
    await expect(searchPage.jobCards.first()).toBeVisible();

    await searchPage.search('Engineer');
    await expectJobSearchRequest(backendState, (query) => query.includes('search=Engineer'));

    await page.locator('[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Hybrid' }).click();
    await expectJobSearchRequest(backendState, (query) => query.includes('type=Hybrid'));
  });

  test.skip('CPSK-04 View job details and submit application successfully', async ({ page }) => {
    await setupSession(page, {
      isRegistered: true,
      backendUser: {
        program: 'CPE',
        year: 'Year 4',
      },
    });
    const backendState = createBackendState({
      profile: {
        resume_id: null,
      },
    });
    const targetJobId = backendState.jobPosts[0].id;
    await mockApplicationJobDetail(page, backendState, targetJobId);
    await setupBackend(page, backendState);

    const searchPage = await goToSearchAndSelectFirstJob(page);
    await navigateToApplication(page, searchPage, targetJobId);

    await submitApplicationForm(page);
  });

  // test('CPSK-05 History lists applications and detail panel updates', async ({ page }) => {
  //   await setupSession(page, {
  //     isRegistered: true,
  //     backendUser: {
  //       program: 'CPE',
  //     },
  //   });

  //   const backendState = createBackendState();
  //   await setupBackend(page, backendState);

  //   const historyPage = new HistoryPage(page);
  //   await historyPage.navigate();
  //   await expect(historyPage.pageTitle).toBeVisible();

  //   const count = await historyPage.getHistoryCount();
  //   expect(count).toBeGreaterThan(0);

  //   if (await historyPage.sortButton.isVisible()) {
  //     await historyPage.sortButton.click();
  //     await expect(historyPage.sortButton).toHaveText(/oldest/i);
  //   }

  //   await historyPage.clickHistoryCard(0);
  //   const details = await historyPage.getSelectedApplicationDetails();
  //   expect(details.jobTitle).not.toBe('');
  //   expect(details.status).not.toBe('');
  // });

  test('CPSK-06 Profile edit updates values via CPSKRegisterForm', async ({ page }) => {
    await setupSession(page, {
      isRegistered: true,
      backendUser: {
        program: 'CPE',
        first_name: 'Casey',
        last_name: 'Candidate',
      },
    });
    const backendState = createBackendState();
    await setupBackend(page, backendState);

    const registerPage = new CPSKRegisterPage(page);
    await page.goto('/profile/edit');
    await expect(registerPage.firstNameInput).toHaveValue(/Casey/);

    await registerPage.fillRegistrationForm({
      firstName: 'Carla',
      lastName: 'Innovator',
      email: TEST_EMAIL,
      phone: '0899991234',
      program: 'SKE',
      year: 'Year 3',
      softSkills: ['Creativity'],
    });

    await registerPage.submitButton.click();
    await registerPage.confirmSubmitButton.click();
    await page.waitForURL('**/profile');

    const profilePage = new ProfilePage(page);
    await expect(profilePage.userName).toContainText('Carla Innovator');
    const softSkills = await profilePage.getSoftSkills();
    expect(softSkills.some((skill) => skill.includes('Creativity'))).toBeTruthy();
  });

  test.skip('CPSK-07 Resume preview downloads blob via CpskService.previewResume', async ({
    page,
  }) => {
    await setupSession(page, {
      isRegistered: true,
      backendUser: {
        program: 'CPE',
        resume_id: 7001,
      },
    });
    const backendState = createBackendState();
    await setupBackend(page, backendState);

    const profilePage = new ProfilePage(page);
    await profilePage.navigate();

    const resumeRequest = page.waitForRequest((req) =>
      req.url().includes(`/file/${backendState.profile.resume_id}`)
    );
    await profilePage.previewResumeButton.click();
    await resumeRequest;

    await expect(profilePage.resumePreviewModal).toBeVisible();
    await profilePage.resumePreviewModal.getByRole('button', { name: /close/i }).first().click();
  });
});
