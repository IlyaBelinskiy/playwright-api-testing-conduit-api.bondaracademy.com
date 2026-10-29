import { test, expect } from '@playwright/test';
import tags from '../../test-data/tags.json';
import user from '../../test-data/user.json';
import article from '../../test-data/article.json';

// test.beforeEach(async ({ page }) => {

//     // Mocking API --> Edge cases, hard cases, error messages. The full integration test IS NOT saved here because there is no server response
//     await page.route('*/**/api/tags', async route => { // */** - A wildcard concept. It replaces any base URL we have. (route) --> TypeScript allows to use only route if it's the only parameter in the callback array function
//         await route.fulfill({ // Fulfills route's request with given response
//             // body: JSON.stringify(tags)
//             json: tags
//         })
//     })

//     // Modify API Response --> Edge cases, hard cases, error messages. Using to mimic the behaviour, some scenario on you app but the response is pretty big. The full integration test IS saved here because there is a server response
//     await page.route('*/**/api/articles*', async route => {
//         const response = await route.fetch() // Fetch the response from the server. Performs the request and fetches result without fulfilling it, so that the response could be modified and then fulfilled
//         const responseJSON = await response.json()
//         responseJSON.articles[0].title = 'This is a MOCK title for the article'
//         responseJSON.articles[0].description = 'This is a MOCK description for the article'
//         responseJSON.articles[0].favoritesCount = 1000000
//         await route.fulfill({ // Fulfills route's request with given response
//             json: responseJSON
//         })
//     })

//     await page.goto('https://conduit.bondaracademy.com/')
// })

test('has title', async ({ page }) => {

    // Mocking API & Modify API Response: In order to work the page.route() method must be call BEFORE the intercepting API request call

    // Mocking API --> Edge cases, hard cases, error messages. The full integration test IS NOT saved here because there is no server response
    await page.route('*/**/api/tags', async route => { // */** - A wildcard concept. It replaces any base URL we have. (route) --> TypeScript allows to use only route if it's the only parameter in the callback array function
        await route.fulfill({ // Fulfills route's request with given response
            // body: JSON.stringify(tags)
            json: tags
        })
    })

    // Modify API Response --> Edge cases, hard cases, error messages. Using to mimic the behaviour, some scenario on you app but the response is pretty big. The full integration test IS saved here because there is a server response
    await page.route('*/**/api/articles*', async route => {
        const response = await route.fetch() // Fetch the response from the server. Performs the request and fetches result without fulfilling it, so that the response could be modified and then fulfilled
        const responseJSON = await response.json()
        responseJSON.articles[0].title = 'This is a MOCK title for the article'
        responseJSON.articles[0].description = 'This is a MOCK description for the article'
        responseJSON.articles[0].favoritesCount = 1000000
        await route.fulfill({ // Fulfills route's request with given response
            json: responseJSON
        })
    })

    await page.goto('/')

    await expect(page.locator('.navbar-brand')).toHaveText(/conduit/)
    await expect(page.locator('.sidebar .tag-pill')).toContainText(['Automation', 'Playwright']) // If you are mocking some API requests, there MUST BE validation inside of the test, preferably with a locator assertion, to make sure that application is in the right state when you apply the mock
    await expect(page.locator('.preview-link h1').first()).toContainText('This is a MOCK title for the article')
    await expect(page.locator('.preview-link p').first()).toContainText('This is a MOCK description for the article')
    await expect(page.locator('app-favorite-button').first()).toHaveText('1000000')
})

test('Delete article', async ({ page, request }) => {

    // Login API request
    const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: user
    })
    expect(loginResponse.status()).toEqual(200)
    const loginResponseJSON = await loginResponse.json()
    const token = loginResponseJSON.user.token

    // Create Article API request
    const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
        headers: {
            Authorization: `Token ${token}`
        },
        data: article
    })
    expect(newArticleResponse.status()).toEqual(201)

    await page.goto('/')

    // Login
    // await page.getByText('Sign in').click()
    // await page.getByRole('textbox', { name: 'Email' }).fill('punk@xyz.com')
    // await page.getByRole('textbox', { name: 'Password' }).fill('punk1987')
    // await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.locator('.preview-link h1').first()).toContainText('Test title')

    // Delete Article
    await page.getByText('Test title').click()
    await page.getByRole('button', { name: 'Delete Article' }).first().click()
    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0') // A good point that when you make a negative assertions in the test, it is possible that negative assertions can be false possitive. To avoid it a good rule of thumb is to add a dynamic wait waitForResponse() that would wait for the completion of the API call in the background, making sure that your application in the right state before the validation
    await expect(page.locator('.preview-link h1').first()).not.toContainText('Test title')
})

test('Create article', async ({ page, request }) => {
    await page.goto('/')

    // Login
    // await page.getByText('Sign in').click()
    // await page.getByRole('textbox', { name: 'Email' }).fill('punk@xyz.com')
    // await page.getByRole('textbox', { name: 'Password' }).fill('punk1987')
    // await page.getByRole('button', { name: 'Sign in' }).click()

    // Create Article
    await page.getByText('New Article').click()
    await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright is awesome framework')
    await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('We can use APIs in Playwright')
    await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('Automate any web application in Playwright')
    await page.getByRole('button', { name: 'Publish Article' }).click()

    // Intercept Browser API Response. In order to work the page.waitForResponse method must be call JUST AFTER after the calling of intercepted API request
    const newArticleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
    const newArticleResponseJSON = await newArticleResponse.json()
    const slugID = newArticleResponseJSON.article.slug

    await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome framework')
    await page.getByText('Home').click()
    await expect(page.locator('.preview-link h1').first()).toContainText('Playwright is awesome framework')

    // Login API request
    const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: user
    })
    expect(loginResponse.status()).toEqual(200)
    const loginResponseJSON = await loginResponse.json()
    const token = loginResponseJSON.user.token

    // Delete Article API request
    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugID}`, {
        headers: {
            Authorization: `Token ${token}`
        }
    })
    expect(deleteResponse.status()).toEqual(204)
})