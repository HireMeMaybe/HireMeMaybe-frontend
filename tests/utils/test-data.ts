/**
 * Test Data Utilities
 * Provides test data generators and fixtures for E2E tests
 */

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'trustmebro';

/**
 * Generate unique test identifier
 * @param prefix - Prefix for the identifier
 * @returns Unique identifier with timestamp
 */
export function generateTestId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

/**
 * Test user data fixtures
 */
export const TEST_USERS = {
  cpsk: {
    email: 'e2e_cpsk@test.com',
    firstName: 'CPSK',
    lastName: 'TestUser',
    studentId: '6588001',
    major: 'Computer Science',
    year: '4',
    department: 'Engineering',
  },
  company_unverified: {
    email: 'e2e_company_unverified@test.com',
    name: 'Test Company Unverified',
    industry: 'Technology',
    website: 'https://testcompany.com',
    description: 'Test company for E2E testing',
  },
  company_verified: {
    email: 'e2e_company_verified@test.com',
    name: 'Test Company Verified',
    industry: 'Technology',
    website: 'https://verifiedcompany.com',
    description: 'Verified test company for E2E testing',
  },
  visitor: {
    email: 'e2e_visitor@test.com',
    name: 'Visitor User',
  },
  admin: {
    username: 'admin_e2e',
    password: 'admin_password',
  },
};

/**
 * Test job post data
 */
export const TEST_JOB_POST = {
  title: 'Software Engineer',
  type: 'Full-time',
  location: 'Bangkok, Thailand',
  salary: '50000-80000',
  description: 'Looking for a talented software engineer to join our team.',
  requirements: [
    'Bachelor degree in Computer Science or related field',
    '2+ years of experience in software development',
    'Proficiency in JavaScript/TypeScript',
  ],
  responsibilities: [
    'Develop and maintain web applications',
    'Collaborate with cross-functional teams',
    'Write clean, maintainable code',
  ],
};

/**
 * Generate unique job post data
 * @returns Job post data with unique title
 */
export function generateJobPostData() {
  return {
    ...TEST_JOB_POST,
    title: `${TEST_JOB_POST.title} ${Date.now()}`,
  };
}

/**
 * Test file paths (relative to project root)
 */
export const TEST_FILES = {
  logo: 'tests/fixtures/logo.png',
  banner: 'tests/fixtures/banner.png',
  resume: 'tests/fixtures/resume.pdf',
};

/**
 * Mock company data
 */
export function generateCompanyData() {
  const timestamp = Date.now();
  return {
    name: `Test Company ${timestamp}`,
    industry: 'Technology',
    website: `https://company${timestamp}.com`,
    description: 'A test company for E2E testing purposes',
    address: '123 Test Street, Bangkok, Thailand',
    contactEmail: `contact${timestamp}@testcompany.com`,
    contactPhone: '0812345678',
  };
}

/**
 * Mock CPSK profile data
 */
export function generateCPSKData() {
  const timestamp = Date.now();
  return {
    firstName: 'Test',
    lastName: `User${timestamp}`,
    studentId: `658${timestamp.toString().slice(-4)}`,
    major: 'Computer Science',
    year: '4',
    department: 'Engineering',
    email: `cpsk${timestamp}@test.com`,
  };
}

/**
 * Mock application data
 */
export function generateApplicationData() {
  return {
    answers: {
      'Why are you interested in this position?':
        'I am passionate about software development and eager to learn.',
      'What makes you a good fit for this role?':
        'I have strong technical skills and experience in relevant technologies.',
    },
    coverLetter: 'I am excited to apply for this position...',
  };
}

/**
 * Date utilities for testing
 */
export const DateUtils = {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  today(): string {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get date N days from now in YYYY-MM-DD format
   * @param days - Number of days to add (can be negative)
   */
  daysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  },

  /**
   * Get formatted date string for display
   * @param date - Date object or ISO string
   */
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
};

/**
 * Wait utilities
 */
export const WaitUtils = {
  /**
   * Wait for specified milliseconds
   * @param ms - Milliseconds to wait
   */
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Retry an operation with exponential backoff
   * @param operation - Function to retry
   * @param maxRetries - Maximum number of retries
   * @param initialDelay - Initial delay in milliseconds
   */
  async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  },
};

/**
 * String utilities
 */
export const StringUtils = {
  /**
   * Generate random string
   * @param length - Length of string
   */
  random(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs tuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Sanitize string for use in IDs
   * @param str - String to sanitize
   */
  sanitizeId(str: string): string {
    return str
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/(?:^-+)|(?:-+$)/g, '');
  },
};
