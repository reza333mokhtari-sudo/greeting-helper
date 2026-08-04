import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** AI SDK provider bound to the Lovable AI Gateway. Server-only. */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
