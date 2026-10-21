import { APILogger } from "../utils/logger";
import { RequestHandler } from "../utils/request-handler";
import { config } from "../api-test.config";
import { request } from "@playwright/test";

export async function createToken(email: string, password: string) {
    const context = await request.newContext()
    const logger = new APILogger()
    const api = new RequestHandler(context, config.apiUrl, logger)

    try {
        const tokenResponse = await api
            .path('/users/login')
            .body({ "user": { "email": email, "password": password } })
            .postRequest(200)
        return 'Token ' + tokenResponse.user.token
    } catch (error: any) {
        Error.captureStackTrace(error, createToken)
        throw error
    } finally {
        await context.dispose()
    }
}

// export async function createToken(api: RequestHandler, email: string, password: string) {

//     const tokenResponse = await api
//         .path('/users/login')
//         .body({ "user": { "email": email, "password": password } })
//         .postRequest(200)
//     return 'Token ' + tokenResponse.user.token

// }


// This code defines an asynchronous function named createToken designed to log an application user in via an API call, safely extract their authentication token, and clean up network resources afterward. It features a robust architecture utilizing custom helper classes (APILogger, RequestHandler) and advanced error handling.
// Here is the step-by-step breakdown of how it works:

// 🏗️ 1. Initialization and Setup

// typescript
// export async function createToken(email: string, password: string) {
//     const context = await request.newContext()
//     const logger = new APILogger()
//     const api = new RequestHandler(context, config.apiUrl, logger)
// Use code with caution.
// • request.newContext(): This is Playwright’s native API testing utility. It spins up an isolated, clean state to perform HTTP requests (separate from any browser state).
// • new APILogger(): Instantiates a custom logging class. This tracks outgoing HTTP requests and responses (this is likely where the getRecentLogs() data from your previous code snippets comes from).
// • new RequestHandler(...): Instantiates a custom helper class (a "Wrapper" or "Builder" pattern) that bundles the Playwright context, base config.apiUrl, and the logger together to make executing API requests simpler and cleaner.

// 🚀 2. The API Execution (try Block)

// typescript
//     try {
//         const tokenResponse = await api
//             .path('/users/login')
//             .body({ "user": { "email": email, "password": password } })
//             .postRequest(200)
//         return 'Token ' + tokenResponse.user.token
// Use code with caution.
// • Method Chaining Pattern: The code uses a fluent interface pattern to sequentially configure the request:
// 	• .path('/users/login'): Appends the login endpoint to the base API URL.
// 	• .body(...): Attaches the payload containing the user's email and password inside the specific structure the backend expects ({ user: { ... } }).
// 	• .postRequest(200): Sends a POST network request to the backend. It also passes 200 as an argument, meaning it likely validates that the response code is explicitly 200 OK before passing back the data.
// • return 'Token ' + ...: Once successful, it parses the JSON response, extracts the authentication token string, and prepends 'Token ' to format it (this is a common standard for Authorization headers like Authorization: Token abc123xyz).

// 🚨 3. Clean Stack Traces (catch Block)

// typescript
//     } catch (error: any) {
//         Error.captureStackTrace(error, createToken)
//         throw error
//     }
// Use code with caution.
// • Error.captureStackTrace(error, createToken): This is a powerful V8 JavaScript engine trick. If the login fails (e.g., wrong password, 500 error), this method re-writes the error's stack trace to completely hide the internal workings of the createToken function itself.
// • Why it matters: When the test fails, your terminal reports won't show confusing errors buried deep within your wrapper file (RequestHandler.ts). Instead, the stack trace will point directly to the exact line in your test file where createToken() was originally called. This makes debugging significantly faster.
// • throw error: Rethrows the freshly modified error so Playwright knows the action failed.

// 🧹 4. Resource Cleanup (finally Block)

// typescript
//     } finally {
//         await context.dispose()
//     }
// }
// Use code with caution.
// • finally: Code inside a finally block is guaranteed to execute no matter what—whether the try block succeeded perfectly or the catch block captured a massive crash.
// • await context.dispose(): Cleans up and destroys the Playwright API request context. This releases system memory and closes lingering network connections. Failing to do this can lead to memory leaks when thousands of tests are executed in sequence.