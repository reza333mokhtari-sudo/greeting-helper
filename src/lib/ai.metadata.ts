/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *                                            
 * set env
 * 
 * SUPABASE_PROJECT_ID="wliwiswcollinbaomzqr"
 * 
 * SUPABASE_PUBLISHABLE_KEY="sb_publishable_RgebDk1weJQL8DCgUNttxQ_FWT2p2rW"
 * 
 * SUPABASE_URL="https://wliwiswcollinbaomzqr.supabase.co"
 * 
 * VITE_SUPABASE_PROJECT_ID="wliwiswcollinbaomzqr"
 * 
 * VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_RgebDk1weJQL8DCgUNttxQ_FWT2p2rW"
 * 
 * VITE_SUPABASE_URL="https://wliwiswcollinbaomzqr.supabase.co"
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
    phase: "PHASE 0 — TOOL SEARCH & FILTER",
    objective: "Implement live text search for Props and Texture tabs with high-performance filtering."
  }
};