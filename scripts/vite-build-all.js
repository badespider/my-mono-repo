#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all package directories
const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('Checking packages for vite configuration...');

// Check each package for vite configuration
const vitePackages = [];
for (const pkg of packages) {
  const packagePath = path.join(packagesDir, pkg);
  const packageJsonPath = path.join(packagePath, 'package.json');
  const viteConfigPath = path.join(packagePath, 'vite.config.ts');
  const viteConfigJsPath = path.join(packagePath, 'vite.config.js');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check if package has vite as dependency or has vite config file
      const hasViteDep = packageJson.dependencies?.vite || packageJson.devDependencies?.vite;
      const hasViteConfig = fs.existsSync(viteConfigPath) || fs.existsSync(viteConfigJsPath);
      
      if (hasViteDep || hasViteConfig) {
        vitePackages.push(pkg);
        console.log(`✓ Found vite in package: ${pkg}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not read package.json for ${pkg}:`, error.message);
    }
  }
}

if (vitePackages.length === 0) {
  console.log('No packages with vite configuration found.');
  process.exit(0);
}

console.log(`\nRunning vite build for ${vitePackages.length} package(s)...\n`);

// Run vite build for each package that has vite
let hasErrors = false;
for (const pkg of vitePackages) {
  try {
    console.log(`Building ${pkg}...`);
    execSync(`pnpm --filter @org/${pkg} build`, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    console.log(`✓ Successfully built ${pkg}\n`);
  } catch (error) {
    console.error(`✗ Failed to build ${pkg}:`, error.message);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('Some packages failed to build.');
  process.exit(1);
} else {
  console.log('All vite packages built successfully!');
}
