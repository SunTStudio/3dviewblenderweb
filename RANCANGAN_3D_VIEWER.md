# Rancangan Proyek: Web 3D Viewer & Blender Integration

Dokumen ini memuat arsitektur, daftar fitur, alur kerja, dan roadmap implementasi untuk pengembangan aplikasi Web 3D interaktif yang terbagi ke dalam **2 Tahap Pengembangan**.

---

## 📌 Ringkasan Proyek

Tujuan dari proyek ini adalah membangun aplikasi web interaktif yang memungkinkan pengguna memuat, memanipulasi, dan melihat model 3D (dari Blender) langsung di browser, dengan rencana integrasi mendalam ke perangkat lunak Blender di tahap selanjutnya.

### Roadmap Pengembangan:
* **Tahap 1 (Fokus Saat Ini):** *Standalone Web 3D Asset Viewer with Cloud Database & File Manager*  
  Viewer 3D berbasis WebGL untuk menampilkan model 3D hasil ekspor Blender (`.glb` / `.gltf`), lengkap dengan sistem autentikasi pengguna (Login/Register), penyimpanan database per akun, dan File Manager/Pustaka Model interaktif.
* **Tahap 2 (Pengembangan Lanjutan):** *Blender Live Connection & Automation*  
  Integrasi dua arah antara web dengan Blender (headless script automation, auto-export file `.blend`, dan live synchronization via WebSocket).

---

## 🚀 TAHAP 1: Web 3D Asset Viewer (Fokus Utama)

Tahap ini berfokus pada pengalaman pengguna dalam melihat dan berinteraksi dengan aset 3D di browser tanpa perlu menginstal software apa pun.

### 1. Fitur Utama (Core Features)

#### A. Kontrol Navigasi & Kamera (Camera & Viewport Controls)
* **Orbit / Rotasi:** Putar kamera mengelilingi model (klik kiri + geser mouse / sentuh 1 jari di smartphone).
* **Pan / Geser:** Geser posisi pandang kamera (klik kanan + geser / scroll-click / sentuh 2 jari).
* **Zoom In & Out:** Perbesar/perkecil tampilan model (scroll roda mouse / gesture pinch di smartphone).
* **Preset Views:** Tombol pintas untuk sudut pandang ortogonal (Tampak Depan, Belakang, Samping Kiri/Kanan, Atas, dan Bawah).
* **Reset Camera:** Tombol untuk mengembalikan kamera ke sudut pandang awal dan memfokuskan model ke tengah (*auto-center & fit to view*).
* **Auto-Rotate:** Mode putar otomatis dengan kecepatan yang dapat diatur (cocok untuk showcase produk).
* **Fullscreen Mode:** Tampilan layar penuh untuk visualisasi imersif.

#### B. Pemuatan Model (Asset Loading & Management)
* **Drag-and-Drop Loader:** Pengguna dapat langsung menarik file `.glb` atau `.gltf` dari file explorer komputer ke dalam browser.
* **File Picker:** Tombol upload file lokal untuk memilih aset 3D.
* **Preloaded Demo Assets:** Tersedia beberapa model contoh bawaan (misalnya produk, karakter, atau arsitektur) agar pengguna bisa langsung mencoba tanpa file sendiri.
* **Progress Bar & Loading Indicator:** Tampilan persentase unduhan dan status parsing aset 3D.

#### C. Pengaturan Pencahayaan & Lingkungan (Lighting & Environment)
* **HDRI Environment Maps:** Dukungan latar belakang berbasis gambar HDRI untuk refleksi realistis pada material metalik dan kaca.
* **Studio Lighting Presets:** Pilihan preset pencahayaan (Studio, Outdoor/Matahari, Warm Interior, Neon/Cyberpunk).
* **Pengatur Intensitas Cahaya:** Slider untuk menyesuaikan intensitas cahaya utama (*Key Light*), *Fill Light*, dan cahaya lingkungan (*Ambient Light*).
* **Pengaturan Bayangan (Shadows):** Toggle on/off bayangan lembut di bawah objek (*contact shadows*).
* **Pilihan Background:** Ganti warna latar belakang (Transparan/Solid Color/Gradasi/HDRI Skybox).

#### D. Inspeksi Model & Kustomisasi Material (Material & Part Customization)
* **Mesh Hierarchy Tree:** Daftar struktur bagian/node objek (anak-induk partisi mesh).
* **Part Isolator / Hide-Show:** Kemampuan untuk menyembunyikan atau menampilkan bagian tertentu dari model.
* **Color / Texture Switcher:** Pengguna dapat memilih part tertentu dan mengubah warnanya secara interaktif.
* **Wireframe Mode:** Toggle untuk melihat topologi polygon/kawat dari model 3D (sangat berguna bagi 3D artist untuk review topologi).

