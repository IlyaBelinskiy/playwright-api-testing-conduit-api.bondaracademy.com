import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import user from '../test-data/user.json';


const authFile = path.join(__dirname, '../playwright/.auth/user.json')

setup('authenticate', async ({ page, request }) => {
    if (fs.existsSync(authFile)) {
        const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
            data: user
        })
        expect(loginResponse.status()).toEqual(200)
        const loginResponseJSON = await loginResponse.json()
        const token = loginResponseJSON.user.token

        const storageStateFile = JSON.parse(fs.readFileSync(authFile, { encoding: 'utf-8' }))
        storageStateFile.origins[0].localStorage[0].value = token
        fs.writeFileSync(authFile, JSON.stringify(storageStateFile, null, 2))
    } else {
        await page.goto('/')
        await page.getByText('Sign in').click()
        await page.getByRole('textbox', { name: 'Email' }).fill('punk@xyz.com')
        await page.getByRole('textbox', { name: 'Password' }).fill('punk1987')
        await page.getByRole('button', { name: 'Sign in' }).click()

        await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible()

        await page.context().storageState({ path: authFile })
    }
});