/// <reference types="node" />

import { APIRequestContext } from "@playwright/test";
import { APILogger } from "./logger";
import { test } from "@playwright/test";


export class RequestHandler {

    private request: APIRequestContext
    private logger: APILogger
    private baseUrl: string | undefined
    private defaultBaseUrl: string
    private apiPath: string = ''
    private queryParams: object = {}
    private apiHeaders: Record<string, string> = {}
    private apiBody: object = {}
    private defaultAuthToken: string
    private clearAuthFlag: boolean | undefined

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger, authToken: string = '') {
        this.request = request
        this.defaultBaseUrl = apiBaseUrl
        this.logger = logger
        this.defaultAuthToken = authToken
    }

    url(url: string) {
        this.baseUrl = url
        return this // Fluent Interface Design. By returning this at the end of the execution, we provide access for this method to other methods inside of this class. So using this approach, we'll be able to chain our methods one by one using just dot notation: url.path.params..
    }

    path(path: string) {
        this.apiPath = path
        return this
    }

    params(params: object) {
        this.queryParams = params
        return this
    }

    headers(headers: Record<string, string>) {
        this.apiHeaders = headers
        return this
    }

    body(body: object) {
        this.apiBody = body
        return this
    }

    clearAuth() {
        this.clearAuthFlag = true
        return this
    }

    async getRequest(statusCode: number) {
        let responseJSON: any

        const url = this.getUrl()
        await test.step(`GET request to: ${url}`, async () => {
            this.logger.logRequest('GET', url, this.getHeaders())
            const response = await this.request.get(url, {
                headers: this.getHeaders()
            })
            this.cleanupFields()
            const actualStatus = response.status()
            responseJSON = await response.json()

            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest)
        })

        return responseJSON
    }

    async postRequest(statusCode: number) {
        let responseJSON: any

        const url = this.getUrl()
        await test.step(`POST request to: ${url}`, async () => {
            this.logger.logRequest('POST', url, this.getHeaders(), this.apiBody)
            const response = await this.request.post(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            })
            this.cleanupFields()
            const actualStatus = response.status()
            responseJSON = await response.json()

            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.postRequest)
        })

        return responseJSON
    }

    async putRequest(statusCode: number) {
        let responseJSON: any

        const url = this.getUrl()
        await test.step(`PUT request to: ${url}`, async () => {
            this.logger.logRequest('PUT', url, this.getHeaders(), this.apiBody)
            const response = await this.request.put(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            })
            this.cleanupFields()
            const actualStatus = response.status()
            responseJSON = await response.json()

            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.putRequest)
        })

        return responseJSON
    }

    async deleteRequest(statusCode: number) {
        const url = this.getUrl()
        await test.step(`DELETE request to: ${url}`, async () => {
            this.logger.logRequest('DELETE', url, this.getHeaders())
            const response = await this.request.delete(url, {
                headers: this.getHeaders()
            })
            this.cleanupFields()
            const actualStatus = response.status()

            this.logger.logResponse(actualStatus)
            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)
        })
    }

    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`) // In JavaScript, ?? is the Nullish Coalescing Operator. It is a logical operator that returns its right-hand operand when its left-hand operand is either null or undefined. 
        for (const [key, value] of Object.entries(this.queryParams)) {  // Using for...of loop. Object.entries(this.queryParams) --> [ [ 'limit', 10 ], [ 'offset', 0 ] ]
            url.searchParams.append(key, value) //URLSearchParams { 'limit' => '10' } URLSearchParams { 'limit' => '10', 'offset' => '0' }
        }
        // Object.entries(this.queryParams).forEach(([key, value]) => { // Using array methods
        //     url.searchParams.append(key, value)
        // })
        return url.toString() // Returns a string containing the whole URL. It is a synonym for URL.href, though it can't be used to modify the value.
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod: Function) {
        if (actualStatus !== expectedStatus) {
            const logs = this.logger.getRecentLogs()
            const error = new Error(`Expected status ${expectedStatus} but got ${actualStatus}\n\nRecent API Activity: \n${logs}`)  // Error() object makes and throws anformed error message in console and report automatically
            Error.captureStackTrace(error, callingMethod) // A non-standard function that creates the stack property on the provided object. stack: A non-standard but universally supported string tracking the history of function calls (a stack trace) leading up to the point where the error object was instantiated.
            throw error // Use the throw keyword to halt execution and send the error up the call stack.
        }
    }

    private getHeaders() {
        if (!this.clearAuthFlag) {
            this.apiHeaders['Authorization'] = this.apiHeaders['Authorization'] || this.defaultAuthToken
        }
        return this.apiHeaders
    }

    private cleanupFields() {
        this.baseUrl = undefined,
            this.apiPath = '',
            this.queryParams = {},
            this.apiHeaders = {},
            this.apiBody = {}
        this.clearAuthFlag = false
    }
}

// new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`) --> URL {
//   href: 'https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',
//   origin: 'https://conduit-api.bondaracademy.com',
//   protocol: 'https:',
//   username: '',
//   password: '',
//   host: 'conduit-api.bondaracademy.com',
//   hostname: 'conduit-api.bondaracademy.com',
//   port: '',
//   pathname: '/api/articles',
//   search: '?limit=10&offset=0',
//   searchParams: URLSearchParams { 'limit' => '10', 'offset' => '0' },
//   hash: ''
// }

// <reference types="node" /> --> This code line tackles the problem: Error.captureStackTrace(error, callingMethod) has an error in .captureStackTrace method --> Property 'captureStackTrace' does not exist on type 'ErrorConstructor'.
//

// As an opposite to Ibtisam Tanveer's variant with creation a tsconfig.json file you can simply use this:
// To let TypeScript know about the Node.js types without a configuration file, use a triple-slash directive at the very top of your .ts file.

// Add this line as the absolute first line in your file:

// /// <reference types="node" />