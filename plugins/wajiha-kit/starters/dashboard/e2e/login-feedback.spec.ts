import { endpoints } from '@/constants/api';
import { expect, test, authUrl } from './fixtures/app';

test('login shows the shared fallback for an empty server error', async ({
  page,
  language,
}) => {
  await page.route(`${authUrl(endpoints.auth.login)}`, (route) =>
    route.fulfill({ status: 500, body: '' }),
  );
  await page.goto('/login');
  await page.getByLabel(/^(username|اسم المستخدم)\s*\*?$/i).fill('admin');
  await page.getByLabel(/^(password|كلمة المرور)\s*\*?$/i).fill('secret');
  await page.getByRole('button', { name: /sign in|تسجيل الدخول/i }).click();
  const feedback = page.locator('[data-sonner-toast][data-type="error"]');
  await expect(feedback).toHaveCount(1);
  await expect(feedback).toContainText(
    language === 'ar' ? 'خطأ في الخادم' : 'Server error',
  );
  await expect(
    page.getByText(/to your work account|حساب العمل للمتابعة/i),
  ).toBeVisible();
});
