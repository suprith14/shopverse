import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    // Fake settings for every test run. src/config/env.js validates these at import time, and
    // dotenv never overwrites a variable that's already set, so these win over the real .env.
    // The database URL points nowhere on purpose: a unit test can never touch real data.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/shopverse_test',
      CLIENT_URL: 'http://localhost:5173',
      JWT_ACCESS_SECRET: 'test-secret-at-least-16-chars',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
    },
  },
});
