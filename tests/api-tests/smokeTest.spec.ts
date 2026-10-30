import { test } from '../../utils/fixtures';
import { expect } from '../../utils/custom-expect';
import { validateSchema } from '../../utils/schema-validator';
// import { createToken } from '../../helpers/createToken';
import articleRequestPayload from '../../request-objects/POST-article.json';
import { faker } from '@faker-js/faker';
import { getNewRandomArticle } from '../../utils/data-generator';

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
    expect(articlesResponse.articles.length).shouldBeLessThanOrEqual(10) // Need to disable this assertion if you run update-schemas.prompt.md in Copilot Chat
    expect(articlesResponse.articlesCount).shouldEqual(10) // Need to disable this assertion if you run update-schemas.prompt.md in Copilot Chat
    for (const article of articlesResponse.articles) {
        const sanitizedTitle = article.title.trim().replace(/,/g, '').replace(/\s+/g, '-')
        expect(article.slug).toMatch(new RegExp(`^${sanitizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+$`))
    }
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
    // const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload)) // This line of code is needed when you run tests in parallel. It breaks the dependency on the initial reference to original object
    // articleRequest.article.title = "This is an object title"
    const articleRequest = getNewRandomArticle()
    const createArticleResponse = await api
        .path('/articles')
        // .headers({ Authorization: authToken })
        .body(articleRequest)
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title)
    const slugId = createArticleResponse.article.slug

    const articlesWithPrivateResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    await expect(articlesWithPrivateResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesWithPrivateResponse.articles[0].title).shouldEqual(articleRequest.article.title)

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
    expect(articlesWithPrivateResponseTwo.articles[0].title).not.shouldEqual(articleRequest.article.title)
})

test('Create, Update and Delete Article', async ({ api }) => {
    const articleTitle = faker.lorem.sentence(5)
    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload))
    articleRequest.article.title = articleTitle
    const createArticleResponse = await api
        .path('/articles')
        // .headers({ Authorization: authToken })
        .body(articleRequest)
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual(articleTitle)
    const slugId = createArticleResponse.article.slug

    const articleTitleTwo = faker.lorem.sentence(5)
    articleRequest.article.title = articleTitleTwo
    const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        // .headers({ Authorization: authToken })
        .body(articleRequest)
        .putRequest(200)
    await expect(updateArticleResponse).shouldMatchSchema('articles', 'PUT_articles')
    expect(updateArticleResponse.article.title).shouldEqual(articleTitleTwo)
    const newSlugId = updateArticleResponse.article.slug

    const articlesWithPrivateResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        // .headers({ Authorization: authToken })
        .getRequest(200)
    await expect(articlesWithPrivateResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesWithPrivateResponse.articles[0].title).shouldEqual(articleTitleTwo)

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
    expect(articlesWithPrivateResponseTwo.articles[0].title).not.shouldEqual(articleTitleTwo)
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

// By using JSON.parse(JSON.stringify(articleRequestPayload)), the test creates a isolated, mutable copy of the JSON template. This ensures that any runtime modifications made to articleRequest during the test do not pollute or mutate the imported articleRequestPayload module for subsequent tests.