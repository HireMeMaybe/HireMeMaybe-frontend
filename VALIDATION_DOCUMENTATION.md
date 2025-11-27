# Input Validation and File Handling Documentation

This document defines the input validation rules and file handling policies for the HireMeMaybe application, in compliance with ASVS requirements.

## Table of Contents

- [Input Validation Rules (V2.1.1)](#input-validation-rules)
- [File Handling Policies (V5.1.1)](#file-handling-policies)
- [ASVS Security Requirements](#asvs-security-requirements)

---

## Input Validation Rules

### ASVS V2.1.1 Compliance

All input validation rules are defined and enforced using Zod schemas located in `/src/lib/validations/`.

### General Validation Principles

1. **Server-side validation is mandatory** - Never trust client-side validation alone
2. **Allowlist approach** - Define what is permitted rather than what is forbidden
3. **Type safety** - Use TypeScript and Zod for runtime type validation
4. **Fail securely** - Invalid input results in rejection, not silent failure

### Data Type Validation Rules

#### User Registration (CPSK)

**Schema**: `src/lib/validations/cpsk.ts`

| Field        | Type     | Validation Rules                          | Example                           |
| ------------ | -------- | ----------------------------------------- | --------------------------------- |
| `email`      | string   | Valid email format, lowercase             | `student@university.ac.th`        |
| `first_name` | string   | 1-100 characters, letters and spaces only | `John`                            |
| `last_name`  | string   | 1-100 characters, letters and spaces only | `Doe`                             |
| `program`    | string   | 1-200 characters                          | `Computer Science`                |
| `year`       | number   | Integer between 1-7                       | `3`                               |
| `soft_skill` | string[] | Array of strings, each 1-100 chars        | `["Leadership", "Communication"]` |
| `tel`        | string   | 10 digits, starts with 0                  | `0812345678`                      |

#### Company Registration

**Schema**: `src/lib/validations/company.ts`

| Field      | Type   | Validation Rules                                   | Example                  |
| ---------- | ------ | -------------------------------------------------- | ------------------------ |
| `name`     | string | 1-200 characters                                   | `Tech Corporation Ltd.`  |
| `email`    | string | Valid email format                                 | `contact@techcorp.com`   |
| `overview` | string | 1-2000 characters                                  | Company description      |
| `industry` | string | 1-100 characters                                   | `Information Technology` |
| `size`     | string | Enum: "1-10", "11-50", "51-200", "201-500", "500+" | `51-200`                 |
| `tel`      | string | 10 digits, starts with 0                           | `0212345678`             |

#### Job Post

**Schema**: `src/lib/validations/job-post.ts`

| Field             | Type     | Validation Rules                                         | Example                    |
| ----------------- | -------- | -------------------------------------------------------- | -------------------------- |
| `title`           | string   | 1-200 characters                                         | `Senior Software Engineer` |
| `description`     | string   | 1-5000 characters                                        | Job description text       |
| `location`        | string   | 1-200 characters                                         | `Bangkok, Thailand`        |
| `job_type`        | string   | Enum: "Full-time", "Part-time", "Contract", "Internship" | `Full-time`                |
| `salary_min`      | number   | Positive integer or 0                                    | `40000`                    |
| `salary_max`      | number   | Greater than salary_min                                  | `60000`                    |
| `required_skills` | string[] | Array of strings                                         | `["JavaScript", "React"]`  |

#### Application Submission

**Schema**: `src/lib/validations/application.ts`

| Field          | Type   | Validation Rules              | Example           |
| -------------- | ------ | ----------------------------- | ----------------- |
| `cover_letter` | string | Optional, max 2000 characters | Cover letter text |
| `resume_id`    | number | Positive integer              | `123`             |

### URL Validation (V1.2.2)

**Module**: `src/lib/utils/url-validation.ts`

#### Allowed URL Protocols

- ✅ `http:`
- ✅ `https:`
- ✅ `mailto:`
- ❌ `javascript:` - **BLOCKED**
- ❌ `data:` - **BLOCKED**
- ❌ `vbscript:` - **BLOCKED**
- ❌ `file:` - **BLOCKED**

#### URL Encoding

- Query parameters: Use `encodeURIComponent()` for all user input
- Path segments: Use proper URL encoding
- Helper function: `buildUrlWithParams(baseUrl, params)`

### Regular Expression Validation (V1.2.9)

**Module**: `src/lib/utils/regex-validation.ts`

#### Special Characters Escaped

When user input is used in regex patterns, the following characters are automatically escaped:

```
. * + ? ^ $ { } ( ) | [ ] \
```

#### Pattern Limitations

- Maximum pattern length: 500 characters
- Prohibited patterns:
  - Conflicting quantifiers (`*+`, `+*`)
  - Quantifier after quantifier (`*{`, `+{`)
  - Very large repetition counts (>{999})

#### Safe Functions

- `escapeRegExp(str)` - Escape special characters
- `createSafeRegExp(pattern, flags)` - Create safe RegExp
- `safeSearch(text, pattern, options)` - Search with escaped pattern

---

## File Handling Policies

### ASVS V5.1.1 Compliance

This section defines permitted file types, extensions, size limits, and safety handling procedures.

### File Type Categories

#### 1. Resume/CV Files

**Configuration**: `FILE_CONFIGS.RESUME`

| Property               | Value                        | Description                                 |
| ---------------------- | ---------------------------- | ------------------------------------------- |
| Allowed MIME Types     | `application/pdf`            | Only PDF files accepted                     |
| Allowed Extensions     | `.pdf`                       | Only .pdf extension                         |
| Maximum Size           | 10 MB                        | Per file limit                              |
| Magic Bytes Validation | Enabled                      | Validates file header matches PDF signature |
| Magic Bytes            | `%PDF` (0x25 0x50 0x44 0x46) | PDF file signature                          |

**Usage**:

- User profile resume upload
- Job application attachments

#### 2. Image Files

**Configuration**: `FILE_CONFIGS.IMAGE`

| Property               | Value                                                | Description                |
| ---------------------- | ---------------------------------------------------- | -------------------------- |
| Allowed MIME Types     | `image/jpeg`, `image/png`, `image/gif`, `image/webp` | Standard web image formats |
| Allowed Extensions     | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`             | Matching extensions        |
| Maximum Size           | 5 MB                                                 | Per file limit             |
| Magic Bytes Validation | Enabled                                              | Validates file header      |

**Magic Bytes**:

- JPEG: `0xFF 0xD8 0xFF 0xE0/E1/E2/E3`
- PNG: `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`
- GIF: `GIF87a` or `GIF89a`
- WebP: `RIFF`

**Usage**:

- User profile pictures
- Company logos
- Company profile images

### File Validation Process (V5.2.2)

The file validation process includes the following checks:

1. **File Existence Check**
   - Verify file is provided and has a name

2. **Size Validation**
   - Check file size does not exceed `maxSize` limit
   - Reject files larger than specified limit
   - Reject zero-byte files

3. **MIME Type Validation**
   - Verify file MIME type is in `allowedTypes` list
   - Check browser-reported content type

4. **Extension Validation**
   - Extract file extension from filename
   - Verify extension is in `allowedExtensions` list
   - Case-insensitive comparison

5. **Magic Bytes Validation** (ASVS V5.2.2)
   - Read first 12 bytes of file
   - Compare against known file signatures
   - Verify file content matches declared type
   - Prevents file type spoofing

### File Quota Limits (V5.2.4)

Per-user file quotas are enforced to prevent resource abuse:

#### CPSK Users

| Quota                 | Limit    |
| --------------------- | -------- |
| Maximum Files         | 10 files |
| Maximum Total Storage | 50 MB    |

**Typical Usage**:

- 1 resume (PDF, ~2 MB)
- 1 profile picture (Image, ~0.5 MB)
- 8 portfolio/certificate files (~5-6 MB each)

#### Company Users

| Quota                 | Limit    |
| --------------------- | -------- |
| Maximum Files         | 20 files |
| Maximum Total Storage | 100 MB   |

**Typical Usage**:

- 1 company logo (Image, ~0.5 MB)
- 10 company images (Image, ~3-5 MB each)
- 9 document files (PDF, ~5 MB each)

#### Visitor Users

| Quota                 | Limit   |
| --------------------- | ------- |
| Maximum Files         | 0 files |
| Maximum Total Storage | 0 MB    |

**Note**: Visitors cannot upload files

### File Safety Procedures

#### Storage

- Files are validated before storage
- Unique IDs are generated for each file
- Original filenames are sanitized
- Files are stored outside web root when possible

#### Retrieval

- File access requires proper authentication
- File ownership is verified before serving
- Content-Disposition headers prevent inline execution
- Content-Type headers match actual file type

#### Deletion

- Soft delete mechanism for recovery
- Permanent deletion after retention period
- Quota is updated after deletion

---

## ASVS Security Requirements

This application implements the following ASVS Level 2 requirements:

### Implemented Requirements

| Req ID     | Requirement                          | Implementation                                           | Location                            |
| ---------- | ------------------------------------ | -------------------------------------------------------- | ----------------------------------- |
| **V1.2.2** | URL encoding and protocol validation | Safe URL protocols enforced, dangerous protocols blocked | `src/lib/utils/url-validation.ts`   |
| **V1.2.9** | Escape special chars in regex        | Auto-escaping of regex special characters                | `src/lib/utils/regex-validation.ts` |
| **V2.1.1** | Document input validation rules      | This documentation + Zod schemas                         | This file + `/src/lib/validations/` |
| **V3.5.1** | CSRF protection                      | Anti-forgery tokens for state-changing requests          | `src/lib/middleware/csrf.ts`        |
| **V3.7.2** | Redirect URL validation              | Allowlist-based redirect validation                      | `src/lib/authOptions.ts`            |
| **V5.1.1** | Document file handling policies      | This documentation                                       | This file                           |
| **V5.2.2** | Magic bytes validation               | File signature validation                                | `src/lib/utils/file-validation.ts`  |
| **V5.2.4** | Per-user file quota                  | File count and size limits enforced                      | `src/lib/utils/file-quota.ts`       |

### Usage Examples

#### Validating User Input

```typescript
import { cpskSchema } from '@/lib/validations/cpsk';

const result = cpskSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
  console.error(result.error);
}
```

#### Validating File Upload

```typescript
import { validateFile, FILE_CONFIGS } from '@/lib/utils/file-validation';

const result = await validateFile(file, FILE_CONFIGS.RESUME);
if (!result.isValid) {
  alert(result.error);
}
```

#### Checking File Quota

```typescript
import { useFileQuota } from '@/lib/utils/file-quota-hooks';

const { quota, canUploadFile } = useFileQuota();
const validation = canUploadFile(file);
if (!validation.isValid) {
  alert(validation.error);
}
```

#### Validating URLs

```typescript
import { validateUrlProtocol, sanitizeUrl } from '@/lib/utils/url-validation';

const validation = validateUrlProtocol(userUrl);
if (!validation.isValid) {
  console.error(validation.error);
}
const safeUrl = sanitizeUrl(userUrl); // Returns '#' if invalid
```

#### Using CSRF Protection

```typescript
import { useCsrfToken } from '@/lib/utils/csrf-hooks';

const { csrfToken, getCsrfHeaders } = useCsrfToken();

fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    ...getCsrfHeaders(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## Maintenance and Updates

### When to Update This Documentation

- Adding new data types or validation rules
- Changing file type restrictions
- Modifying file size limits
- Adding new ASVS requirements
- Changing quota policies

### Validation Schema Locations

- `/src/lib/validations/cpsk.ts` - CPSK user validation
- `/src/lib/validations/company.ts` - Company validation
- `/src/lib/validations/job-post.ts` - Job post validation
- `/src/lib/validations/application.ts` - Application validation

### Security Utilities

- `/src/lib/utils/file-validation.ts` - File validation
- `/src/lib/utils/file-quota.ts` - Quota management
- `/src/lib/utils/url-validation.ts` - URL validation
- `/src/lib/utils/regex-validation.ts` - Regex safety
- `/src/lib/middleware/csrf.ts` - CSRF protection

---

**Last Updated**: November 27, 2025