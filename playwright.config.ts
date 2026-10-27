/// <reference types="node" />

import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://conduit.bondaracademy.com/',
    trace: 'retain-on-failure'
  },

  projects: [
    {
      name: 'api-testing',
      testDir: './tests/api-tests',
      dependencies: ['api-smoke-tests'],
    },
    {
      name: 'api-smoke-tests',
      testDir: './tests/api-tests',
      testMatch: 'example**'
    },
    {
      name: 'ui-tests',
      testDir: './tests/ui-tests',
      // fullyParallel: true, // This setting can be used in project scope
      // workers: 3,  // This setting can be used in project scope
      use: {
        defaultBrowserType: 'chromium'
      }
    }
  ],
});