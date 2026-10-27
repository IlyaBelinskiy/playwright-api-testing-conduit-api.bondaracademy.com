import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const processENV = process.env.TEST_ENV
const env = processENV || 'dev'
console.log('Test environment is: ' + env)

const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'punk@xyz.com',
    userPassword: 'punk1987'
}

if (env === 'qa') {
    config.userEmail = 'postpunk@xyz.com',
        config.userPassword = 'postpunk1987'
}

if (env === 'prod') {
    // if (!process.env.PROD_EMAIL || !process.env.PROD_PASSWORD) { // Option 2 Mandotory fields required
    //     throw Error(`Missing required environment variable`)
    // }
    config.userEmail = process.env.PROD_EMAIL as string, // Option 1 As a string
        config.userPassword = process.env.PROD_PASSWORD as string
}

export { config }

// CMD commands:

// (set "PROD_EMAIL=oipunk@xyz.com" & set "PROD_PASSWORD=oipunk1987") && npx playwright test smokeTest.spec.ts

// (set TEST_ENV=prod & set "PROD_EMAIL=oipunk@xyz.com" & set "PROD_PASSWORD=oipunk1987") && npx playwright test smokeTest.spec.ts

// (set TEST_ENV=prod) && npx playwright test smokeTest.spec.ts

// echo %PROD_EMAIL%

// echo %PROD_PASSWORD%


// The issue happens because using && in Windows Command Prompt (cmd.exe) includes a trailing space in your variable value.

// When you run set TEST_ENV=qa && ..., Windows sets TEST_ENV to "qa " (with a trailing space). If your Playwright test checks for env === 'qa', it will fail or return undefined because "qa " does not match "qa".

// Here are the best ways to fix this issue in cmd:

// 1. Remove the Trailing Space (Fastest cmd Fix)

// Move the && immediately next to your variable value, or wrap the assignment in parentheses:

// cmd

// set TEST_ENV=qa&& npx playwright test smokeTest.spec.ts
// 2. Use parentheses (safer for cmd):

// cmd

// (set TEST_ENV=dev) && npx playwright test smokeTest.spec.ts
