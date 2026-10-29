import { test, expect, request } from '@playwright/test';

test('create article', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').click()
    await page.getByRole('textbox', { name: 'Email' }).fill(process.env.PROD_EMAIL!) // The non-null assertion operator (!) ❌ Bad Use Case: External Data
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PROD_PASSWORD!) // The non-null assertion operator (!) ❌ Bad Use Case: External Data
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.getByText('New Article').click()
    await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright is awesome')
    await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('About the Playwright')
    await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('We like to use playwright for ui tests')
    await page.getByRole('button', { name: 'Publish Article' }).click()
    await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome')
    await page.getByText('Home').click()
    // await page.getByText('Global feed').click()

    await page.getByText('Playwright is awesome').click()
    await page.getByRole('button', { name: 'Delete Article' }).first().click()
    // await page.getByText('Global Feed').click()
    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0') // A good point that when you make a negative assertions in the test, it is possible that negative assertions can be false possitive. To avoid it a good rule of thumb is to add a dynamic wait waitForResponse() that would wait for the completion of the API call in the background, making sure that your application in the right state before the validation
    await expect(page.locator('app-article-list h1').first()).not.toContainText('Playwright is awesome')
})

// The non-null assertion operator (!) is a TypeScript-specific feature that tells the compiler: "I know more than you do; I guarantee this value is neither null nor undefined, so please don't throw a type error here." [1, 2]
// It is purely a build-time tool for TypeScript's type checker and disappears completely when your code is compiled into JavaScript.


// The Problem in Your Test

// When you wrote process.env.PROD_EMAIL!, you silenced the TypeScript error, but you didn't actually fix the runtime data issue:
// 1. TypeScript Check (Build-time): TypeScript sees process.env.PROD_EMAIL could be a string or undefined. By adding !, you forced TypeScript to treat it strictly as a string. The compiler smiled and let it pass.
// 2. JavaScript Execution (Runtime): At runtime, the operator vanishes. JavaScript executed page.fill(undefined). Because the .env file path was wrong, the actual value was undefined, causing Playwright to crash.

// When to Use It vs. Avoid It


// ❌ Bad Use Case: External Data

// Never use ! for values coming from outside your code control, such as environment variables, API responses, or database queries. If the data is missing, your code will crash at runtime.

// Good Use Case: Known DOM / App State

// Use ! when you are 100% certain a value exists due to logic that TypeScript cannot track.
// typescript
// const userMap = new Map([["id_1", "Alice"]]);

// // TypeScript thinks this might be undefined because it doesn't know "id_1" exists
// const user = userMap.get("id_1")!;
// Use code with caution.

// Safer Alternatives to !

// Instead of lying to the compiler with !, you can handle the potential undefined safely using these three patterns:

// 1. The Logical OR Fallback (||)

// Provide a default string value if the environment variable is missing.
// typescript
// await page.getByRole('textbox', { name: 'Email' }).fill(process.env.PROD_EMAIL || 'fallback@xyz.com');
// Use code with caution.

// 2. Explicit Type Assertions (as string)

// If you want to cast it but keep visibility of what you are doing, though this has the same runtime risk as !.
// typescript
// await page.getByRole('textbox', { name: 'Email' }).fill(process.env.PROD_EMAIL as string);
// Use code with caution.

// 3. Strict Runtime Guard (Highly Recommended)

// Throw a descriptive error early so you immediately know why your test suite is failing before Playwright even fires up a browser.
// typescript
// const email = process.env.PROD_EMAIL;
// if (!email) throw new Error("CRITICAL: PROD_EMAIL is not defined in your environment config!");

// await page.getByRole('textbox', { name: 'Email' }).fill(email);
// Use code with caution.

// Feature / Behavior	Non-Null Assertion (!)	Runtime Guard (if (!val))	Fallback Operator (||)
// Type Check Effect	Silences TS error	Resolves TS error naturally	Resolves TS error naturally
// Runtime Effect	None (disappears)	Halts execution safely	Provides alternative value
// Crash Prevention	❌ No	Yes	Yes
// Best Used For	Internal map/array keys	Config & Env variables	Optional UI fields / defaults
