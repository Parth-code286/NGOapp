import fs from 'fs';
import path from 'path';

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5053')) {
        let changed = false;
        
        // Replace quoted strings and template literals containing the exact sequence
        content = content.replace(/(['"`])http:\/\/localhost:5053(.*?)\1/g, (match, p1, p2) => {
          changed = true;
          return '`' + '${import.meta.env.VITE_API_BASE_URL}' + p2 + '`';
        });

        // Also replace occurrences that might not start with quotes (just in case)
        // e.g. some concatenation: API_BASE + '/something' -> import.meta.env.VITE_API_BASE_URL + '/something'
        // But the previous regex handles 99% of cases.
        // Let's do a fallback for unquoted http://localhost:5053 if any:
        if (content.includes('http://localhost:5053')) {
            content = content.replace(/http:\/\/localhost:5053/g, '${import.meta.env.VITE_API_BASE_URL}');
            changed = true;
        }
        
        if (changed) {
          fs.writeFileSync(fullPath, content);
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  }
}

walkDir('d:/NGO/NGOapp/client/ngoApp/src');
