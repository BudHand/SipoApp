# SIPO Mobile

SIPO Mobile adalah aplikasi mobile berbasis **Expo React Native** yang digunakan untuk mendukung sistem persuratan online (SIPO). Aplikasi ini terintegrasi dengan backend API dan mendukung push notification menggunakan Firebase Cloud Messaging (FCM).

---

## ✨ Fitur Utama

* Login dan autentikasi pengguna
* Monitoring surat masuk dan keluar
* Disposisi surat
* Push notification menggunakan Expo Notifications
* Dukungan Android dan iOS
* OTA Update menggunakan Expo EAS Update

---

## 🛠️ Teknologi yang Digunakan

* React Native
* Expo SDK
* Expo Router
* TypeScript
* Firebase Cloud Messaging (FCM)
* Expo Notifications
* EAS Build & EAS Update

---

## 📋 Persyaratan Sistem

Pastikan perangkat pengembangan telah terpasang:

* Node.js (versi LTS)
* npm atau yarn
* Expo CLI
* Android Studio (untuk emulator Android)
* Xcode (khusus macOS untuk iOS)
* Akun Expo
* Akun Firebase

---

## 🚀 Instalasi Project

### 1. Clone Repository

```bash
git clone https://github.com/BudHand/SipoApp.git
cd SipoApp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Login ke Expo

```bash
npx expo login
```

---

## ⚙️ Konfigurasi `app.json`

Buka file `app.json`, lalu sesuaikan beberapa bagian berikut.

### iOS Bundle Identifier

```json
"ios": {
  "bundleIdentifier": "contoh : com.sipo.mobile"
}
```

### Android Package Name

```json
"android": {
  "package": "contoh : com.sipo.mobile"
}
```

### Expo Project ID

```json
"extra": {
  "eas": {
    "projectId": "YOUR_EXPO_PROJECT_ID"
  }
}
```

### EAS Update URL

```json
"updates": {
  "url": "https://u.expo.dev/YOUR_EXPO_PROJECT_ID"
}
```

---

## 🔥 Konfigurasi Firebase

### 1. Buat Project Firebase

Buka Firebase Console:

[https://console.firebase.google.com/](https://console.firebase.google.com/)

### 2. Tambahkan Android App

Gunakan package name yang sama dengan nilai `android.package` pada `app.json`.

Contoh:

```text
com.sipo.mobile
```

### 3. Download `google-services.json`

Simpan file tersebut di root project.

```text
SipoApp/
├── google-services.json
├── app.json
├── package.json
└── ...
```

---

## 🌐 Konfigurasi Environment Variables

Jika project menggunakan `.env`, buat file `.env` di root project.

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

Sesuaikan URL API dengan backend yang digunakan.

---

## ▶️ Menjalankan Project

```bash
npx expo start
```

Kemudian pilih:

* `a` → Jalankan di Android
* `i` → Jalankan di iOS
* `w` → Jalankan di Web

---

## 🏗️ Build APK / AAB

### Build Android

```bash
→ APK (testing / preview).
eas build -p android --profile preview

→ AAB (untuk deploy di Play Store).
eas build -p android --profile production
```

### Build iOS

```bash
→ IPA untuk TestFlight.
eas build -p ios --profile preview

→ IPA untuk App Store.
eas build -p ios --profile production 
```

---

## 🔄 OTA Update

```bash
eas update --branch production --message "Update terbaru"
```

---

## 📁 Struktur File Penting

| File                   | Fungsi                       |
| ---------------------- | ---------------------------- |
| `app.json`             | Konfigurasi utama Expo       |
| `google-services.json` | Konfigurasi Firebase Android |
| `package.json`         | Dependency project           |
| `eas.json`             | Konfigurasi EAS Build        |
| `.env`                 | Environment variables        |

---

## 📌 Versi Aplikasi

Versi saat ini:

```json
"version": "2.2.1"
```

---

## 🧰 Script yang Sering Digunakan

```bash
npm install
npx expo-doctor
npx expo start
npx expo start --port 19000
eas build -p android --profile preview
eas build -p ios --profile preview
```

---

## 🐛 Troubleshooting

### Error `google-services.json not found`

Pastikan file `google-services.json` sudah berada di root project.

### Error `projectId not found`

Pastikan `extra.eas.projectId` pada `app.json` sudah diisi dengan Project ID dari Expo.

### Error `bundleIdentifier/package is invalid`

Gunakan format berikut:

```text
com.namaaplikasi.mobile
```

---

## 👨‍💻 Developer

Dikembangkan oleh **BudHand**.

GitHub: [https://github.com/BudHand](https://github.com/BudHand)

---

## 📄 License

Project ini menggunakan lisensi MIT.
