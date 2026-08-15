import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function bumpVersion() {
  console.log('🚀 Starting Automated Release & Version Bump...\n');

  // 1. Read package.json
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  let currentVersion = pkg.version || '1.0.7';
  if (currentVersion === '0.0.0') currentVersion = '1.0.7';

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
    releaseNotes: `Automated live update release v${newVersion}`
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

  // 4. Update android/app/build.gradle
  const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
  if (fs.existsSync(gradlePath)) {
    let gradle = fs.readFileSync(gradlePath, 'utf8');
    gradle = gradle.replace(/versionCode \d+/, `versionCode ${newVersionCode}`);
    gradle = gradle.replace(/versionName ".*?"/, `versionName "${newVersion}"`);
    fs.writeFileSync(gradlePath, gradle);
    console.log('✓ Updated android/app/build.gradle');
  }

  // 5. Build web assets & sync to Android
  console.log('\n📦 Building production web bundle and syncing assets...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  execSync('npx cap copy android', { cwd: rootDir, stdio: 'inherit' });

  // 6. Build Android APK
  console.log('\n🤖 Compiling Android APK binary (gradlew assembleDebug)...');
  const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew';
  execSync(`${gradlewCmd} assembleDebug`, { cwd: path.join(rootDir, 'android'), stdio: 'inherit' });

  // Copy APK binary to public/Aspiranto-v1.0.bin
  const apkSrc = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const apkDest = path.join(rootDir, 'public', 'Aspiranto-v1.0.bin');
  fs.copyFileSync(apkSrc, apkDest);
  console.log('✓ Fresh APK copied to public/Aspiranto-v1.0.bin');

  // 7. Deploy to Firebase
  console.log('\n☁️ Deploying live hosting to Firebase...');
  const firebaseBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase');
  execSync(`"${firebaseBin}" deploy --only hosting --non-interactive`, { cwd: rootDir, stdio: 'inherit' });

  console.log(`\n🎉 Release v${newVersion} Successfully Built, Compiled & Deployed!`);
  console.log(`👉 Web: https://cat-tracker-1538d.web.app`);
  console.log(`👉 APK: https://cat-tracker-1538d.web.app/Aspiranto-v1.0.apk\n`);
}

bumpVersion();
