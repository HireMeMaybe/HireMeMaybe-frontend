# Playwright Page Components Summary

## ✅ สิ่งที่สร้างเสร็จแล้ว

### 📁 โครงสร้างโปรเจค

```
tests/
├── playwright.config.ts         # Playwright configuration
├── fixtures.ts                  # Test fixtures พร้อม page objects
├── README.md                    # Documentation ภาษาไทย
├── .gitignore                   # Git ignore สำหรับ Playwright
│
├── pages/                       # 📦 Page Object Models
│   ├── index.ts                # Export หลักของทุก pages
│   ├── BasePage.ts             # Base class สำหรับทุก pages
│   │
│   ├── LandingPage.ts          # หน้าแรก
│   ├── AuthPage.ts             # Login/Authentication
│   ├── SearchPage.ts           # ค้นหางาน
│   ├── JobPostPage.ts          # สร้าง/แก้ไข Job Post
│   ├── JobDetailPage.ts        # รายละเอียดงาน
│   ├── ProfilePage.ts          # โปรไฟล์ผู้ใช้
│   ├── ApplicationPage.ts      # สมัครงาน
│   ├── CompanyProfilePage.ts   # โปรไฟล์บริษัท
│   ├── CompanyRegisterPage.ts  # ลงทะเบียนบริษัท
│   ├── CPSKRegisterPage.ts     # ลงทะเบียน CPSK
│   ├── HistoryPage.ts          # ประวัติการสมัครงาน
│   │
│   └── admin/                  # 👨‍💼 Admin Pages
│       ├── AdminLoginPage.ts
│       ├── AdminDashboardPage.ts
│       ├── CompanyVerificationPage.ts
│       ├── ManageCompanyPage.ts
│       ├── ManageCPSKPage.ts
│       ├── ManageJobPostsPage.ts
│       ├── ManageVisitorsPage.ts
│       └── AdminReportsPage.ts
│
└── examples/                    # 📝 ตัวอย่างการใช้งาน (skeleton)
    ├── landing.example.spec.ts
    ├── auth.example.spec.ts
    ├── search.example.spec.ts
    └── admin.example.spec.ts
```

## 📊 สถิติ

- **Total Pages**: 20 pages
  - Public Pages: 11 pages
  - Admin Pages: 8 pages
  - Base Page: 1 page

## 🎯 Features ของแต่ละ Page Component

### BasePage (พื้นฐานทั้งหมด)

- `goto(path)` - Navigate ไปหน้าต่างๆ
- `waitForPageLoad()` - รอให้หน้าโหลดเสร็จ
- `getTitle()` - ดึง title ของหน้า
- `takeScreenshot(name)` - ถ่ายภาพหน้าจอ

### Public Pages

ทุก page มี locators และ methods ที่จำเป็นสำหรับการทำงานในหน้านั้นๆ เช่น:

- **SearchPage**: search(), applyFilter(), getJobCount()
- **JobPostPage**: fillJobPostForm(), saveDraft(), publish()
- **ApplicationPage**: fillApplication(), submit()
- และอื่นๆ

### Admin Pages

ครอบคลุมทุก admin functionality:

- Dashboard navigation
- Company/CPSK verification
- User management
- Job posts management
- Reports and analytics

## 🚀 การใช้งาน

### 1. ติดตั้ง Playwright browsers (ครั้งแรกเท่านั้น)

```bash
npx playwright install
```

### 2. Run Tests

```bash
# Run all tests
npm run test:e2e

# Run in headed mode (เห็น browser)
npm run test:e2e:headed

# Run in UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report
```

### 3. เขียน Test

```typescript
import { test, expect } from '../fixtures';

test('example', async ({ landingPage, searchPage }) => {
  await landingPage.navigate();
  await landingPage.clickSearch();
  await searchPage.search('Software Engineer');
  expect(await searchPage.getJobCount()).toBeGreaterThan(0);
});
```

## 📝 Next Steps

1. ✅ **เสร็จแล้ว**: สร้าง Page Object Models สำหรับทุกหน้า
2. ⏳ **ยังไม่ทำ**: เขียน Test Cases จริง
3. ⏳ **แนะนำ**: เพิ่ม data-testid ใน components ของแอป
4. ⏳ **แนะนำ**: Setup authentication state management
5. ⏳ **แนะนำ**: เพิ่ม test data fixtures

## 🔍 สิ่งที่ควรทำต่อ

### ในโค้ดแอป (src/)

เพิ่ม `data-testid` attributes ใน components สำคัญ:

```tsx
// ตัวอย่าง
<button data-testid="submit-button">Submit</button>
<div data-testid="job-card">...</div>
<p data-testid="error-message">{error}</p>
```

### เขียน Tests

สร้างไฟล์ test จริงใน `tests/` folder:

- `tests/auth.spec.ts` - Authentication tests
- `tests/search.spec.ts` - Search functionality tests
- `tests/job-post.spec.ts` - Job posting tests
- `tests/admin/*.spec.ts` - Admin tests
- และอื่นๆ

## 📚 Documentation

อ่าน `tests/README.md` สำหรับคู่มือการใช้งานแบบละเอียด
