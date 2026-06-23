const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AntigravitySkills {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async executeProjectCommand(input) {
    return new Promise((resolve) => {
      let sanitizedCommand = input.command.trim();

      if (sanitizedCommand.includes('&&')) {
        sanitizedCommand = sanitizedCommand.replace(/&&/g, ';');
      }

      const child = spawn('powershell.exe', ['-NoProfile', '-Command', sanitizedCommand], {
        cwd: this.projectRoot,
        env: { ...process.env, FORCE_COLOR: '1' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdout || `Command executed with exit code: ${code}`,
          error: stderr || undefined
        });
      });
    });
  }

  async testFirestoreRules(input) {
    const targets = ['firestore.rules', 'firebase.json'];
    const missing = targets.filter(f => !fs.existsSync(path.join(this.projectRoot, f)));

    if (missing.length > 0) {
      return {
        success: false,
        output: '',
        error: `Missing core Firebase configuration files in workspace root: ${missing.join(', ')}`
      };
    }

    const command = input.testSuitePath 
      ? `npx firebase emulators:exec "vitest run ${input.testSuitePath}"`
      : 'npx firebase emulators:exec "vitest run --target=rules"';

    return this.executeProjectCommand({ command });
  }

  async readTestArtifacts(input) {
    const maxLines = input.maxLines || 100;
    const defaultPath = path.join(this.projectRoot, 'test-results');
    const targetPath = input.reportPath ? path.resolve(this.projectRoot, input.reportPath) : defaultPath;

    try {
      if (!fs.existsSync(targetPath)) {
        return {
          success: false,
          output: '',
          error: `No test artifacts found at path: ${targetPath}. Ensure a test pass has executed.`
        };
      }

      const stats = fs.statSync(targetPath);
      
      if (stats.isDirectory()) {
        const files = fs.readdirSync(targetPath)
          .map(f => ({ name: f, time: fs.statSync(path.join(targetPath, f)).mtime.getTime() }))
          .sort((a, b) => b.time - a.time);

        if (files.length === 0) {
          return { success: true, output: 'Artifacts directory is currently empty.' };
        }

        const standardLog = path.join(targetPath, files[0].name);
        return this.readFileTail(standardLog, maxLines);
      }

      return this.readFileTail(targetPath, maxLines);
    } catch (err) {
      return { success: false, output: '', error: err.message };
    }
  }

  async inspectCsvStructure(input) {
    const targetFilePath = path.resolve(this.projectRoot, input.filePath);
    const maxRows = input.previewRows || 5;

    try {
      if (!fs.existsSync(targetFilePath)) {
        return { success: false, output: '', error: `Target file not found at path: ${targetFilePath}` };
      }

      const rawContent = fs.readFileSync(targetFilePath, 'utf-8');
      const lines = rawContent.split(/\r?\n/).filter(line => line.trim() !== '');

      if (lines.length === 0) {
        return { success: false, output: '', error: 'Target CSV file is empty.' };
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const previewRowsData = [];

      for (let i = 1; i <= Math.min(maxRows, lines.length - 1); i++) {
        previewRowsData.push(lines[i].split(',').map(cell => cell.trim()));
      }

      const structuralReport = {
        totalDetectedLines: lines.length,
        detectedHeadersCount: headers.length,
        headers: headers,
        schemaSuggestion: headers.reduce((acc, header) => ({ ...acc, [header]: 'string' }), {}),
        previewData: previewRowsData
      };

      return {
        success: true,
        output: JSON.stringify(structuralReport, null, 2)
      };
    } catch (err) {
      return { success: false, output: '', error: err.message };
    }
  }

  readFileTail(filePath, limit) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const slice = lines.slice(-limit).join('\n');
      return {
        success: true,
        output: `[File: ${path.basename(filePath)} | Displaying last ${limit} lines]\n${slice}`
      };
    } catch (err) {
      return { success: false, output: '', error: err.message };
    }
  }
}

// CLI wrapper
async function run() {
  const args = process.argv.slice(2);
  const action = args[0];
  const payload = args[1] ? JSON.parse(args[1]) : {};

  const skills = new AntigravitySkills();

  try {
    let response;
    switch (action) {
      case 'execute_project_command':
        response = await skills.executeProjectCommand(payload);
        break;
      case 'test_firestore_rules':
        response = await skills.testFirestoreRules(payload);
        break;
      case 'read_test_artifacts':
        response = await skills.readTestArtifacts(payload);
        break;
      case 'inspect_csv_structure':
        response = await skills.inspectCsvStructure(payload);
        break;
      default:
        console.error("Unknown action:", action);
        process.exit(1);
    }
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.error("Error executing skill:", e.message);
    process.exit(1);
  }
}

run();
