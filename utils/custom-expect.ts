import { expect as baseExpect } from '@playwright/test';
import { APILogger } from './logger';

let apiLogger: APILogger

export const setCustomExpectLogger = (logger: APILogger) => {
    apiLogger = logger
}

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            shouldEqual(expected: T): R,
            shouldBeLessThanOrEqual(expected: T): R
        }
    }
}

export const expect = baseExpect.extend({
    shouldEqual(received: any, expected: any) {
        let pass: boolean
        let logs: string = ''

        try {
            baseExpect(received).toEqual(expected);
            pass = true
            if (this.isNot) {
                logs = apiLogger.getRecentLogs()
            }
        } catch (e: any) {
            pass = false
            logs = apiLogger.getRecentLogs()
        }

        const hint = this.isNot ? 'not' : '' // The JavaScript conditional operator, also known as the ternary operator, is a single-line shorthand for an if...else statement. It is the only operator in JavaScript that takes three operands.
        const message = this.utils.matcherHint('shouldEqual', undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Activity: \n${logs}`

        return {
            message: () => message,
            pass
        }
    },
    shouldBeLessThanOrEqual(received: any, expected: any) {
        let pass: boolean
        let logs: string = ''

        try {
            baseExpect(received).toBeLessThanOrEqual(expected)
            pass = true
            if (this.isNot) {
                logs = apiLogger.getRecentLogs()
            }
        } catch (e: any) {
            pass = false
            logs = apiLogger.getRecentLogs()
        }

        const hint = this.isNot ? 'not' : ''
        const message = this.utils.matcherHint('shouldBeLessThanOrEqual', undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Activity: \n${logs}`

        return {
            message: () => message,
            pass
        }
    }
})

// In TypeScript, declare global { namespace PlaywrightTest } is a type definition pattern used to add custom matchers (assertions) to Playwright's expect engine.
// It tells the TypeScript compiler: "Hey, I am modifying Playwright's global type system. Please recognize these new method names so my IDE autocomplete works and my code compiles without errors."
// Here is a breakdown of what each keyword does in this specific context:

// 🧩 The Breakdown

// • declare global
// By default, files with import or export statements are treated as isolated modules. Their types cannot leak out into the rest of the project. declare global breaks out of this module isolation, allowing you to inject types directly into the global scope where Playwright's types live.
// • namespace PlaywrightTest
// Playwright explicitly organizes its internal types inside a specific namespace called PlaywrightTest. By declaring a namespace with the exact same name, TypeScript performs declaration merging. It fuses your new definitions directly into Playwright's existing ones.
// • interface Matchers<R, T>
// This is the specific blueprint Playwright uses for standard assertions (like .toBe(), .toContain()). By adding your custom methods (like shouldEqual) inside this interface, they become available every time you type expect(value)..

// In this specific interface, R stands for the Return type and T stands for the type of the value being evaluated (the "received" value).
// When you extend Playwright's Matchers<R, T> interface, TypeScript uses these two generic placeholders to automatically ensure type safety during assertions.
// Here is exactly how R and T work under the hood when you use your custom matchers:

// 📥 T (The Expected Type)

// T is the type of the variable or element you passed into expect(). Because expected: T uses the same placeholder, TypeScript forces the value inside .shouldEqual() to match the type of the value passed to expect().
// • How it helps you: If you pass a number into expect, TypeScript will throw an error if you try to pass a string into .shouldEqual().
// typescript
// const statusCode = 200; // Type is number

// expect(statusCode).shouldEqual(200);   //  Valid: number matches number
// expect(statusCode).shouldEqual("200"); // ❌ TypeScript Error: Argument of type 'string'
//                                        //    is not assignable to parameter of type 'number'.
// Use code with caution.

// 📤 R (The Return Type)

// R represents what the matcher returns after it runs. In Playwright and Jest frameworks, assertions don't just stop after one check—they can be chained with modifiers like .not.
// • How it helps you: R ensures that if you chain .not, the return type updates correctly, and you still get full autocomplete for your custom methods.
// typescript
// // R ensures that `.not` works seamlessly and returns the correct matcher chain
// expect(statusCode).not.shouldEqual(404);
// Use code with caution.

// This code block is a core implementation snippet for a custom Playwright matcher. Its primary goal is to safely wrap a standard Playwright assertion (toEqual), determine if it passes or fails, and automatically capture debug logs from an API logger when things go wrong or when negative checks run.
// Here is the step-by-step breakdown of how it executes:

// 🚀 1. The Core Logic (try Block)

// typescript
// try {
//     baseExpect(received).toEqual(expected);
//     pass = true
// Use code with caution.
// • baseExpect(received).toEqual(expected): It delegates the actual data comparison to Playwright's built-in deep equality assertion.
// • pass = true: If the values match perfectly, baseExpect runs smoothly without throwing an error. The code then moves to this line and flags the test assertion as a success (true).

// 🔍 2. Handling Negative Assertions (this.isNot)

// typescript
//     if (this.isNot) {
//         logs = apiLogger.getRecentLogs()
//     }
// }
// Use code with caution.
// • this.isNot: Inside custom Playwright matchers, this.isNot is a built-in boolean flag. It automatically becomes true if the tester wrote .not before your matcher (e.g., expect(data).not.shouldEqual(wrongData)).
// • Why fetch logs here?: If this.isNot is true, a successful evaluation means the two values were equal. However, because the user expected them not to be equal, this means the assertion is actually going to fail the test. The code proactively pulls the apiLogger.getRecentLogs() so you can see what went wrong in your test reports.

// 🚨 3. Catching Failures (catch Block)

// typescript
// } catch (e: any) {
//     pass = false
//     logs = apiLogger.getRecentLogs()
// }
// Use code with caution.
// • catch (e: any): If baseExpect(...).toEqual(...) fails (the values do not match), Playwright throws a JavaScript error. This immediately stops the try block and jumps here.
// • pass = false: Explicitly flags the assertion as a failure so Playwright knows the test failed.
// • logs = apiLogger.getRecentLogs(): Because the assertion failed, it instantly fetches the latest network or application logs from apiLogger. This embeds the exact logs leading up to the crash directly into the failure context, saving you from digging through global terminal outputs.

// 💡 Summary of the Pattern

// This is an excellent automation framework pattern called Conditional Log Harvesting. Instead of flooding your console with logs for every single step, this code ensures that verbose network/API logs are only gathered when an assertion fails, making your test reports clean and highly actionable.

// This code snippet constructs a highly professional, formatted error message that Playwright will print in the terminal when your custom matcher fails. It utilizes Playwright's built-in formatting utilities (this.utils) to match the exact look and feel of native Playwright errors, while appending custom Recent API Activity logs at the bottom.
// Here is the step-by-step breakdown of how it works:

// 🔀 1. Toggling the "Not" Modifier

// typescript
// const hint = this.isNot ? 'not' : ''
// Use code with caution.
// • this.isNot: A built-in Playwright boolean that turns true if the tester used the .not prefix (e.g., expect(value).not.shouldEqual(x)).
// • hint: If .not was used, hint becomes 'not'. Otherwise, it is an empty string ''. This ensures your error message reads naturally (e.g., "Expected: not 200" vs "Expected: 200").

// 🎨 2. Generating the Header Hint

// typescript
// const message = this.utils.matcherHint('shouldEqual', undefined, undefined, { isNot: this.isNot }) +
// Use code with caution.
// • this.utils.matcherHint(...): This is a native utility method provided inside custom matchers. It generates the standardized syntax highlight header at the top of the failure block.
// • Resulting output: It builds a colorized terminal string that looks like this:
// 	• Regular: expect(received).shouldEqual(expected)
// 	• With .not: expect(received).not.shouldEqual(expected)

// 🧪 3. Diffing Expected vs. Received Values

// typescript
// '\n\n' +
// `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
// `Received: ${this.utils.printReceived(received)}\n\n` +
// Use code with caution.
// • this.utils.printExpected(expected): Wraps your expected value in formatting (usually coloring it green in the terminal) and cleanly stringifies objects/arrays.
// • this.utils.printReceived(received): Wraps the actual value found during execution in formatting (usually coloring it red in the terminal).
// • The \n\n and \n: Adds clean line breaks so the error isn't bunched up in your console.

// 📑 4. Injecting Custom Context Logs

// typescript
// `Recent API Activity: \n${logs}`
// Use code with caution.
// • This is the custom addition to the standard Playwright error block. It cleanly appends the logs gathered from your apiLogger right under the failed assertion.
// • Why this is powerful: When your test fails in a Continuous Integration (CI) pipeline (like GitHub Actions), you won't just see "Expected 200, Received 500". You will see the exact HTTP requests, headers, or payloads that triggered that 500 error directly inside the failing assertion block.