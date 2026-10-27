import { test, expect } from '@playwright/test';

let authToken: string

test.beforeAll('Get Token', async ({ request }) => {
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: { "user": { "email": "punk@xyz.com", "password": "punk1987" } }
  })
  const tokenResponseJSON = await tokenResponse.json()
  authToken = 'Token ' + tokenResponseJSON.user.token
})

test('Get Test Tags', async ({ request }) => {
  const tagsResponse = await request.get('https://conduit-api.bondaracademy.com/api/tags')
  const tagsResponseJSON = await tagsResponse.json()

  expect(tagsResponse.status()).toEqual(200)
  expect(tagsResponseJSON.tags[0]).toEqual('Test')
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10)
});

test('Get All Articles', async ({ request }) => {
  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
  const articlesResponseJSON = await articlesResponse.json()

  expect(articlesResponse.status()).toEqual(200)
  expect(articlesResponseJSON.articles.length).toBeLessThanOrEqual(10)
  expect(articlesResponseJSON.articlesCount).toEqual(10)
})

test('Create and Delete Article', async ({ request }) => {
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "Test title Playwright 1.63",
        "description": "Some description",
        "body": "This is a body",
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  })
  const newArticleResponseJSON = await newArticleResponse.json()
  expect(newArticleResponse.status()).toEqual(201)
  expect(newArticleResponseJSON.article.title).toEqual('Test title Playwright 1.63')
  const slugId = newArticleResponseJSON.article.slug

  const articlesWithPrivateResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: authToken
    }
  })
  const articlesWithPrivateResponseJSON = await articlesWithPrivateResponse.json()
  expect(articlesWithPrivateResponse.status()).toEqual(200)
  expect(articlesWithPrivateResponseJSON.articles[0].title).toEqual('Test title Playwright 1.63')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: authToken
    }
  })
  expect(deleteArticleResponse.status()).toEqual(204)
})

test('Create, Update and Delete Article', async ({ request }) => {
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "Test title JavaScript",
        "description": "Some description",
        "body": "This is a body",
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  })
  const newArticleResponseJSON = await newArticleResponse.json()
  expect(newArticleResponse.status()).toEqual(201)
  expect(newArticleResponseJSON.article.title).toEqual('Test title JavaScript')
  const slugId = newArticleResponseJSON.article.slug

  const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    data: {
      "article": {
        "title": "Test title JavaScript modified",
        "description": "Some description",
        "body": "This is a body",
        "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  })
  const updateArticleResponseJSON = await updateArticleResponse.json()
  expect(updateArticleResponse.status()).toEqual(200)
  expect(updateArticleResponseJSON.article.title).toEqual('Test title JavaScript modified')
  const newSlugId = updateArticleResponseJSON.article.slug

  const articlesWithPrivateResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: authToken
    }
  })
  const articlesWithPrivateResponseJSON = await articlesWithPrivateResponse.json()
  expect(articlesWithPrivateResponse.status()).toEqual(200)
  expect(articlesWithPrivateResponseJSON.articles[0].title).toEqual('Test title JavaScript modified')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${newSlugId}`, {
    headers: {
      Authorization: authToken
    }
  })
  expect(deleteArticleResponse.status()).toEqual(204)
})



// headers: {
//       "Authorization": `Token ${authtoken}`, // String Interpolation is working
//   }