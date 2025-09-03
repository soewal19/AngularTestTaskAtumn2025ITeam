import { test, expect } from '@playwright/test';

test.describe('Engineer Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу с формой
    await page.goto('/');
  });

  test('should display the form', async ({ page }) => {
    // Проверяем, что форма отображается
    await expect(page.getByRole('form')).toBeVisible();
    
    // Проверяем наличие полей формы
    await expect(page.getByLabel('Имя')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Сообщение')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отправить' })).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    // Пытаемся отправить пустую форму
    await page.getByRole('button', { name: 'Отправить' }).click();
    
    // Проверяем сообщения об ошибках
    await expect(page.getByText('Имя обязательно')).toBeVisible();
    await expect(page.getByText('Email обязателен')).toBeVisible();
    await expect(page.getByText('Сообщение обязательно')).toBeVisible();
  });

  test('should submit the form with valid data', async ({ page }) => {
    // Заполняем форму
    await page.getByLabel('Имя').fill('Тестовый пользователь');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Сообщение').fill('Тестовое сообщение');
    
    // Отправляем форму
    await page.getByRole('button', { name: 'Отправить' }).click();
    
    // Проверяем успешную отправку
    await expect(page.getByText('Сообщение успешно отправлено')).toBeVisible();
  });
});
