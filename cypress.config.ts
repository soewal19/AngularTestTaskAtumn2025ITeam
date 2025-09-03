import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'src/**/*.e2e-spec.ts',
    video: false,
    screenshotOnRunFailure: true,
    // Отключаем изоляцию тестов, чтобы не перезагружать страницу между тестами
    testIsolation: false,
    setupNodeEvents(on, config) {
      // Можно добавить обработчики событий Node.js здесь
    },
    // Включаем поддержку TypeScript
    experimentalWebKitSupport: true,
    // Настройки для работы с Angular
    component: {
      devServer: {
        framework: 'angular',
        bundler: 'webpack',
      },
      specPattern: '**/*.cy.ts'
    }
  },
  // Настройки для TypeScript
  typescript: {
    // Указываем путь к tsconfig.json для тестов
    tsconfig: './cypress/tsconfig.json'
  }
});
