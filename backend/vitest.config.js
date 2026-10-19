import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Settings shared by every test run. Tests NEVER read the real .env: DOTENV_CONFIG_PATH points
// src/config/env.js's `import 'dotenv/config'` at a file that doesn't exist, so the only values
// are the fake ones below. Same behaviour on every laptop and in CI, and no real API keys
// (Stripe, Resend...) are ever used by a test.
const baseEnv = {
  DOTENV_CONFIG_PATH: '.env.tests-use-no-file',
  DOTENV_CONFIG_QUIET: 'true',
  NODE_ENV: 'test',
  CLIENT_URL: 'http://localhost:5173',
  JWT_ACCESS_SECRET: 'test-secret-at-least-16-chars',
  STRIPE_SECRET_KEY: 'sk_test_dummy',
  BCRYPT_ROUNDS: '4', // fast hashing in tests (production keeps 12, see src/config/env.js)
  GUIDE_PASSWORD: 'test-guide-password',
  PROTECTED_ACCOUNTS: 'shared-demo@test.dev', // the tests' own "demo account" (see tests/api/protected.test.js)
};

// The API tests' database. In CI it's set by the workflow; on a laptop it's TEST_DATABASE_URL
// in .env (read here on purpose, only this one value).
const localEnv = existsSync('.env') ? parse(readFileSync('.env')) : {};
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? localEnv.TEST_DATABASE_URL;

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.js'],
          // Points nowhere on purpose: a unit test can never touch a real database.
          env: { ...baseEnv, DATABASE_URL: 'postgresql://test:test@localhost:5432/no_database' },
        },
      },
      {
        test: {
          name: 'api',
          include: ['tests/api/**/*.test.js'],
          env: { ...baseEnv, DATABASE_URL: testDatabaseUrl ?? '' },
          // Once per run: safety checks, apply migrations, empty the tables (tests/api/global-setup.js).
          globalSetup: ['tests/api/global-setup.js'],
          setupFiles: ['tests/api/setup.js'],
          // All files share one database, so run them one after another.
          fileParallelism: false,
          testTimeout: 20_000, // a sleeping Neon database can take a few seconds to wake up
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
