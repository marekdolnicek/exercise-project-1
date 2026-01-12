import { createAzure } from '@ai-sdk/azure'

export const azure = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME!,
})

// This should be your Azure deployment name
export const modelId = process.env.AZURE_OPENAI_MODEL || 'gpt-5-hiring'
