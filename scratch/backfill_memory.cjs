const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const memoryDir = path.join(__dirname, '..', 'agent_memory');

try {
  const logOutput = execSync('git log --pretty=format:"%ad|%s" --date=short').toString();
  const lines = logOutput.split('\n').filter(l => l.trim() !== '');

  const logsByDate = {};

  lines.forEach(line => {
    const splitIndex = line.indexOf('|');
    if (splitIndex !== -1) {
      const date = line.substring(0, splitIndex).trim();
      const message = line.substring(splitIndex + 1).trim();
      
      if (!logsByDate[date]) {
        logsByDate[date] = [];
      }
      logsByDate[date].push(message);
    }
  });

  for (const [date, messages] of Object.entries(logsByDate)) {
    const filePath = path.join(memoryDir, `${date}.md`);
    let existingContent = '';
    
    // Read existing file if it's today's date so we don't overwrite
    if (fs.existsSync(filePath)) {
       existingContent = fs.readFileSync(filePath, 'utf8') + '\n\n';
    } else {
       existingContent = `# Log for ${date}\n\n`;
    }

    let backfillEntry = `### [Historical Backfill from Git]\n- **Actions Taken**:\n`;
    messages.forEach(msg => {
      backfillEntry += `  - ${msg}\n`;
    });
    backfillEntry += `- **Completed**: Historical commits imported.\n`;

    fs.writeFileSync(filePath, existingContent + backfillEntry);
    console.log(`Generated memory log for ${date}`);
  }
} catch (error) {
  console.error('Error generating backfill:', error);
}
