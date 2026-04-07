const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

let loaded = false;

function parseEnvFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  if (loaded) {
    return;
  }

  const envPath = join(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    parseEnvFile(envPath);
  }

  loaded = true;
}

loadEnv();

module.exports = {
  loadEnv
};
