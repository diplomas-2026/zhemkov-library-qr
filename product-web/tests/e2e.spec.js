import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const usersPath = path.resolve(process.cwd(), '../product-api/users.txt');
const screenshotsDir = path.resolve(process.cwd(), 'artifacts/screenshots');

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

function screenshotPath(name) {
  return path.join(screenshotsDir, `${name}.png`);
}

async function capture(page, name) {
  await page.screenshot({ path: screenshotPath(name), fullPage: true });
}

async function login(page, user) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible();
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Пароль').fill(user.password);
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  fs.rmSync(screenshotsDir, { recursive: true, force: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });
});

test('public screens and catalog details', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible();
  await capture(page, '01-login-page');

  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Создать аккаунт' })).toBeVisible();
  await capture(page, '02-register-page');

  await page.goto('/books');
  await expect(page.getByRole('heading', { name: /Каталог/ })).toBeVisible();
  await capture(page, '03-public-books-catalog');

  await page.getByRole('link', { name: 'Открыть' }).first().click();
  await expect(page).toHaveURL(/\/books\/\d+/);
  await expect(page.getByRole('link', { name: 'В каталог' })).toBeVisible();
  await capture(page, '04-public-book-details');
});

test('librarian screens, forms, and loan states', async ({ page }) => {
  const users = readUsers();
  const librarian = users.find((u) => u.role === 'LIBRARIAN');
  await login(page, librarian);

  await expect(page.getByRole('heading', { name: /Обзор/ })).toBeVisible();
  await capture(page, '05-librarian-dashboard');

  await page.goto('/books');
  await expect(page.getByRole('heading', { name: /Каталог/ })).toBeVisible();
  await page.getByRole('button', { name: 'Добавить книгу' }).click();
  await expect(page.getByRole('heading', { name: 'Новая книга' })).toBeVisible();
  await capture(page, '06-librarian-books-create-form');

  await page.getByRole('link', { name: 'Открыть' }).first().click();
  await expect(page.getByRole('heading', { name: 'Редактирование' })).toBeVisible();
  await capture(page, '07-librarian-book-details-edit');

  await page.goto('/readers');
  await expect(page.getByRole('heading', { name: /Читатели/ })).toBeVisible();
  await capture(page, '08-librarian-readers-list');

  await page.getByRole('cell', { name: 'RDR-79002' }).click();
  await expect(page).toHaveURL(/\/readers\/\d+/);
  await expect(page.getByRole('heading', { name: 'Выдать книгу этому читателю' })).toBeVisible();
  await capture(page, '09-reader-details');

  await page.goto('/loans');
  await expect(page.getByRole('heading', { name: /Выдача и/ })).toBeVisible();
  await capture(page, '10-loans-before-issue');

  await page.getByPlaceholder('Например, RDR-79001').fill('RDR-79002');
  await page.getByLabel('Экземпляр').first().selectOption({ index: 1 });

  const now = new Date(Date.now() + 2 * 24 * 3600 * 1000);
  const dateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  await page.getByLabel('Срок возврата').first().fill(dateTime);
  await page.getByRole('button', { name: 'Оформить выдачу' }).click();
  await expect(page.getByText('Выдача оформлена')).toBeVisible();
  await page.getByPlaceholder('Введите штрихкод читателя').fill('RDR-79002');
  await expect(page.getByRole('button', { name: 'Принять возврат' }).first()).toBeVisible();
  await capture(page, '11-loans-issued');

  await page.getByRole('button', { name: 'Принять возврат' }).first().click();
  await expect(page.getByText('Возврат принят')).toBeVisible();
  await capture(page, '12-loans-returned');

  await page.goto('/reports');
  await expect(page.getByRole('heading', { name: /Отчеты и/ })).toBeVisible();
  await capture(page, '13-reports-page');
});

test('admin and reader access coverage', async ({ page }) => {
  const users = readUsers();
  const admin = users.find((u) => u.role === 'ADMIN');
  const reader = users.find((u) => u.role === 'READER');

  await login(page, admin);
  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: /Пользователи и/ })).toBeVisible();
  await capture(page, '14-admin-users');

  await page.evaluate(() => window.localStorage.clear());

  await login(page, reader);
  await page.goto('/my-code');
  await expect(page.getByRole('heading', { name: /Мой/ })).toBeVisible();
  await capture(page, '15-reader-my-code');

  await page.goto('/loans');
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('button', { name: 'Оформить выдачу' })).toHaveCount(0);

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/dashboard/);
});
