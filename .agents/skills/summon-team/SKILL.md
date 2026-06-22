---
name: Summon Team
description: Spawns specialized expert agents (QA, Tech Debt, UX, Coder) in the background to handle specific tasks. Triggered by words like "summon", "invoke team", "call qa", "tech debt analyst".
---
# Summon Team Skill

When the user asks to summon a specialized agent, follow these steps:

1. Identify which agent(s) the user requested: `tech_debt_analyst`, `qa_tester`, `ux_designer`, or `expert_coder`.
2. Read their configuration from the "soul file" located at `.agents/team_souls.json`. You can use your filesystem read tools (like `view_file`) to load this JSON.
3. For each requested agent, use your `define_subagent` tool to register them. Map the JSON fields directly to the tool arguments (name, description, system_prompt, enable_write_tools, etc.).
4. Once defined, use the `invoke_subagent` tool to start the agent in the background. Pass a clear `Prompt` detailing exactly what the user wants them to review or build.
5. Inform the user that the requested agents have been summoned and are working in the background. The system will automatically wake you up when the subagents send a message back.
