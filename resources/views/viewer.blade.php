<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>3D Studio - Cloud Web Viewer & Blender Hub</title>
  
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- Import Map for Three.js & Addons -->
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
    }
  }
  </script>
</head>
<body>
  <!-- App Container -->
  <div id="app">
    <!-- Top Header -->
    <header class="top-header">
      <div class="header-left">
        <div class="brand">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="brand-text">
            <h1>3D Studio</h1>
            <span class="badge">Cloud Asset Hub</span>
          </div>
        </div>
      </div>

      <div class="header-center">
        <!-- File Manager Button (Opens Cloud Asset Library) -->
        <button id="btn-open-library" class="btn btn-primary" title="Buka File Manager Model 3D Tersimpan">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Pustaka Model Saya</span>
        </button>

        <!-- Load Local File -->
        <label for="file-input" class="btn btn-secondary" title="Muat file langsung dari komputer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>File Lokal</span>
          <input type="file" id="file-input" accept=".glb,.gltf" hidden>
        </label>

        <!-- Demo Dropdown -->
        <div class="dropdown-container">
          <button id="btn-demo-models" class="btn btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Model Demo</span>
          </button>
          <div id="demo-menu" class="dropdown-menu hidden">
            <button class="dropdown-item" data-demo="scifi-drone">🛸 Sci-Fi Drone (Procedural)</button>
            <button class="dropdown-item" data-demo="mech-cube">📦 Mech Core Cube (Procedural)</button>
            <button class="dropdown-item" data-demo="helmet">🪖 Damaged Helmet (Web GLTF)</button>
            <button class="dropdown-item" data-demo="duck">🦆 Classic Toy Duck (Web GLTF)</button>
          </div>
        </div>
      </div>

      <div class="header-right">
        <!-- Auth Section -->
        <div id="auth-section">
          <!-- Guest State -->
          <button id="btn-auth-modal" class="btn btn-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Masuk / Daftar</span>
          </button>

          <!-- Authenticated State (Hidden by default, shown via JS) -->
          <div id="user-profile-menu" class="user-pill hidden">
            <div class="user-avatar" id="user-avatar">U</div>
            <span class="user-name" id="user-name-display">Pengguna</span>
            <button id="btn-logout" class="icon-btn-sm" title="Keluar / Logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="stats-badge" id="stats-badge" title="Statistik Model">
          <span id="poly-count">0 Triangles</span>
          <span class="dot-separator">•</span>
          <span id="fps-counter">60 FPS</span>
        </div>

        <button id="btn-fullscreen" class="icon-btn" title="Mode Layar Penuh">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
      </div>
    </header>

    <!-- Main 3D Canvas Area -->
    <main class="viewport-container" id="viewport-container">
      <canvas id="webgl-canvas"></canvas>

      <!-- Drag & Drop Overlay -->
      <div id="drop-overlay" class="drop-overlay hidden">
        <div class="drop-content">
          <div class="drop-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3>Tarik & Lepaskan File 3D Anda Di Sini</h3>
          <p>Mendukung format <strong>.glb</strong> dan <strong>.gltf</strong> hasil export Blender</p>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div id="loading-overlay" class="loading-overlay hidden">
        <div class="spinner"></div>
        <p id="loading-text">Memuat Model 3D...</p>
        <div class="progress-bar-container">
          <div id="progress-bar" class="progress-bar"></div>
        </div>
      </div>

      <!-- Floating Side Controls Panel -->
      <button id="btn-expand-panel" class="floating-panel-toggle hidden" title="Buka Panel Kontrol">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Panel Kontrol</span>
      </button>

      <aside class="control-panel" id="control-panel">
        <div class="panel-header">
          <h2>Panel Kontrol</h2>
          <button id="btn-toggle-panel" class="icon-btn-sm" title="Minimize Panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="panel-body">
          <!-- Accordion: Navigasi Kamera -->
          <section class="panel-section">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="7"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
              </svg>
              <span>Kamera & Sudut Pandang</span>
            </div>
            <div class="preset-views-grid">
              <button class="btn-chip" data-view="reset" title="Kembalikan kamera ke tengah">Reset</button>
              <button class="btn-chip" data-view="front">Depan</button>
              <button class="btn-chip" data-view="back">Belakang</button>
              <button class="btn-chip" data-view="top">Atas</button>
              <button class="btn-chip" data-view="left">Kiri</button>
              <button class="btn-chip" data-view="right">Kanan</button>
            </div>

            <div class="control-row mt-2">
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-autorotate">
                <span class="slider"></span>
              </label>
              <span class="control-label">Auto-Rotate (Putar Otomatis)</span>
            </div>

            <div class="control-row">
              <span class="control-label-sm">Kecepatan Putar</span>
              <input type="range" id="slider-autorotate-speed" min="0.5" max="5" step="0.5" value="1.5">
            </div>
          </section>

          <!-- Accordion: Tampilan & Display -->
          <section class="panel-section">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Tampilan & Visual</span>
            </div>

            <div class="control-row">
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-wireframe">
                <span class="slider"></span>
              </label>
              <span class="control-label">Mode Wireframe (Poligon)</span>
            </div>

            <div class="control-row">
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-grid" checked>
                <span class="slider"></span>
              </label>
              <span class="control-label">Grid Lantai</span>
            </div>

            <div class="control-row">
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-shadows" checked>
                <span class="slider"></span>
              </label>
              <span class="control-label">Bayangan (Shadows)</span>
            </div>

            <div class="color-presets-group mt-2">
              <span class="control-label-sm">Warna Background</span>
              <div class="color-palette">
                <button class="color-dot active" data-color="#14171f" style="background: #14171f;" title="Dark Slate"></button>
                <button class="color-dot" data-color="#0b0c10" style="background: #0b0c10;" title="OLED Black"></button>
                <button class="color-dot" data-color="#2a2e39" style="background: #2a2e39;" title="Studio Gray"></button>
                <button class="color-dot" data-color="#e8ecf2" style="background: #e8ecf2;" title="Clean White"></button>
                <input type="color" id="custom-bg-color" value="#14171f" title="Pilih Warna Kustom">
              </div>
            </div>
          </section>

          <!-- Accordion: Pencahayaan (Lighting) -->
          <section class="panel-section">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <span>Pencahayaan (Lighting)</span>
            </div>

            <div class="lighting-presets">
              <button class="btn-chip active" data-light="studio">Studio Neutral</button>
              <button class="btn-chip" data-light="warm">Warm Sunlight</button>
              <button class="btn-chip" data-light="cyberpunk">Cyberpunk Neon</button>
            </div>

            <div class="control-row mt-2">
              <span class="control-label-sm">Intensitas Cahaya</span>
              <input type="range" id="slider-light-intensity" min="0.2" max="3.0" step="0.1" value="1.0">
            </div>
          </section>

          <!-- Accordion: Animasi (Hanya muncul jika model memiliki animasi) -->
          <section class="panel-section hidden" id="animation-section">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Animasi Blender</span>
            </div>

            <div class="control-group">
              <label for="anim-clip-select" class="control-label-sm">Pilih Klip Animasi:</label>
              <select id="anim-clip-select" class="select-input"></select>
            </div>

            <div class="anim-controls-row mt-2">
              <button id="btn-anim-play" class="btn btn-secondary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Play / Pause</span>
              </button>
              <div class="speed-selector">
                <button class="btn-chip-sm active" data-speed="1">1x</button>
                <button class="btn-chip-sm" data-speed="0.5">0.5x</button>
                <button class="btn-chip-sm" data-speed="2">2x</button>
              </div>
            </div>
          </section>

          <!-- Accordion: Info Model & Snapshot -->
          <section class="panel-section">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Info & Ekspor</span>
            </div>

            <div class="model-info-card" id="model-info-card">
              <div class="info-row">
                <span class="info-label">Nama Model:</span>
                <span class="info-val" id="info-model-name">Sci-Fi Drone</span>
              </div>
              <div class="info-row">
                <span class="info-label">Poligon / Tris:</span>
                <span class="info-val" id="info-tris">0</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vertices:</span>
                <span class="info-val" id="info-verts">0</span>
              </div>
              <div class="info-row">
                <span class="info-label">Jumlah Mesh:</span>
                <span class="info-val" id="info-meshes">0</span>
              </div>
            </div>

            <button id="btn-screenshot" class="btn btn-secondary w-full mt-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <span>Ambil Foto HD (.PNG)</span>
            </button>

            <!-- Save Snapshot as Thumbnail for Current Cloud Asset -->
            <button id="btn-save-as-thumb" class="btn btn-accent w-full mt-2 hidden" title="Simpan sudut pandang saat ini sebagai sampul foto kartu model">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Simpan Sebagai Sampul Model</span>
            </button>
          </section>
        </div>
      </aside>

      <!-- Bottom Quick Navigation Hints -->
      <footer class="bottom-bar">
        <div class="nav-hints">
          <span class="hint-item"><span class="kbd">Klik Kiri</span> Putar Orbit</span>
          <span class="hint-item"><span class="kbd">Klik Kanan</span> Geser / Pan</span>
          <span class="hint-item"><span class="kbd">Scroll</span> Zoom In / Out</span>
          <span class="hint-item"><span class="kbd">Pustaka</span> Simpan & Buka Model</span>
        </div>
      </footer>
    </main>

    <!-- ==============================================
         MODAL 1: AUTHENTICATION (Login & Register)
         ============================================== -->
    <div id="modal-auth" class="modal-backdrop hidden">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-tabs">
            <button class="modal-tab active" id="tab-btn-login">Masuk (Login)</button>
            <button class="modal-tab" id="tab-btn-register">Daftar Akun Baru</button>
          </div>
          <button class="btn-close-modal" id="btn-close-auth-modal">✕</button>
        </div>

        <div class="modal-body">
          <div id="auth-error-msg" class="alert-box alert-error hidden"></div>
          <div id="auth-success-msg" class="alert-box alert-success hidden"></div>

          <!-- Form Login -->
          <form id="form-login" class="auth-form">
            <div class="form-group">
              <label for="login-email">Alamat Email</label>
              <input type="email" id="login-email" class="form-input" placeholder="nama@email.com" required>
            </div>
            <div class="form-group">
              <label for="login-password">Kata Sandi</label>
              <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary w-full mt-2" id="btn-submit-login">
              <span>Masuk ke Akun</span>
            </button>
          </form>

          <!-- Form Register -->
          <form id="form-register" class="auth-form hidden">
            <div class="form-group">
              <label for="reg-name">Nama Lengkap</label>
              <input type="text" id="reg-name" class="form-input" placeholder="Misal: John 3D Artist" required>
            </div>
            <div class="form-group">
              <label for="reg-email">Alamat Email</label>
              <input type="email" id="reg-email" class="form-input" placeholder="nama@email.com" required>
            </div>
            <div class="form-group">
              <label for="reg-password">Kata Sandi (Minimal 6 karakter)</label>
              <input type="password" id="reg-password" class="form-input" placeholder="••••••••" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary w-full mt-2" id="btn-submit-register">
              <span>Buat Akun Sekarang</span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- ==============================================
         MODAL 2: FILE MANAGER / ASSET LIBRARY DRAWER
         ============================================== -->
    <div id="modal-file-manager" class="modal-backdrop hidden">
      <div class="file-manager-container">
        <!-- FM Header -->
        <div class="fm-header">
          <div class="fm-title-area">
            <div class="fm-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h2>Pustaka Model 3D Saya</h2>
              <p>Kelola dan muat aset 3D (.glb / .gltf) yang tersimpan di akun Anda</p>
            </div>
          </div>

          <div class="fm-actions">
            <!-- Upload Button directly to Database -->
            <label for="cloud-file-input" class="btn btn-primary" id="lbl-cloud-upload">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Unggah Model (.glb / .gltf)</span>
              <input type="file" id="cloud-file-input" accept=".glb,.gltf" hidden>
            </label>

            <button class="btn-close-modal" id="btn-close-fm">✕</button>
          </div>
        </div>

        <!-- FM Filter Bar -->
        <div class="fm-filter-bar">
          <div class="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="fm-search-input" placeholder="Cari model berdasarkan nama...">
          </div>
          <div class="fm-stats-info" id="fm-stats-info">Memuat pustaka...</div>
        </div>

        <!-- Upload Progress Indicator -->
        <div id="fm-upload-indicator" class="fm-upload-indicator hidden">
          <div class="spinner-sm"></div>
          <span id="fm-upload-status-text">Mengunggah model 3D ke penyimpanan server...</span>
          <div class="progress-bar-container-sm">
            <div id="fm-upload-progress" class="progress-bar"></div>
          </div>
        </div>

        <!-- FM Content Grid -->
        <div class="fm-body" id="fm-models-grid">
          <!-- Populated dynamically via JS -->
        </div>
      </div>
    </div>
  </div>

  <!-- Main JavaScript App -->
  <script type="module" src="/js/app.js"></script>
</body>
</html>

