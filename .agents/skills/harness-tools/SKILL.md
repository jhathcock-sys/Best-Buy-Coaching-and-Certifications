---
name: harness-tools
description: Harness tools containing custom PowerShell automation, Playwright log parsing, Firebase rules emulation, and CSV dry-running.
---

# Harness Tools Skill

This skill provides access to four custom tools specifically designed to interact with the project environment safely and effectively. Since you cannot use standard MCP definitions natively here, you will execute these tools by invoking the Node script `harness.js` via the terminal using the `run_command` tool.

## Available Tools

### 1. Execute Project Command
Runs a command loop inside Windows PowerShell at the project root. Safely intercepts and structures multi-command tokens (e.g., converts Linux `&&` to Windows `;` automatically).
**Usage:**
```bash
node ".agents/skills/harness-tools/scripts/harness.js" execute_project_command '{"command":"npm run test"}'
```

### 2. Test Firestore Rules
Launches the local Firebase Emulator Suite to test access rules and validate role-based access locks.
**Usage:**
```bash
node ".agents/skills/harness-tools/scripts/harness.js" test_firestore_rules '{"testSuitePath":""}'
```
*(Optionally provide a specific spec file path in `testSuitePath`, else leave empty for default.)*

### 3. Read Test Artifacts
Inspects failed automated test files or Playwright layout artifacts to identify crashing DOM elements or view properties. It will read the last 100 lines of the latest JSON test report.
**Usage:**
```bash
node ".agents/skills/harness-tools/scripts/harness.js" read_test_artifacts '{"reportPath":"test-results","maxLines":100}'
```

### 4. Inspect CSV Structure
Dry-runs parsing on incoming CSV arrays to identify column layouts, spacing anomalies, and sanitization boundaries without loading the whole file into memory.
**Usage:**
```bash
node ".agents/skills/harness-tools/scripts/harness.js" inspect_csv_structure '{"filePath":"path/to/data.csv","previewRows":5}'
```

## Execution Instructions
Whenever you need to use one of these skills:
1. Use the `run_command` tool.
2. Ensure you pass the JSON payload wrapped in single quotes (`'`) so it parses cleanly in PowerShell.
3. Parse the JSON response returned by the script.
