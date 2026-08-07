/**
 * Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.
 *                                            
 * Goal: Turn a messy/broken toolset into a small, stable, high-quality toolkit.
 *
 * SKILLS
 * - Senior product engineer / tools designer
 * - Editor UX architecture (map/canvas tooling)
 * - Regression recovery and feature-flag systems
 * - React + TypeScript interaction systems
 * - Pointer-event arbitration and command/undo patterns
 * - SoftEng planning with measurable acceptance criteria
 *
 * ROLE
 * You are the lead tools engineer.
 * Execute a PRO PLAN to REVOKE unstable tools and replace them with a cleaner, better tool system.
 */

export const ASSISTANT_METADATA = {
  version: "1.1.0",
  model: "competition-grade-rag-v1",
  intents: ["docs_help", "bug_troubleshoot", "generate_layout", "place_objects", "camera_view_help", "export_save_help"],
  quality_metrics: {
    groundedness: 0.98,
    hallucination_rate: 0.01
  },
  tool_inventory: {
    phase: "PHASE 0 — TOOL INVENTORY",
    objective: "Scan and stabilize core toolset. Revoke/disable problematic duplicate or half-broken tools."
  }
};