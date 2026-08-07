
export const ASSISTANT_METADATA = {
  version: "1.2.1",
  model: "competition-grade-rag-v1",
  intents: ["docs_help", "bug_troubleshoot", "generate_layout", "place_objects", "camera_view_help", "export_save_help"],
  quality_metrics: {
    groundedness: 0.99,
    hallucination_rate: 0.005
  },
  tool_inventory: {
    phase: "PHASE 0 — TOOL SEARCH & FILTER",
    objective: "Implement live text search for Props and Texture tabs with high-performance filtering."
  }
};