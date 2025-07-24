const fs = require('fs');
const path = require('path');

function renameJsToCjs(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      renameJsToCjs(fullPath);
    } else if (item.endsWith('.js')) {
      const newName = item.replace('.js', '.cjs');
      const newPath = path.join(dir, newName);
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed ${item} to ${newName}`);
    }
  });
}

// Copy files from dist/cjs to dist with .cjs extension
const cjsDir = path.join(__dirname, '../dist/cjs');
const distDir = path.join(__dirname, '../dist');

if (fs.existsSync(cjsDir)) {
  renameJsToCjs(cjsDir);
  
  // Move .cjs files to main dist directory
  function moveFiles(source, target) {
    const items = fs.readdirSync(source);
    
    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath);
        }
        moveFiles(sourcePath, targetPath);
      } else if (item.endsWith('.cjs')) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${item} to dist/`);
      }
    });
  }
  
  moveFiles(cjsDir, distDir);
  
  // Clean up cjs directory
  fs.rmSync(cjsDir, { recursive: true, force: true });
  console.log('Cleaned up cjs directory');
}
