import { test } from '../../utils/fixtures';
import { expect } from '../../utils/custom-expect';
import { faker } from '@faker-js/faker';

test('HAR Flow - Article lifecycle with comments', async ({ api }) => {

    const articleTitle = faker.lorem.sentence(4)
    const articleDescription = faker.lorem.sentence(6)
    const articleBody = faker.lorem.paragraph(2)
    const articleRequest = {
        article: {
            title: articleTitle,
            description: articleDescription,
            body: articleBody,
            tagList: []
        }
    }

    // Create new article
    const createArticleResponse = await api
        .path('/articles')
        .body(articleRequest)
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual(articleTitle)

    const articleSlug = createArticleResponse.article.slug

    // Get new article
    const getArticleResponse = await api
        .path(`/articles/${articleSlug}`)
        .getRequest(200)
    await expect(getArticleResponse).shouldMatchSchema('articles', 'GET_article')
    expect(getArticleResponse.article.slug).shouldEqual(articleSlug)
    expect(getArticleResponse.article.title).shouldEqual(articleTitle)

    // Get new article's comments
    const commentsResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .getRequest(200)
    await expect(commentsResponse).shouldMatchSchema('articles', 'GET_articles_comments')
    expect(commentsResponse.comments).shouldEqual([])

    // Create new comment to new article
    const commentBody = faker.lorem.sentence(5)
    const createCommentResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .body({ comment: { body: commentBody } })
        .postRequest(200)
    await expect(createCommentResponse).shouldMatchSchema('articles', 'POST_articles_comments')
    expect(createCommentResponse.comment.body).shouldEqual(commentBody)
    expect(createCommentResponse.comment.id).toBeGreaterThan(0)

    // Get new article's comments
    const updatedCommentsResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .getRequest(200)
    await expect(updatedCommentsResponse).shouldMatchSchema('articles', 'GET_articles_comments')
    expect(updatedCommentsResponse.comments[0].body).shouldEqual(commentBody)

    // Added to run other specs in directory
    await api
        .path(`/articles/${articleSlug}`)
        .deleteRequest(204)

    const articlesWithPrivateResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesWithPrivateResponseTwo).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesWithPrivateResponseTwo.articles[0].title).not.shouldEqual(articleTitle)
})