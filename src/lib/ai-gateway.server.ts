import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * AI SDK provider bound to the Lovable AI Gateway. Server-only.
 * The provider name must stay "lovable" — the AI SDK only forwards
 * `providerOptions.lovable` when it matches this name.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/**
 * Provider for a custom OpenAI-compatible endpoint (e.g. Conduit).
 * Configured through CONDUIT_API_KEY / CONDUIT_BASE_URL secrets.
 */
export function createCustomProvider(apiKey: string, baseURL: string) {
  return createOpenAICompatible({
    name: "custom",
    baseURL,
    apiKey,
  });
}
