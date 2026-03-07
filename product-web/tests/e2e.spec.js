import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const usersPath = path.resolve(process.cwd(), '../product-api/users.txt');

function readUsers() {
  const raw = fs.readFileSync(usersPath, 'utf8').trim().split('\n');
  return raw.map((line) => {
    const parts = line.split(';').map((p) => p.trim());
    const obj = {};
    parts.forEach((part) => {
      const [k, v] = part.split('=').map((x) => x.trim());
      obj[k] = v;
    });
    return obj;
  });
}

async function login(page, user) {
  await page.goto('/login');
  await page.fill('input[type="text"], input:not([type])', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test('LIBRARIAN: QR выдача/возврат и скриншоты ключевых страниц', async ({ page }) => {
  const users = readUsers();
  const librarian = users.find((u) => u.role === 'LIBRARIAN');
  await login(page, librarian);

  await page.screenshot({ path: 'artifacts/screenshots/dashboard.png', fullPage: true });

  await page.goto('/loans');
  await page.screenshot({ path: 'artifacts/screenshots/loans-before.png', fullPage: true });

  await page.fill('input[placeholder="QR читателя"]', 'RDR-79002');
  await page.locator('select').first().selectOption({ index: 1 });

  const now = new Date(Date.now() + 2 * 24 * 3600 * 1000);
  const dateTime = now.toISOString().slice(0, 16);
  await page.fill('input[type="datetime-local"]', dateTime);
  await page.getByRole('button', { name: 'Оформить выдачу' }).click();
  await expect(page.getByText('ACTIVE').first()).toBeVisible();

  await page.getByRole('button', { name: 'Принять возврат' }).first().click();
  await expect(page.getByText('RETURNED').first()).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/loans-after.png', fullPage: true });

  await page.goto('/books');
  await page.screenshot({ path: 'artifacts/screenshots/books.png', fullPage: true });

  await page.goto('/reports');
  await page.screenshot({ path: 'artifacts/screenshots/reports.png', fullPage: true });
});

test('READER: ограничения доступа к операциям библиотекаря', async ({ page }) => {
  const users = readUsers();
  const reader = users.find((u) => u.role === 'READER');
  await login(page, reader);

  await page.goto('/loans');
  await expect(page.getByRole('button', { name: 'Оформить выдачу' })).toHaveCount(0);

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/dashboard/);

  await page.goto('/books');
  await page.screenshot({ path: 'artifacts/screenshots/reader-books.png', fullPage: true });
});

test('ADMIN: доступ к управлению пользователями', async ({ page }) => {
  const users = readUsers();
  const admin = users.find((u) => u.role === 'ADMIN');
  await login(page, admin);

  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: 'Управление пользователями' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/admin-users.png', fullPage: true });

  await page.goto('/login');
  await page.screenshot({ path: 'artifacts/screenshots/login-page.png', fullPage: true });
});
