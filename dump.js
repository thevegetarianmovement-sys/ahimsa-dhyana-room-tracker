const fs = require('fs');
const lines = fs.readFileSync('C:/Users/lohit/.gemini/antigravity/brain/bab1ea8e-b753-4626-8a4d-f0c568324034/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (line.includes('"source":"USER_EXPLICIT"')) {
    const data = JSON.parse(line);
    if (data.content.includes('Phase 6F')) {
      console.log(data.content);
    }
  }
}
