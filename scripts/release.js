import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function bumpVersion() {
  console.log('🚀 Starting Automated Web Release & Version Bump...\n');

  // 1. Read package.json
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  let currentVersion = pkg.version || '1.0.26';
  if (currentVersion === '0.0.0') currentVersion = '1.0.26';

  const parts = currentVersion.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1; // Increment patch version
  const newVersion = parts.join('.');
  const newVersionCode = parts[0] * 10000 + parts[1] * 100 + parts[2];

  console.log(`📌 Version Bump: v${currentVersion} -> v${newVersion} (versionCode: ${newVersionCode})`);

  // Update package.json
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // 2. Update public/version.json
  const versionJsonPath = path.join(rootDir, 'public', 'version.json');
  const versionJson = {
    version: newVersion,
    versionCode: newVersionCode,
    buildTime: new Date().toISOString(),
    releaseNotes: `Live web app update release v${newVersion}`
  };
  fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2) + '\n');
  console.log('✓ Updated public/version.json');

  // 3. Update src/utils/versionCheck.js
  const versionCheckPath = path.join(rootDir, 'src', 'utils', 'versionCheck.js');
  if (fs.existsSync(versionCheckPath)) {
    let content = fs.readFileSync(versionCheckPath, 'utf8');
    content = content.replace(/export const APP_VERSION = ".*?";/, `export const APP_VERSION = "${newVersion}";`);
    fs.writeFileSync(versionCheckPath, content);
    console.log('✓ Updated src/utils/versionCheck.js');
  }

  // 4. Build web bundle
  console.log('\n📦 Building production web bundle...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  // 5. Deploy to Firebase (Hosting + Firestore Rules)
  console.log('\n☁️ Deploying live hosting & secured Firestore rules to Firebase...');
  const firebaseBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase');
  execSync(`"${firebaseBin}" deploy --only hosting,firestore:rules --non-interactive`, { cwd: rootDir, stdio: 'inherit' });

  console.log(`\n🎉 Release v${newVersion} Successfully Built & Deployed!`);
  console.log(`👉 Web: https://cat-tracker-1538d.web.app\n`);
}

bumpVersion();
