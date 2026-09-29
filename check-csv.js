const fs = require('fs');

function parseCSV(file) {
  const content = fs.readFileSync(file, 'utf8');
  let currentPos = 0;
  const rows = [];
  
  while (currentPos < content.length) {
    const row = [];
    let inQuotes = false;
    let currentValue = '';
    
    while (currentPos < content.length) {
      const char = content[currentPos];
      if (inQuotes) {
        if (char === '"') {
          if (currentPos + 1 < content.length && content[currentPos + 1] === '"') {
            currentValue += '"';
            currentPos++;
          } else {
            inQuotes = false;
          }
        } else {
          currentValue += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          row.push(currentValue);
          currentValue = '';
        } else if (char === '\n' || char === '\r') {
          row.push(currentValue);
          if (char === '\r' && currentPos + 1 < content.length && content[currentPos + 1] === '\n') {
            currentPos++;
          }
          break;
        } else {
          currentValue += char;
        }
      }
      currentPos++;
    }
    
    // push the last value if it didn't end with a newline
    if (currentPos >= content.length && currentValue !== '' && row.length === 0) {
       row.push(currentValue);
    } else if (currentPos >= content.length && row.length > 0) {
       // if last row is missing trailing newline but ended with a comma etc
       if (currentValue !== '') {
          // wait, already pushed if trailing. Let's just avoid duplicate push.
       }
    }
    
    if (row.length > 0) rows.push(row);
    currentPos++;
  }
  
  return rows;
}

const rows = parseCSV('web_hotel_update.csv');
console.log('Total rows:', rows.length);

const dataRows = rows.slice(2).filter(r => r[0] && r[0].trim() !== '');

console.log('Data rows:', dataRows.length);
console.log('Sample Data Row 0:', dataRows[0]);
console.log('Sample Data Row 3:', dataRows[3]);
