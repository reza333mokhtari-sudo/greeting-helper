import os

new_mission = r"""'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            Also mirror the same patterns into desktop/qt where applicable

## PROMPT بازنویسی‌شده (ضد گیر کردن + Tiled-first + Desktop mirror)

این نسخه برای Lovable کوتاه‌تر از مقاله، ولی دقیق است؛ کار را **تکه‌تکه** می‌کند تا fail/hang ندهد.

/developerMode

SKILLS
- Map editor architect (Tiled patterns)
- React/TypeScript editor implementer
- Qt/QML pattern mirror for desktop/qt
- Debugger: small fixes, no rewrites
- UI/UX for dense DCC tools

PRIMARY REFERENCE (patterns only, DO NOT copy code):
https://github.com/mapeditor/tiled

SECONDARY REFERENCE (interaction/model ideas only):
https://github.com/mohsenD98/GraphFlow

Also mirror the same patterns into desktop/qt where applicable.

CRITICAL RULES (anti-fail)
1) Do NOT rewrite the whole app.
2) Do NOT migrate frameworks.
3) Do NOT touch unrelated marketing pages except adding a clear Open Editor button.
4) One vertical slice at a time. After each slice, keep app compiling/running.
5) If a step is risky, implement the minimal safe version and continue.
6) Never leave the AI spinner infinite.
7) Never write prompt/command text onto the canvas.
8) No secrets in repo.
9) Prefer fix existing tools over inventing new systems.

GOAL
Unstick the product and make the editor reliable using Tiled-style architecture.

TILED PATTERN MAPPING (apply in THIS project)
- Document core = single map document (floors/layers/objects/settings)
- Tool router = one activeTool; toolbar only switches tool; canvas handles input
- Undo commands = add/delete/move/transform undoable
- Dock shell = tools left, canvas center, panels right, status bottom
- Properties = inspector two-way on selection
- Save format = JSON map document + dirty state

==================================================
DO THIS IN ORDER (STOP AND VERIFY EACH)
==================================================

SLICE 1 — Editor reachable
- Ensure user can open the real editor in ≤2 clicks from home
- Local editing must work without forced login
- Auth only for cloud/AI if needed
Verify: editor canvas visible and interactive

SLICE 2 — Tool router hard-wire
- Single activeTool state shared by toolbar + shortcuts + canvas
- Tools required: select, drawRect, pan, delete (erase if already present)
- Clicking toolbar MUST change canvas behavior
Verify: each tool does a different thing

SLICE 3 — Core canvas ops
- draw room by drag
- select + drag move
- pan + wheel zoom to cursor
- delete selected
- grid/snap if already in codebase
Verify: create, move, delete one room

SLICE 4 — Undo/redo
- Ctrl+Z / Ctrl+Y for add/delete/move at minimum
Verify: undo restores previous state

SLICE 5 — Inspector + Assets
- Inspector edits selected object live (x/y/rotation/opacity if available)
- Asset search filters list
- Place asset onto canvas
Verify: select object → inspector changes appear on canvas

SLICE 6 — AI hang fix
- timeout + abort
- visible error text
- no infinite “responding”
- AI output never painted as map text unless user explicitly applies a map action
Verify: failed AI shows error and UI recovers

SLICE 7 — Desktop mirror (desktop/qt, only where applicable)
Apply the SAME patterns, minimal safe parity:
- activeTool shared concept
- draw/select/move/pan/zoom/delete
- document dirty + save/load JSON if FileService exists
- inspector binding if panel exists
- do not break CMake/qrc boot
Verify: desktop still builds conceptually; no empty critical stubs left in touched files

==================================================
UI RULES
==================================================
- Dense dark Tiled-like editor chrome
- Active tool clearly highlighted
- Status bar shows tool + zoom if possible
- No dead buttons in the editor chrome
- Side panels scroll independently from canvas zoom

==================================================
DEBUG IF STUCK
==================================================
If something fails:
1) Identify owner: Document / Tool / Canvas / Panel / Auth / AI
2) Patch only that owner
3) Re-verify previous slices still pass
4) Continue to next slice

Do not cascade refactors.

==================================================
ACCEPTANCE (must report)
==================================================
WEB
[ ] Editor opens quickly
[ ] Draw works
[ ] Select/move works
[ ] Pan/zoom works
[ ] Delete works
[ ] Undo works
[ ] Tools stay in sync
[ ] Asset place works (or explicitly partial)
[ ] AI cannot hang forever
[ ] No prompt text on canvas

DESKTOP (mirrored where applicable)
[ ] Same tool patterns present in desktop/qt
[ ] No boot path broken
[ ] Touched files are not empty stubs

OUTPUT FORMAT
1) Slice-by-slice what changed
2) Files touched (web and desktop/qt)
3) Checklist pass/fail
4) Anything still partial (honest)
"""

with open("src/lib/ai.functions.ts", "r") as f:
    content = f.read()

# Fix the broken SYSTEM_PROMPT first (it likely has syntax errors now)
import re

# We need to find the export const SYSTEM_PROMPT and replace it entirely
# The content currently has escaped backticks and is generally broken.
# Let's rebuild the file from the parts we know.

# The part before SYSTEM_PROMPT
before_prompt = content.split("export const SYSTEM_PROMPT =")[0]
# The part after the closing of the broken SYSTEM_PROMPT
# We need to find the start of the next logical part (const num = ...)
after_prompt = "\n\nconst num =" + content.split("const num =")[1]

# Escape backticks for the template literal
escaped_mission = new_mission.replace("`", "\\`")

# Also update the top comment in before_prompt
# The top comment ends at the first "*/"
comment_start = before_prompt.find("/**")
comment_end = before_prompt.find("*/", comment_start)

if comment_start != -1 and comment_end != -1:
    header = "/**\n * AI Functions for Dungeon Scrawl\n * \n"
    body = "\n".join([" * " + l for l in new_mission.splitlines()])
    footer = "\n */"
    before_prompt = header + body + footer + before_prompt[comment_end+2:]

new_content = before_prompt + "export const SYSTEM_PROMPT = `" + escaped_mission + "`;" + after_prompt

with open("src/lib/ai.functions.ts", "w") as f:
    f.write(new_content)
