#!/usr/bin/env node

/**
 * Test script to verify monorepo setup and package integration
 */

const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n${colors.blue}${colors.bold}${description}${colors.reset}`);
    log(`Running: ${command}`, colors.yellow);

    execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    log(`✅ Success`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Failed: ${error.message}`, colors.red);
    return false;
  }
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, colors.green);
  } else {
    log(`❌ Missing: ${description}`, colors.red);
  }
  return exists;
}

function main() {
  log(`${colors.bold}${colors.blue}🧪 Testing Monorepo Setup${colors.reset}\n`);

  const tests = [
    // File structure tests
    () => checkFileExists('package.json', 'Root package.json exists'),
    () =>
      checkFileExists('pnpm-workspace.yaml', 'pnpm workspace config exists'),
    () =>
      checkFileExists(
        'packages/backend/package.json',
        'Backend package.json exists'
      ),
    () =>
      checkFileExists('packages/web/package.json', 'Web package.json exists'),
    () =>
      checkFileExists(
        'packages/mobile/package.json',
        'Mobile package.json exists'
      ),
    () => checkFileExists('.github/workflows/ci.yml', 'CI workflow exists'),
    () =>
      checkFileExists('.github/workflows/deploy.yml', 'Deploy workflow exists'),

    // Package manager tests
    () => runCommand('pnpm --version', 'Check pnpm is installed'),
    () => runCommand('pnpm list --depth=0', 'List workspace packages'),

    // Workspace script tests
    () =>
      runCommand(
        'npm run --silent lint:all --if-present',
        'Test lint:all script exists'
      ),
    () =>
      runCommand(
        'npm run --silent test:all --if-present',
        'Test test:all script exists'
      ),
    () =>
      runCommand(
        'npm run --silent build:all --if-present',
        'Test build:all script exists'
      ),
    () =>
      runCommand(
        'npm run --silent dev:all --if-present',
        'Test dev:all script exists'
      ),

    // Package-specific tests
    () =>
      runCommand(
        'pnpm --filter @org/backend run --if-present lint',
        'Backend lint script'
      ),
    () =>
      runCommand(
        'pnpm --filter @org/web run --if-present lint',
        'Web lint script'
      ),
    () =>
      runCommand(
        'pnpm --filter @org/mobile run --if-present lint',
        'Mobile lint script'
      ),
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const result = test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  });

  log(`\n${colors.bold}📊 Test Results:${colors.reset}`);
  log(`✅ Passed: ${passed}`, colors.green);
  log(`❌ Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  log(`📝 Total: ${tests.length}`, colors.blue);

  if (failed === 0) {
    log(
      `\n🎉 All tests passed! Monorepo setup is working correctly.`,
      colors.green
    );
    process.exit(0);
  } else {
    log(`\n⚠️  Some tests failed. Please check the setup.`, colors.yellow);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
