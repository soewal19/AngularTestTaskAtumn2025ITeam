import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:4200',
    supportFile: false,
    specPattern: 'src/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true,
    // Отключаем изоляцию тестов, чтобы не перезагружать страницу между тестами
    testIsolation: false,
    setupNodeEvents(on, config) {
      // Можно добавить обработчики событий Node.js здесь
    },
    // Включаем поддержку TypeScript
    experimentalWebKitSupport: true
  },
  
});
