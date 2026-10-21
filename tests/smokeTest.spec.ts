import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
// import { createToken } from '../helpers/createToken';

// let authToken: string

// test.beforeAll('Get Token', async ({ api, config }) => {
//     // const tokenResponse = await api
//     //     .path('/users/login')
//     //     .body({ "user": { "email": config.userEmail, "password": config.userPassword } })
//     //     .postRequest(200)
//     // authToken = await createToken(api, config.userEmail, config.userPassword)
//     authToken = await createToken('postpunk@xyz.com', 'postpunk1987')
// })

// test.use({ extraHTTPHeaders: {}}) // Test scope. It overrides the global and project settings

test('Get All Articles', async ({ api }) => {
    const articlesResponse = await api
        .path('/articles')
        // .headers({ Authorization: authToken })
        .params({ limit: 10, offset: 0 })
        // .clearAuth()
        .getRequest(200)
    expect(articlesResponse.articles.length).shouldBeLessThanOrEqual(10)
    expect(articlesResponse.articlesCount).shouldEqual(10)
})

test('Get Test Tags', async ({ api }) => {
    const tagsResponse = await api
        .path('/tags')
        .getRequest(200)
    expect(tagsResponse.tags[0]).shouldEqual('Test')
    expect(tagsResponse.tags.length).shouldBeLessThanOrEqual(10)
})

test('Create and Delete Article', async ({ api }) => {
    const createArticleResponse = await api
        .path('/articles')
        // .headers({ Authorization: authToken })
        .body({ "article": { "title": "Test title Playwright 1.63", "description": "Some description", "body": "This is a body", "tagList": [] } })
        .postRequest(201)
    expect(createArticleResponse.article.title).shouldEqual('Test title Playwright 1.63')
    const slugId = createArticleResponse.article.slug

    const articlesWithPrivateResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    expect(articlesWithPrivateResponse.articles[0].title).shouldEqual('Test title Playwright 1.63')

    await api
        .path(`/articles/${slugId}`)
        // .headers({ Authorization: authToken })
        .deleteRequest(204)

    const articlesWithPrivateResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    expect(articlesWithPrivateResponseTwo.articles[0].title).not.shouldEqual('Test title Playwright 1.63')
})

test('Create, Update and Delete Article', async ({ api }) => {
    const createArticleResponse = await api
        .path('/articles')
        // .headers({ Authorization: authToken })
        .body({ "article": { "title": "Test title JavaScript", "description": "Some description", "body": "This is a body", "tagList": [] } })
        .postRequest(201)
    expect(createArticleResponse.article.title).shouldEqual('Test title JavaScript')
    const slugId = createArticleResponse.article.slug

    const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        // .headers({ Authorization: authToken })
        .body({ "article": { "title": "Test title JavaScript modified", "description": "Some description", "body": "This is a body", "tagList": [] } })
        .putRequest(200)
    expect(updateArticleResponse.article.title).shouldEqual('Test title JavaScript modified')
    const newSlugId = updateArticleResponse.article.slug

    const articlesWithPrivateResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    expect(articlesWithPrivateResponse.articles[0].title).shouldEqual('Test title JavaScript modified')

    await api
        .path(`/articles/${newSlugId}`)
        // .headers({ Authorization: authToken })
        .deleteRequest(204)

    const articlesWithPrivateResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    expect(articlesWithPrivateResponseTwo.articles[0].title).not.shouldEqual('Test title JavaScript modified')
})

// test('logger', () => {
//     const logger = new APILogger()
//     const logger2 = new APILogger()
//     logger.logRequest('POST', 'https://test.com/api', { Authorization: 'token' }, { foo: 'bar' })
//     logger.logResponse(200, { foo: 'bar' })
//     logger2.logRequest('GET', 'https://test.com/api123', { Authorization: 'token' }, { foo: 'bar' })
//     logger2.logResponse(200, { foo: 'bar' })
//     const logs = logger.getRecentLogs()
//     const logs2 = logger2.getRecentLogs()
//     console.log(logs)
//     console.log(logs2)
// })