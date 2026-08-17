import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure Flutter and Android SDK are in environment
const sdkDir = 'C:\\Users\\sesmi\\AppData\\Local\\Android\\Sdk';
const flutterBin = 'C:\\Users\\sesmi\\flutter\\bin';
process.env.ANDROID_HOME = sdkDir;
process.env.ANDROID_SDK_ROOT = sdkDir;
if (!process.env.PATH.includes(flutterBin)) {
  process.env.PATH = `${flutterBin};${sdkDir}\\cmdline-tools\\latest\\bin;${sdkDir}\\platform-tools;${process.env.PATH}`;
}

function bumpVersion() {
  console.log('🚀 Starting Automated Release & Version Bump...\n');

  // 1. Read package.json
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  let currentVersion = pkg.version || '1.0.24';
  if (currentVersion === '0.0.0') currentVersion = '1.0.24';

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

  // 4. Update flutter_app/pubspec.yaml & build.gradle if exists
  const pubspecPath = path.join(rootDir, 'flutter_app', 'pubspec.yaml');
  if (fs.existsSync(pubspecPath)) {
    let pubspec = fs.readFileSync(pubspecPath, 'utf8');
    pubspec = pubspec.replace(/version: .*/, `version: ${newVersion}+${newVersionCode}`);
    fs.writeFileSync(pubspecPath, pubspec);
    console.log('✓ Updated flutter_app/pubspec.yaml');
  }

  const flutterGradlePath = path.join(rootDir, 'flutter_app', 'android', 'app', 'build.gradle');
  if (fs.existsSync(flutterGradlePath)) {
    let gradle = fs.readFileSync(flutterGradlePath, 'utf8');
    gradle = gradle.replace(/flutterVersionCode = '.*?'/, `flutterVersionCode = '${newVersionCode}'`);
    gradle = gradle.replace(/flutterVersionName = '.*?'/, `flutterVersionName = '${newVersion}'`);
    fs.writeFileSync(flutterGradlePath, gradle);
    console.log('✓ Updated flutter_app/android/app/build.gradle');
  }

  // 5. Build web assets
  console.log('\n📦 Building production web bundle...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  // 6. Build Flutter APK if Flutter SDK is installed
  const flutterDir = path.join(rootDir, 'flutter_app');
  let hasFlutter = false;
  try {
    execSync('flutter --version', { stdio: 'ignore' });
    hasFlutter = true;
  } catch {
    hasFlutter = false;
  }

  if (hasFlutter && fs.existsSync(flutterDir)) {
    console.log('\n📱 Compiling Flutter APK (flutter build apk)...');
    try {
      execSync('flutter build apk --release', { cwd: flutterDir, stdio: 'inherit' });
      const flutterApkSrc = path.join(flutterDir, 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');
      const apkDest = path.join(rootDir, 'public', 'Aspiranto-v1.0.bin');
      if (fs.existsSync(flutterApkSrc)) {
        fs.copyFileSync(flutterApkSrc, apkDest);
        console.log('✓ Fresh Flutter APK copied to public/Aspiranto-v1.0.bin');
      }
    } catch (err) {
      console.warn('Flutter build warning:', err.message);
    }
  } else {
    console.log('\nℹ️ Flutter SDK not found in PATH — skipped local Flutter APK compilation.');
  }

  // 7. Deploy to Firebase (Hosting + Firestore Rules)
  console.log('\n☁️ Deploying live hosting & secured Firestore rules to Firebase...');
  const firebaseBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase');
  execSync(`"${firebaseBin}" deploy --only hosting,firestore:rules --non-interactive`, { cwd: rootDir, stdio: 'inherit' });

  console.log(`\n🎉 Release v${newVersion} Successfully Built & Deployed!`);
  console.log(`👉 Web: https://cat-tracker-1538d.web.app`);
}

bumpVersion();
