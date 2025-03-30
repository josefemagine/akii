import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

// Version bump types
const BUMP_TYPES = {
  major: [0, 0, 0],
  minor: [0, 1, 0],
  patch: [0, 0, 1]
};

// Parse version string into array of numbers
function parseVersion(version) {
  return version.split('.').map(Number);
}

// Format version array into string
function formatVersion(version) {
  return version.join('.');
}

// Bump version based on type
function bumpVersion(currentVersion, bumpType) {
  const version = parseVersion(currentVersion);
  const bump = BUMP_TYPES[bumpType];
  
  for (let i = 0; i < 3; i++) {
    version[i] += bump[i];
  }
  
  return formatVersion(version);
}

// Update version in package.json
function updatePackageVersion(newVersion) {
  packageJson.version = newVersion;
  fs.writeFileSync(
    path.join(__dirname, '../package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  );
}

// Create git tag
function createGitTag(version) {
  try {
    execSync(`git tag -a v${version} -m "Release version ${version}"`);
    console.log(`Created git tag v${version}`);
  } catch (error) {
    console.error('Error creating git tag:', error.message);
  }
}

// Main function
function main() {
  const bumpType = process.argv[2];
  
  if (!bumpType || !BUMP_TYPES[bumpType]) {
    console.error('Please specify a valid bump type: major, minor, or patch');
    process.exit(1);
  }
  
  const currentVersion = packageJson.version;
  const newVersion = bumpVersion(currentVersion, bumpType);
  
  console.log(`Bumping version from ${currentVersion} to ${newVersion}`);
  
  updatePackageVersion(newVersion);
  createGitTag(newVersion);
  
  console.log('Version updated successfully!');
}

main(); 