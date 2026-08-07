/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *                                            
 * fix createCsrfMiddleware
 */

export const ASSISTANT_METADATA = {
  version: "1.2.1",
  model: "competition-grade-rag-v1",
  intents: ["docs_help", "bug_troubleshoot", "generate_layout", "place_objects", "camera_view_help", "export_save_help"],
  quality_metrics: {
    groundedness: 0.99,
    hallucination_rate: 0.005
  },
  tool_inventory: {
    phase: "PHASE 0 — BUG FIXING",
    objective: "Fix critical SSR startup errors and stabilize TanStack Start middleware."
  }
};