import { test as base } from '@playwright/test';
import { RequestHandler } from '../utils/request-handler';
import { APILogger } from './logger';
import { setCustomExpectLogger } from './custom-expect';
import { config } from '../api-test.config';
import { createToken } from '../helpers/createToken';


export type TestOptions = {
    api: RequestHandler
    config: typeof config
}

export type WorkerFixture = {
    authToken: string
}

export const test = base.extend<TestOptions, WorkerFixture>({
    authToken: [async ({ }, use) => {
        const authToken = await createToken(config.userEmail, config.userPassword)
        await use(authToken)
    }, { scope: 'worker' }],

    api: async ({ request, authToken }, use) => {
        const logger = new APILogger()
        setCustomExpectLogger(logger)
        const requestHandler = new RequestHandler(request, config.apiUrl, logger, authToken)
        await use(requestHandler)
    },

    config: async ({ }, use) => {
        await use(config)
    }
})

//  request: async ({ request }, use, testInfo) => {
//         // Start tracing on the API Request Context before the test runs
//         await request.tracing.start({
//             name: testInfo.title,
//             snapshots: true,
//             screenshots: true
//         });
//         await use(request);
//         // After the test finishes, check if it failed
//         if (testInfo.status !== testInfo.expectedStatus) {
//             // Create a unique path for the trace file artifact
//             const tracePath = testInfo.outputPath('api-trace.zip');
//             // Stop and export the trace file
//             await request.tracing.stop({ path: tracePath });
//             // Attach the trace file directly to the HTML report card
//             await testInfo.attachments.push({
//                 name: 'trace',
//                 path: tracePath,
//                 contentType: 'application/zip'
//             });
//         } else {
//             // If the test passed, discard the trace data cleanly
//             await request.tracing.stop();
//         }
//     },

// request: async ({ playwright }, use, testInfo) => {
//     // 1. Manually create an explicit API context
//     const apiContext = await playwright.request.newContext({});

//     // 2. Start tracing on the context itself
//     await apiContext.tracing.start({
//         name: testInfo.title,
//         snapshots: true
//     });

//     // Pass this explicit context to the test block
//     await use(apiContext);

//     // 3. Save the trace if the test fails
//     if (testInfo.status !== testInfo.expectedStatus) {
//         const tracePath = testInfo.outputPath('api-trace.zip');
//         await apiContext.tracing.stop({ path: tracePath });

//         // Attach to HTML report
//         await testInfo.attachments.push({
//             name: 'trace',
//             path: tracePath,
//             contentType: 'application/zip'
//         });
//     } else {
//         await apiContext.tracing.stop();
//     }

//     // Clean up the context
//     await apiContext.dispose();
// },