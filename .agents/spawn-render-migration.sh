#!/bin/bash
# Helper to spawn the Render Migration Agent for Unimatrix.
# Usage: ./agents/spawn-render-migration.sh [resume_from_subagent_id]

set -e

SUBAGENT_ID=${1:-}

PROMPT_FILE=".agents/render-migration-agent.md"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: $PROMPT_FILE not found. Run from repo root."
  exit 1
fi

echo "Spawning autonomous Render Migration Agent..."
echo "This agent will explore the codebase, make edits, run builds, commit, and push as needed."
echo "It behaves like Claude with computer-use / advanced coding agents."

# Note: This assumes you are in an environment where you can call the spawn_subagent tool.
# In the Grok / Claude interface, paste the prompt from the .md file into a new subagent spawn.
# Example (if direct tool access):
# spawn_subagent with the content of $PROMPT_FILE as the prompt, plus current context.

echo ""
echo "Recommended: In your AI interface, use the 'spawn_subagent' tool with:"
echo "  - prompt: (contents of $PROMPT_FILE)"
echo "  - subagent_type: general-purpose"
echo "  - capability_mode: all"
echo "  - background: true"
echo ""
echo "To resume a previous run: pass the previous subagent_id."
echo ""
echo "Monitor with: get_command_or_subagent_output using the returned subagent_id"

if [ -n "$SUBAGENT_ID" ]; then
  echo "Resuming from: $SUBAGENT_ID"
fi

echo "Agent spec ready. Launch via your interface's subagent tools."