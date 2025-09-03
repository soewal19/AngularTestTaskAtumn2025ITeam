import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-tests',  // Директория с тестами
  fullyParallel: true,     // Параллельный запуск тестов
  forbidOnly: !!process.env.CI, // Запрет на тесты с .only в CI
  retries: process.env.CI ? 2 : 0, // Повторные попытки в CI
  workers: process.env.CI ? 1 : undefined, // Количество воркеров
  reporter: 'html',        // Генерация HTML отчета
  use: {
    baseURL: 'http://localhost:4200', // Базовый URL приложения
    trace: 'on-first-retry', // Сохранение трассировки при ошибках
    screenshot: 'only-on-failure', // Скриншоты при падении тестов
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm start',  // Команда для запуска сервера разработки
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
