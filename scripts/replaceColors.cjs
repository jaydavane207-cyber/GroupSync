const fs = require('fs');

function globalReplace(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/text-gray-500/g, 'text-[var(--color-gs-text-muted)]');
  content = content.replace(/text-gray-400/g, 'text-[var(--color-gs-text-muted)]');
  content = content.replace(/text-gray-300/g, 'text-[var(--color-gs-text-muted)]');
  content = content.replace(/text-gray-200/g, 'text-[var(--color-gs-text-main)]');
  content = content.replace(/text-white/g, 'text-[var(--color-gs-text-main)]');
  content = content.replace(/text-black/g, 'text-[#0f172a]'); // For Light theme buttons, we might want to keep contrast, let's leave black as is.
  content = content.replace(/text-transparent bg-clip-text/g, 'text-transparent bg-clip-text'); // Don't break this
  
  // also fix static bg-gray-800 to borders or muted tones if necessary
  content = content.replace(/bg-gray-800/g, 'bg-[var(--color-gs-border)]');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replaced colors in', filePath);
}

globalReplace('./src/App.jsx');
globalReplace('./src/components/Signup.jsx');
globalReplace('./src/components/Login.jsx');

