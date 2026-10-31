import fs from 'fs/promises'
import path from 'path'
import Ajv from 'ajv'
import { createSchema } from 'genson-js'
import addFormats from 'ajv-formats'


const SCHEMA_BASE_PATH = './response-schemas'
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export async function validateSchema(dirName: string, fileName: string, responseBody: object, createSchemaFlag: boolean = false) {
    const schemaPath = path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`)

    if (createSchemaFlag) await generateNewSchema(responseBody, schemaPath)

    const schema = await loadSchema(schemaPath)
    const validate = ajv.compile(schema)
    const valid = validate(responseBody)
    if (!valid) {
        throw new Error(
            `Schema validation ${fileName}_schema.json failed: \n` +
            `${JSON.stringify(validate.errors, null, 4)}\n\n` +
            `Actual response body: \n` +
            `${JSON.stringify(responseBody, null, 4)}`
        )
    }
}

async function loadSchema(schemaPath: string) {
    try {
        const schemaContent = await fs.readFile(schemaPath, { encoding: 'utf-8' }) // 'utf-8'
        return JSON.parse(schemaContent)
    } catch (error: any) {
        throw new Error(`Failed to read the schema file: ${error.message}`)
    }
}

function addDateTimeFormats(schema: unknown) {
    if (Array.isArray(schema)) { //Array.isArray() is a built-in static method in JavaScript used to reliably determine whether the passed value is an Array. It returns true if the value is an array, and false otherwise.
        schema.forEach(addDateTimeFormats)
        return
    }

    if (schema === null || typeof schema !== 'object') return

    const schemaObject = schema as Record<string, unknown>
    const properties = schemaObject.properties

    if (properties !== null && typeof properties === 'object' && !Array.isArray(properties)) {
        const propertySchemas = properties as Record<string, unknown>
        for (const propertyName of ['createdAt', 'updatedAt']) {
            const propertySchema = propertySchemas[propertyName]
            if (propertySchema !== null && typeof propertySchema === 'object' && !Array.isArray(propertySchema)) {
                (propertySchema as Record<string, unknown>).format = 'date-time'
            }
        }
    }

    Object.values(schemaObject).forEach(addDateTimeFormats) //This specific line of code is a deep-recursion trigger. Its purpose is to look at every single value nested inside the current object node and force the function to dive a level deeper into the schema tree.
}

async function generateNewSchema(responseBody: object, schemaPath: string) {
    try {
        const generatedSchema = createSchema(responseBody)

        // Add date-time format to createdAt and updatedAt properties
        addDateTimeFormats(generatedSchema)

        await fs.mkdir(path.dirname(schemaPath), { recursive: true })
        await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4))
    } catch (error: any) {
        throw new Error(`Failed to create schema file: ${error.message}`)
    }
}

// addDateTimeFormats() -->
// This TypeScript/JavaScript function recursively traverses a JSON Schema object to find createdAt and updatedAt properties and forces their format attribute to be 'date-time'. It modifies the schema object directly in place.
// Here is the step-by-step breakdown of how the logic works:

// 1. Handling Arrays (Recursion Base Case 1)

// typescript
// if (Array.isArray(schema)) {
//     schema.forEach(addDateTimeFormats)
//     return
// }
// Use code with caution.
// • What it does: Checks if the current node in the schema is an array.
// • Why: JSON Schemas often use arrays for properties like anyOf, allOf, or oneOf. If an array is found, it loops through each item and calls addDateTimeFormats on it recursively, then exits early (return).

// 2. Guarding Against Non-Objects (Recursion Base Case 2)

// typescript
// if (schema === null || typeof schema !== 'object') return
// Use code with caution.
// • What it does: Stops the function immediately if the schema is a primitive value (like a string, number, or boolean) or null.
// • Why: You cannot extract properties or add formats to non-object types.

// 3. Target Property Modification

// typescript
// const schemaObject = schema as Record<string, unknown>
// const properties = schemaObject.properties

// if (properties !== null && typeof properties === 'object' && !Array.isArray(properties)) {
//     const propertySchemas = properties as Record<string, unknown>
//     for (const propertyName of ['createdAt', 'updatedAt']) {
//         const propertySchema = propertySchemas[propertyName]
//         if (propertySchema !== null && typeof propertySchema === 'object' && !Array.isArray(propertySchema)) {
//             (propertySchema as Record<string, unknown>).format = 'date-time'
//         }
//     }
// }
// Use code with caution.
// • What it does: Looks for a properties object inside the current schema node.
// • Safe Checking: It verifies that properties exists, is a valid object, and is not an array.
// • Injection: It loops specifically through the keys 'createdAt' and 'updatedAt'. If either key exists as a sub-object, it explicitly sets or overrides its format key to 'date-time'.
// • Note: The as Record<string, unknown> syntax is just TypeScript type-casting to prevent compiler errors since the input is typed as unknown.

// 4. Deep Traversal (Deep Recursion)

// typescript
// Object.values(schemaObject).forEach(addDateTimeFormats)
// Use code with caution.
// • What it does: Grabs every single value inside the current schemaObject and runs addDateTimeFormats on it.
// • Why: This ensures the function drills down into nested structures (like nested objects, definitions, or other JSON schema keywords like items, additionalProperties, etc.) to find createdAt or updatedAt fields buried deep in the tree.

// ⚠️ A Small Caveat / Potential Bug

// Because step 4 runs after step 3, the function will also recurse into the properties object again, as well as into the newly updated createdAt and updatedAt objects themselves.
// While this is harmless because steps 1 and 2 will safely eject when they hit the string 'date-time', mutating an object while actively iterating through all of its deep values can occasionally cause redundant processing or unintended side effects if your schema contains circular references.