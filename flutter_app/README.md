# Aspiranto Flutter Mobile App (WebView Edition)

This is the Flutter mobile wrapper for **Aspiranto** using `webview_flutter`. It loads the live, high-performance web app (`https://cat-tracker-1538d.web.app`) with native features:

- 🚀 Full Hardware Acceleration & WebGL
- 📱 Native Edge-to-Edge status bar & navigation styling
- 🔄 Pull-to-Refresh gesture support
- 🔙 Hardware Back Button navigation handling via `PopScope`
- 🌐 Offline and reconnection retry fallback screens
- 🔗 System browser integration for external links

---

## 🛠️ How to Build & Run with Flutter

### Prerequisites
- Install the Flutter SDK: [Flutter Installation Guide](https://docs.flutter.dev/get-started/install/windows)
- Ensure `flutter` is added to your system `PATH`.

### 1. Get Dependencies
```bash
cd flutter_app
flutter pub get
```

### 2. Run on Connected Device / Emulator
```bash
flutter run
```

### 3. Build Release APK
```bash
flutter build apk --release
```
The compiled APK will be generated at:
`flutter_app/build/app/outputs/flutter-apk/app-release.apk`
