---
name: stateful-codebase-purification-sweep
description: Standard operating procedure for discovering all source files, initializing a stateful tracking manifest, and executing a zero-regression TDD purification loop with automatic production deployment.
---

# Stateful Codebase Purification Skill

Use this skill to execute a comprehensive, file-by-file refactoring and bug-elimination sweep across the entire repository. This process utilizes a stateful disk manifest to eliminate context drift.

## 1. Pre-Flight Discovery & Manifest Seeding
When this skill is activated, you must immediately scan the directory tree using your local command execution tools to discover all active code files:
1. Crawl the `src/` directory for `.ts`, `.tsx`, and `.js` files.
2. Exclude mock directories, build files, and standard test scripts (`.test.ts`, `.spec.js`).
3. Create or reset the master tracking array at `agent_memory/loop_manifest.json` with a status of `ACTIVE`, seeding your discovered paths directly into the `remaining_queue`.

## 2. The Execution Gate Loop (Per-File Protocol)
For every single file path sitting in the `remaining_queue`, you must strictly follow this 5-Phase sequence:

*   **Phase 1: Discovery & Context Read** — Call your file reading tools to load the target file and inspect `agent_memory/loop_manifest.json` to verify the checkpoint.
*   **Phase 2: Multi-Agent Roundtable Debate** — Summon the 10-agent panel. Force explicit reviews for Zustand atomicity, type matching, and inline-style eradication. Log any active `VETO` details directly to the manifest's `active_vetos` array.
*   **Phase 3: Expert Refactoring Pass** — Author clean modifications that lift the vetos. Ensure the `automation_tester` generates paired unit or E2E tests for every change.
*   **Phase 4: PowerShell Quality Gate** — Chain and execute your local verification testing passes via Windows PowerShell: `npm run typecheck ; npm run test`.
*   **Phase 5: Checkpoint Advance & Git Commit** — Once tests return 100% green, call your manifest tools to move the file to `processed_queue`, update the index, log the timestamped resolution to the current day's markdown log, and commit the clean progress to Git.

## 3. Post-Sweep Production Deployment Gate
Once the `remaining_queue` is completely empty and 100% of the repository has successfully transitioned into the `processed_queue`, you must automatically execute the live production deployment payload:
1. Recompile the production bundle to ensure type-safety and structural sanity: `npm run build`
2. If any backend files or security logic were touched, build and deploy Cloud Functions and security layers: `cd functions ; npm run build ; cd .. ; firebase deploy --only functions,firestore:rules`
3. Deploy the final React application bundle to the live production server: `firebase deploy --only hosting`
4. Update the `status` inside `agent_memory/loop_manifest.json` to "COMPLETED", log the deployment success timestamp, and announce execution shutdown to the GUI console.

## 4. Crash Recovery Protocol
If the harness execution environment times out or encounters a terminal error mid-pass, your very first action upon rebooting must be reading `agent_memory/loop_manifest.json` to extract the `current_checkpoint`. You are strictly forbidden from guessing your previous position or restarting from file 1 if a checkpoint exists on disk.
