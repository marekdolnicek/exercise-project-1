import { createAzure } from "@ai-sdk/azure";

// Azure OpenAI client configuration
export const azure = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY || "9bd2d13588a14f4cae62325fc68d7d64",
  resourceName: process.env.AZURE_OPENAI_RESOURCE || "aim-australia-east",
});

// Available models
export const MODELS = {
  GPT5: "gpt-5-hiring",
  GPT5_MINI: "gpt-5-mini-hiring",
} as const;

// Default model to use
export const DEFAULT_MODEL = MODELS.GPT5_MINI;
