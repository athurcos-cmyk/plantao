import fs from 'fs';
import path from 'path';

const srcDir = path.join('C:\\Users\\Thurcos\\Desktop\\plantao', 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex para achar <button> que não tenha data-testid e adicionar
  const btnRegex = /<button\s+(?![^>]*data-testid=)/gi;
  if (btnRegex.test(content)) {
    let count = 0;
    content = content.replace(btnRegex, (match) => {
      count++;
      return match + ` data-testid="auto-btn-${path.basename(filePath, '.vue').toLowerCase()}-${count}" `;
    });
    changed = true;
  }

  // Regex para achar <input> que não tenha data-testid
  const inputRegex = /<input\s+(?![^>]*data-testid=)/gi;
  if (inputRegex.test(content)) {
    let count = 0;
    content = content.replace(inputRegex, (match) => {
      count++;
      return match + ` data-testid="auto-input-${path.basename(filePath, '.vue').toLowerCase()}-${count}" `;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Atualizado: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Injeção de data-testid finalizada em todos os arquivos Vue.');
