/**
 * Regular Expression Validation Utilities
 * ASVS V1.2.9: Escape special characters in regular expressions
 */

/**
 * Special characters that need escaping in regex
 */
const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/**
 * Escape special characters in a string for safe use in RegExp
 * ASVS V1.2.9: Application escapes special characters in regular expressions
 */
export function escapeRegExp(str: string): string {
  if (typeof str !== 'string') {
    throw new TypeError('escapeRegExp expects a string argument');
  }
  return str.replaceAll(REGEX_SPECIAL_CHARS, String.raw`\$&`);
}

/**
 * Create a safe RegExp from user input
 * Escapes special characters to prevent ReDoS attacks
 */
export function createSafeRegExp(pattern: string, flags?: string): RegExp | null {
  try {
    const escapedPattern = escapeRegExp(pattern);
    return new RegExp(escapedPattern, flags);
  } catch (error) {
    console.error('Failed to create RegExp:', error);
    return null;
  }
}

/**
 * Test if a string matches a safe pattern
 * Automatically escapes the pattern before testing
 */
export function safeRegExpTest(pattern: string, testString: string): boolean {
  const regex = createSafeRegExp(pattern);
  if (!regex) return false;
  return regex.test(testString);
}

/**
 * Validate regex pattern length to prevent ReDoS
 */
export function validateRegexPattern(pattern: string): {
  isValid: boolean;
  error?: string;
} {
  // Limit pattern length to prevent ReDoS
  const MAX_PATTERN_LENGTH = 500;

  if (pattern.length > MAX_PATTERN_LENGTH) {
    return {
      isValid: false,
      error: `Pattern too long (max ${MAX_PATTERN_LENGTH} characters)`,
    };
  }

  // Check for potentially dangerous patterns (excessive quantifiers)
  const dangerousPatterns = [
    /(\*\+|\+\*)/, // Conflicting quantifiers
    /(\*\{|\+\{)/, // Quantifier after quantifier
    /(\{\d{3,}\})/, // Very large repetition count
  ];

  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(pattern)) {
      return {
        isValid: false,
        error: 'Pattern contains potentially dangerous quantifiers',
      };
    }
  }

  return { isValid: true };
}

/**
 * Search with user-provided pattern (safely escaped)
 */
export function safeSearch(
  text: string,
  searchPattern: string,
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
  } = {}
): boolean {
  const escapedPattern = escapeRegExp(searchPattern);

  let pattern = escapedPattern;
  if (options.wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  const flags = options.caseSensitive ? '' : 'i';

  try {
    const regex = new RegExp(pattern, flags);
    return regex.test(text);
  } catch {
    return false;
  }
}

/**
 * Replace with user-provided pattern (safely escaped)
 */
export function safeReplace(
  text: string,
  searchPattern: string,
  replacement: string,
  options: {
    caseSensitive?: boolean;
    global?: boolean;
  } = {}
): string {
  const escapedPattern = escapeRegExp(searchPattern);
  const flags = [options.global ? 'g' : '', options.caseSensitive ? '' : 'i'].join('');

  try {
    const regex = new RegExp(escapedPattern, flags);
    return text.replace(regex, replacement);
  } catch {
    return text;
  }
}