#### E. Animasi (Bila Model Memiliki Animasi dari Blender)
* **Animation Controller:** Play, Pause, dan Stop animasi yang tertanam di file `.glb`.
* **Clip Selector:** Dropdown untuk memilih klip animasi jika model memiliki multiple animation (misal: *Walk, Idle, Jump*).
* **Timeline Scrubber:** Slider untuk memutar animasi ke detik/frame tertentu.
* **Speed Multiplier:** Pengatur kecepatan pemutaran animasi (0.5x, 1x, 2x).

#### F. Fitur Tambahan (Utility & Sharing)
* **Screenshot / Snapshot Tool:** Tombol untuk mengambil tangkapan layar 3D beresolusi tinggi (dengan opsi background transparan PNG).
* **Model Info / Statistics Panel:** Menampilkan informasi teknis model (Jumlah Poligon/Triangles, Jumlah Vertices, Ukuran Bounding Box, Material Count).

---

### 2. Rekomendasi Arsitektur & Teknologi (Tahap 1)

* **Rendering Engine:** **Three.js** (Standard industri untuk 3D Web, sangat fleksibel dan memiliki dukungan kontrol kamera `OrbitControls` serta `GLTFLoader`).
* **Format Model Utama:** **`.glb`** (Binary GLTF, menggabungkan geometri, tekstur, dan animasi ke dalam satu file tunggal yang terkompresi).
* **Frontend UI:** HTML5 + CSS modern (Tailwind CSS atau Clean Modular CSS) + JavaScript / TypeScript.
* **Bundler:** Vite (cepat, ringan, dan sangat mudah untuk development web modern).

---

## 🔮 TAHAP 2: Blender Live Connection & Automation (Roadmap Lanjutan)

Tahap ini menghubungkan aplikasi web secara langsung dengan aplikasi desktop Blender atau server Blender headless.

### 1. Fitur Tahap 2 yang Direncanakan:
1. **Headless Blender Server Processor:**
   * Pengguna mengunggah file mentah `.blend` ke web.
   * Server (menggunakan script Python `bpy` di latar belakang) membuka file `.blend`, mengoptimasi geometri, dan mengekspornya menjadi `.glb` siap-web secara otomatis.
2. **Blender Live Sync Addon (WebSocket):**
   * Addon Python di dalam Blender desktop.
   * Ketika 3D artist memindahkan objek, mengubah warna, atau menggeser kamera di Blender, perubahan tersebut langsung terkirim via WebSocket ke tampilan web viewer secara real-time.
3. **Parametric Model Generator:**
   * Web menyediakan formulir parameter (misal: panjang meja, lebar, tipe kaki meja).
   * Blender di sisi server menghasilkan model 3D sesuai ukuran kustom tersebut, me-render foto katalog, dan mengirimkan file 3D-nya kembali ke browser.

---

## 📋 Best Practices untuk Export dari Blender ke Web (Tahap 1)

Agar model dari Blender tampil optimal dan mulus di web:
1. **Apply Transforms:** Selalu lakukan `Ctrl + A` -> *Apply All Transforms* (Location, Rotation, Scale) sebelum export.
2. **Gunakan Shader Standar:** Gunakan node **Principled BSDF** standar untuk tekstur (Base Color, Metallic, Roughness, Normal Map).
3. **Optimasi Ukuran Tekstur:** Usahakan resolusi gambar tekstur maksimum 2048x2048 (2K) atau 1024x1024 (1K) dalam format JPG atau WebP/PNG.
4. **Optimasi Polygon Count:** Targetkan model *low-to-mid poly* untuk performa web 60 FPS yang lancar di laptop maupun smartphone.
5. **Format Export:** Pilih menu `File -> Export -> glTF 2.0 (.glb/.gltf)` dengan opsi *Include: Selected Objects*, *Transform: +Y Up*, dan centang *Animation* jika ada.

---

## 🎯 Rencana Langkah Eksekusi (Action Plan Berikutnya)

1. **Setup Pondasi Proyek Tahap 1:**
   * Inisialisasi struktur file web viewer (HTML, CSS, JavaScript).
   * Setup Three.js, Camera, Canvas, dan `OrbitControls` (rotasi, pan, zoom).
2. **Implementasi GLTF/GLB Loader:**
   * Buat sistem pemuatan model 3D dengan drag-and-drop dan file selector.
   * Tambahkan model demo default.
3. **Pembuatan UI Panel Kontrol:**
   * Tambahkan tombol reset kamera, ganti warna background, wireframe toggle, dan pencahayaan studio.
4. **Testing & Evaluasi:**
   * Coba muat berbagai jenis file `.glb` dari Blender untuk memastikan kesesuaian visual.

