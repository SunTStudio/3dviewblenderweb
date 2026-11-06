import { Viewer } from './viewer.js';
import { LightingManager } from './lighting.js';
import { AnimationManager } from './animation.js';
import { ModelLoader } from './loader.js';
import { UIManager } from './ui.js';

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.viewer = new Viewer(this.canvas);
    this.lighting = new LightingManager(this.viewer.scene);
    this.animation = new AnimationManager();
    this.loader = new ModelLoader();
    this.ui = new UIManager(this);

    this.startLoop();
    this.initDefaultModel();
  }

  // Load default demo model on initial page launch
  initDefaultModel() {
    this.loadDemoModel('scifi-drone');
  }

  // Handle local GLB / GLTF file selected via picker or drag & drop
  async loadLocalFile(file) {
    try {
      this.ui.showLoading(`Membaca file "${file.name}"...`);
      const result = await this.loader.loadFile(file, (percent) => {
        this.ui.updateProgress(percent);
      });

      this.applyLoadedModel(result);
      this.ui.hideLoading();
    } catch (err) {
      this.ui.hideLoading();
      alert(`Terjadi kesalahan saat memuat file: ${err.message}`);
    }
  }

  // Handle demo models
  async loadDemoModel(key) {
    try {
      this.ui.showLoading('Menyiapkan model demo...');

      let result = null;

      if (key === 'scifi-drone') {
        result = this.loader.createSciFiDrone();
      } else if (key === 'mech-cube') {
        result = this.loader.createMechCube();
      } else if (key === 'helmet') {
        this.ui.showLoading('Mengunduh Damaged Helmet dari Web...');
        result = await this.loader.loadUrl(
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
          (p) => this.ui.updateProgress(p)
        );
      } else if (key === 'duck') {
        this.ui.showLoading('Mengunduh Classic Duck dari Web...');
        result = await this.loader.loadUrl(
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
          (p) => this.ui.updateProgress(p)
        );
      }

      if (result) {
        this.applyLoadedModel(result);
      }

      this.ui.hideLoading();
    } catch (err) {
      this.ui.hideLoading();
      alert(`Gagal memuat model demo: ${err.message}`);
    }
  }

  applyLoadedModel({ scene, animations, stats }) {
    // 1. Set model in viewer
    this.viewer.setModel(scene);

    // 2. Setup animations if present
    const hasAnimations = this.animation.setup(scene, animations);
    this.ui.setupAnimationsUI(this.animation.getClips());

    // 3. Update UI stats
    this.ui.updateModelStats(stats);
  }

  startLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      this.viewer.update(this.animation.getMixer());
    };
    requestAnimationFrame(loop);
  }
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

