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
    config.userEmail = '',
        config.userPassword = ''
}

export { config }


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
