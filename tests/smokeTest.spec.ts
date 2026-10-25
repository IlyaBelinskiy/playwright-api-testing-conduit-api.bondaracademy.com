import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
import { validateSchema } from '../utils/schema-validator';
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
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponse.articles.length).shouldBeLessThanOrEqual(10)
    expect(articlesResponse.articlesCount).shouldEqual(10)
})

test('Get Test Tags', async ({ api }) => {
    const tagsResponse = await api
        .path('/tags')
        .getRequest(200)
    await expect(tagsResponse).shouldMatchSchema('tags', 'GET_tags')
    // await validateSchema('tags', 'GET_tags', tagsResponse)
    expect(tagsResponse.tags[0]).shouldEqual('Test')
    expect(tagsResponse.tags.length).shouldBeLessThanOrEqual(10)
})

test('Create and Delete Article', async ({ api }) => {
    const createArticleResponse = await api
        .path('/articles')
        // .headers({ Authorization: authToken })
        .body({ "article": { "title": "Test title Playwright 1.63", "description": "Some description", "body": "This is a body", "tagList": ["Test"] } })
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual('Test title Playwright 1.63')
    expect(createArticleResponse.article.description).shouldEqual('Some description')
    expect(createArticleResponse.article.body).shouldEqual('This is a body')
    expect(createArticleResponse.article.tagList[0]).shouldEqual('Test')
    const slugId = createArticleResponse.article.slug

    const articlesWithPrivateResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    await expect(articlesWithPrivateResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesWithPrivateResponse.articles[0].title).shouldEqual('Test title Playwright 1.63')
    expect(articlesWithPrivateResponse.articles[0].description).shouldEqual('Some description')
    expect(articlesWithPrivateResponse.articles[0].body).shouldEqual('This is a body')
    expect(articlesWithPrivateResponse.articles[0].tagList[0]).shouldEqual('Test')

    await api
        .path(`/articles/${slugId}`)
        // .headers({ Authorization: authToken })
        .deleteRequest(204)

    const articlesWithPrivateResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    await expect(articlesWithPrivateResponseTwo).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesWithPrivateResponseTwo.articles[0].title).not.shouldEqual('Test title Playwright 1.63')
    expect(articlesWithPrivateResponseTwo.articles[0].description).not.shouldEqual('Some description')
    expect(articlesWithPrivateResponseTwo.articles[0].body).not.shouldEqual('This is a body')
    expect(articlesWithPrivateResponseTwo.articles[0].tagList[0]).not.shouldEqual('Test')
})

test('Create, Update and Delete Article', async ({ api }) => {
    const createArticleResponse = await api
        .path('/articles')
        // .headers({ Authorization: authToken })
        .body({ "article": { "title": "Test title JavaScript", "description": "Some description", "body": "This is a body", "tagList": ["Zoom"] } })
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual('Test title JavaScript')
    expect(createArticleResponse.article.description).shouldEqual('Some description')
    expect(createArticleResponse.article.body).shouldEqual('This is a body')
    expect(createArticleResponse.article.tagList[0]).shouldEqual('Zoom')

    const slugId = createArticleResponse.article.slug

    const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        // .headers({ Authorization: authToken })
        .body({ "article": { "title": "Test title JavaScript modified", "description": "Some new description", "body": "This is a different body", "tagList": ["Git"] } })
        .putRequest(200)
    await expect(updateArticleResponse).shouldMatchSchema('articles', 'PUT_articles')
    expect(updateArticleResponse.article.title).shouldEqual('Test title JavaScript modified')
    expect(updateArticleResponse.article.description).shouldEqual('Some new description')
    expect(updateArticleResponse.article.body).shouldEqual('This is a different body')
    expect(updateArticleResponse.article.tagList[0]).shouldEqual('Git')
    const newSlugId = updateArticleResponse.article.slug

    const articlesWithPrivateResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    await expect(articlesWithPrivateResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesWithPrivateResponse.articles[0].title).shouldEqual('Test title JavaScript modified')
    expect(articlesWithPrivateResponse.articles[0].description).shouldEqual('Some new description')
    expect(articlesWithPrivateResponse.articles[0].body).shouldEqual('This is a different body')
    expect(articlesWithPrivateResponse.articles[0].tagList[0]).shouldEqual('Git')

    await api
        .path(`/articles/${newSlugId}`)
        // .headers({ Authorization: authToken })
        .deleteRequest(204)

    const articlesWithPrivateResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    await expect(articlesWithPrivateResponseTwo).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesWithPrivateResponseTwo.articles[0].title).not.shouldEqual('Test title JavaScript modified')
    expect(articlesWithPrivateResponseTwo.articles[0].description).not.shouldEqual('Some new description')
    expect(articlesWithPrivateResponseTwo.articles[0].body).not.shouldEqual('This is a different body')
    expect(articlesWithPrivateResponseTwo.articles[0].tagList[0]).not.shouldEqual('Git')
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