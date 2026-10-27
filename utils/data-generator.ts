import articleRequestPayload from '../request-objects/POST-article.json';
import { faker } from '@faker-js/faker';

export function getNewRandomArticle() {
    const articleRequest = structuredClone(articleRequestPayload)
    articleRequest.article.title = faker.lorem.sentence(5)
    articleRequest.article.description = faker.lorem.sentence(3)
    articleRequest.article.body = faker.lorem.paragraph(8)
    return articleRequest
}


// const articleRequest = structuredClone(articleRequestPayload)
// • Deep cloning: It creates a deep, independent copy of a baseline object called articleRequestPayload.
// • Preventing side effects: By using structuredClone, any changes made to articleRequest inside this function will not accidentally alter or corrupt the original articleRequestPayload template.