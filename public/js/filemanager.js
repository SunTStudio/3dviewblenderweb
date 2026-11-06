export class FileManager {
  constructor(app) {
    this.app = app;
    this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    this.assets = [];
    this.currentActiveAsset = null;

    this.cacheElements();
    this.bindEvents();
  }

  cacheElements() {
    this.elements = {
      btnOpenLibrary: document.getElementById('btn-open-library'),
      modalFileManager: document.getElementById('modal-file-manager'),
      btnCloseFm: document.getElementById('btn-close-fm'),
      cloudFileInput: document.getElementById('cloud-file-input'),
      fmSearchInput: document.getElementById('fm-search-input'),
      fmStatsInfo: document.getElementById('fm-stats-info'),
      fmModelsGrid: document.getElementById('fm-models-grid'),
      fmUploadIndicator: document.getElementById('fm-upload-indicator'),
      fmUploadStatusText: document.getElementById('fm-upload-status-text'),
      fmUploadProgress: document.getElementById('fm-upload-progress'),
      btnSaveAsThumb: document.getElementById('btn-save-as-thumb'),
    };
  }

  bindEvents() {
    const { elements } = this;

    // Open Library
    elements.btnOpenLibrary?.addEventListener('click', () => {
      this.open();
    });

    // Close Library
    elements.btnCloseFm?.addEventListener('click', () => {
      this.close();
    });

    elements.modalFileManager?.addEventListener('click', (e) => {
      if (e.target === elements.modalFileManager) {
        this.close();
      }
    });

    // Search filter
    let debounceTimer = null;
    elements.fmSearchInput?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.fetchAssets(e.target.value);
      }, 300);
    });

    // Cloud File Upload
    elements.cloudFileInput?.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        await this.uploadModel(e.target.files[0]);
        e.target.value = '';
      }
    });

    // Save as Thumbnail button in side panel
    elements.btnSaveAsThumb?.addEventListener('click', async () => {
      if (this.currentActiveAsset) {
        await this.captureAndSaveThumbnail(this.currentActiveAsset.id);
      }
    });
  }

  async open() {
    if (!this.app.auth.isAuthenticated()) {
      this.app.auth.openModal('login');
      return;
    }

    this.elements.modalFileManager.classList.remove('hidden');
    await this.fetchAssets();
  }

  close() {
    this.elements.modalFileManager.classList.add('hidden');
  }

  async fetchAssets(query = '') {
    const url = query ? `/assets?q=${encodeURIComponent(query)}` : '/assets';
    try {
      this.elements.fmStatsInfo.textContent = 'Memuat model...';
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        this.assets = data.assets;
        this.renderGrid(this.assets);
      }
    } catch (err) {
      this.elements.fmStatsInfo.textContent = 'Gagal memuat data.';
      console.error('Fetch assets error:', err);
    }
  }

  renderGrid(assets) {
    const grid = this.elements.fmModelsGrid;
    grid.innerHTML = '';

    this.elements.fmStatsInfo.textContent = `${assets.length} model ditemukan`;

    if (assets.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <h3>Pustaka Anda Masih Kosong</h3>
          <p>Belum ada model 3D tersimpan. Klik tombol <strong>Unggah Model (.glb / .gltf)</strong> di atas untuk menyimpan model pertama Anda!</p>
        </div>
      `;
      return;
    }

    assets.forEach((asset) => {
      const card = document.createElement('div');
      card.className = 'model-card-item';

      const thumbHtml = asset.thumbnail_url
        ? `<img src="${asset.thumbnail_url}" alt="${asset.name}" class="model-thumbnail-img">`
        : `
          <div class="model-thumbnail-fallback">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <span>Model 3D</span>
          </div>
        `;

      card.innerHTML = `
        <div class="model-thumbnail-wrapper">
          ${thumbHtml}
          <span class="model-badge-ext">${asset.formatted_size}</span>
        </div>
        <div class="model-card-details">
          <h4 class="model-card-title" title="${asset.name}">${asset.name}</h4>
          <div class="model-card-meta">
            <span>${asset.triangles_count ? asset.triangles_count.toLocaleString() + ' Tris' : 'Aset 3D'}</span>
            <span>•</span>
            <span>${asset.created_at}</span>
          </div>
          <div class="model-actions-row">
            <button class="btn-card-load btn-load-asset" data-id="${asset.id}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Buka</span>
            </button>
            <button class="icon-btn-sm btn-rename-asset" data-id="${asset.id}" title="Ganti Nama">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button class="btn-danger-sm btn-delete-asset" data-id="${asset.id}" title="Hapus">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      // Event handlers for card buttons
      card.querySelector('.btn-load-asset').addEventListener('click', () => {
        this.loadAssetIntoViewer(asset);
      });

      card.querySelector('.btn-rename-asset').addEventListener('click', () => {
        this.renameAsset(asset);
      });

      card.querySelector('.btn-delete-asset').addEventListener('click', () => {
        this.deleteAsset(asset);
      });

      grid.appendChild(card);
    });
  }

  uploadModel(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      alert('Hanya format file .glb atau .gltf yang didukung!');
      return;
    }

    const { fmUploadIndicator, fmUploadStatusText, fmUploadProgress } = this.elements;
    fmUploadIndicator.classList.remove('hidden');
    fmUploadStatusText.textContent = `Mengunggah "${file.name}" (0%)...`;
    fmUploadProgress.style.width = '0%';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/assets', true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('X-CSRF-TOKEN', this.csrfToken);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        fmUploadProgress.style.width = `${percent}%`;
        const uploadedMB = (e.loaded / 1048576).toFixed(1);
        const totalMB = (e.total / 1048576).toFixed(1);
        fmUploadStatusText.textContent = `Mengunggah "${file.name}": ${uploadedMB} MB / ${totalMB} MB (${percent}%)...`;
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch (err) {}

      if (xhr.status >= 200 && xhr.status < 300 && data.success) {
        fmUploadProgress.style.width = '100%';
        fmUploadStatusText.textContent = 'Upload selesai! Menyimpan model ke database...';
        setTimeout(() => {
          fmUploadIndicator.classList.add('hidden');
          this.fetchAssets();
          if (confirm(`Model "${data.asset.name}" berhasil disimpan! Ingin membukanya sekarang di 3D Viewer?`)) {
            this.loadAssetIntoViewer(data.asset);
          }
        }, 500);
      } else {
        fmUploadIndicator.classList.add('hidden');
        if (xhr.status === 413 || (data.message && data.message.includes('too large'))) {
          alert(`Ukuran berkas (${(file.size / 1048576).toFixed(1)} MB) melebihi batas request server. Server perlu di-restart agar konfigurasi 2GB aktif.`);
        } else {
          alert(data.message || `Gagal mengunggah berkas (Status: ${xhr.status}).`);
        }
      }
    };

    xhr.onerror = () => {
      fmUploadIndicator.classList.add('hidden');
      alert('Terjadi kesalahan jaringan saat mengunggah berkas.');
    };

    xhr.send(formData);
  }

  async loadAssetIntoViewer(asset) {
    this.close();
    this.currentActiveAsset = asset;
    this.elements.btnSaveAsThumb?.classList.remove('hidden');

    try {
      this.app.ui.showLoading(`Mengunduh model "${asset.name}" dari server...`);
      const result = await this.app.loader.loadUrl(
        asset.file_url,
        (percent) => this.app.ui.updateProgress(percent),
        asset.name
      );

      this.app.applyLoadedModel(result);
      this.app.ui.hideLoading();
    } catch (err) {
      this.app.ui.hideLoading();
      alert('Gagal memuat model dari server: ' + err.message);
    }
  }

  async renameAsset(asset) {
    const newName = prompt('Masukkan nama baru untuk model:', asset.name);
    if (!newName || newName.trim() === '' || newName === asset.name) return;

    try {
      const res = await fetch(`/assets/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.csrfToken
        },
        body: JSON.stringify({ name: newName.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.fetchAssets();
      } else {
        alert(data.message || 'Gagal mengubah nama.');
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  }

  async deleteAsset(asset) {
    if (!confirm(`Apakah Anda yakin ingin menghapus model "${asset.name}" dari akun Anda?`)) return;

    try {
      const res = await fetch(`/assets/${asset.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.csrfToken
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (this.currentActiveAsset && this.currentActiveAsset.id === asset.id) {
          this.currentActiveAsset = null;
          this.elements.btnSaveAsThumb?.classList.add('hidden');
        }
        this.fetchAssets();
      } else {
        alert(data.message || 'Gagal menghapus model.');
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  }

  async captureAndSaveThumbnail(assetId) {
    const dataUrl = this.app.viewer.getSnapshotDataUrl();
    try {
      const res = await fetch(`/assets/${assetId}/thumbnail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.csrfToken
        },
        body: JSON.stringify({ image: dataUrl })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Tangkapan layar berhasil disimpan sebagai sampul foto kartu model!');
      } else {
        alert(data.message || 'Gagal menyimpan sampul.');
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  }
}

