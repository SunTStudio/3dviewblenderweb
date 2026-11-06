export class UIManager {
  constructor(app) {
    this.app = app;
    this.elements = {};
    this.cacheElements();
    this.bindEvents();
  }

  cacheElements() {
    this.elements = {
      fileInput: document.getElementById('file-input'),
      btnDemoModels: document.getElementById('btn-demo-models'),
      demoMenu: document.getElementById('demo-menu'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      viewportContainer: document.getElementById('viewport-container'),
      dropOverlay: document.getElementById('drop-overlay'),
      loadingOverlay: document.getElementById('loading-overlay'),
      loadingText: document.getElementById('loading-text'),
      progressBar: document.getElementById('progress-bar'),

      // Side Panel
      controlPanel: document.getElementById('control-panel'),
      btnTogglePanel: document.getElementById('btn-toggle-panel'),
      btnExpandPanel: document.getElementById('btn-expand-panel'),

      // Camera
      presetBtns: document.querySelectorAll('.preset-views-grid .btn-chip'),
      toggleAutorotate: document.getElementById('toggle-autorotate'),
      sliderAutorotateSpeed: document.getElementById('slider-autorotate-speed'),

      // Display
      toggleWireframe: document.getElementById('toggle-wireframe'),
      toggleGrid: document.getElementById('toggle-grid'),
      toggleShadows: document.getElementById('toggle-shadows'),
      colorDots: document.querySelectorAll('.color-dot'),
      customBgColor: document.getElementById('custom-bg-color'),

      // Lighting
      lightingBtns: document.querySelectorAll('.lighting-presets .btn-chip'),
      sliderLightIntensity: document.getElementById('slider-light-intensity'),

      // Animation
      animationSection: document.getElementById('animation-section'),
      animClipSelect: document.getElementById('anim-clip-select'),
      btnAnimPlay: document.getElementById('btn-anim-play'),
      speedBtns: document.querySelectorAll('.speed-selector .btn-chip-sm'),

      // Model Info & Stats
      infoModelName: document.getElementById('info-model-name'),
      infoTris: document.getElementById('info-tris'),
      infoVerts: document.getElementById('info-verts'),
      infoMeshes: document.getElementById('info-meshes'),
      polyCountBadge: document.getElementById('poly-count'),
      fpsCounterBadge: document.getElementById('fps-counter'),
      btnScreenshot: document.getElementById('btn-screenshot')
    };
  }

  bindEvents() {
    const { elements, app } = this;

    // 1. File Input
    elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        app.loadLocalFile(e.target.files[0]);
      }
    });

    // 2. Demo Dropdown
    elements.btnDemoModels.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.demoMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      elements.demoMenu.classList.add('hidden');
    });

    elements.demoMenu.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', () => {
        const demoKey = item.dataset.demo;
        app.loadDemoModel(demoKey);
        elements.demoMenu.classList.add('hidden');
      });
    });

    // 3. Fullscreen
    elements.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // 4. Drag & Drop on Viewport
    const dropArea = elements.viewportContainer;
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        elements.dropOverlay.classList.remove('hidden');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        elements.dropOverlay.classList.add('hidden');
      });
    });

    dropArea.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        app.loadLocalFile(e.dataTransfer.files[0]);
      }
    });

    // 5. Side Panel Toggle Minimize & Expand
    elements.btnTogglePanel?.addEventListener('click', () => {
      elements.controlPanel.classList.add('minimized');
      elements.btnExpandPanel?.classList.remove('hidden');
    });

    elements.btnExpandPanel?.addEventListener('click', () => {
      elements.controlPanel.classList.remove('minimized');
      elements.btnExpandPanel?.classList.add('hidden');
    });

    // 6. Camera Preset Views
    elements.presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.presetBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        app.viewer.setCameraPreset(btn.dataset.view);
      });
    });

    // 7. Auto-rotate
    elements.toggleAutorotate.addEventListener('change', (e) => {
      app.viewer.setAutoRotate(e.target.checked, parseFloat(elements.sliderAutorotateSpeed.value));
    });

    elements.sliderAutorotateSpeed.addEventListener('input', (e) => {
      if (elements.toggleAutorotate.checked) {
        app.viewer.setAutoRotate(true, parseFloat(e.target.value));
      }
    });

    // 8. Display Toggles
    elements.toggleWireframe.addEventListener('change', (e) => {
      app.viewer.setWireframe(e.target.checked);
    });

    elements.toggleGrid.addEventListener('change', (e) => {
      app.viewer.setGrid(e.target.checked);
    });

    elements.toggleShadows.addEventListener('change', (e) => {
      app.viewer.setShadows(e.target.checked);
    });

    // Background color
    elements.colorDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        elements.colorDots.forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        const color = dot.dataset.color;
        app.viewer.setBackgroundColor(color);
        elements.viewportContainer.style.backgroundColor = color;
      });
    });

    elements.customBgColor.addEventListener('input', (e) => {
      elements.colorDots.forEach((d) => d.classList.remove('active'));
      const color = e.target.value;
      app.viewer.setBackgroundColor(color);
      elements.viewportContainer.style.backgroundColor = color;
    });

    // 9. Lighting Presets
    elements.lightingBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.lightingBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        app.lighting.applyPreset(btn.dataset.light);
      });
    });

    elements.sliderLightIntensity.addEventListener('input', (e) => {
      app.lighting.setIntensity(parseFloat(e.target.value));
    });

    // 10. Animation Controls
    elements.btnAnimPlay.addEventListener('click', () => {
      const isPlaying = app.animation.togglePlay();
      elements.btnAnimPlay.classList.toggle('active', isPlaying);
    });

    elements.animClipSelect.addEventListener('change', (e) => {
      app.animation.playClip(e.target.value);
    });

    elements.speedBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.speedBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        app.animation.setSpeed(parseFloat(btn.dataset.speed));
      });
    });

    // 11. Screenshot
    elements.btnScreenshot.addEventListener('click', () => {
      app.viewer.takeScreenshot();
    });

    // 12. Hook Viewer FPS
    app.viewer.onFpsUpdate = (fps) => {
      elements.fpsCounterBadge.textContent = `${fps} FPS`;
    };
  }

  showLoading(text = 'Memuat Model 3D...') {
    this.elements.loadingText.textContent = text;
    this.elements.progressBar.style.width = '0%';
    this.elements.loadingOverlay.classList.remove('hidden');
  }

  updateProgress(percent) {
    this.elements.progressBar.style.width = `${Math.min(100, Math.round(percent))}%`;
  }

  hideLoading() {
    this.elements.loadingOverlay.classList.add('hidden');
  }

  updateModelStats(stats) {
    const formattedTris = (stats.triangles || 0).toLocaleString();
    const formattedVerts = (stats.vertices || 0).toLocaleString();

    this.elements.infoModelName.textContent = stats.name || 'Model 3D';
    this.elements.infoTris.textContent = formattedTris;
    this.elements.infoVerts.textContent = formattedVerts;
    this.elements.infoMeshes.textContent = stats.meshes || 0;

    this.elements.polyCountBadge.textContent = `${formattedTris} Tris`;
  }

  setupAnimationsUI(clips = []) {
    const { animationSection, animClipSelect } = this.elements;

    if (!clips || clips.length === 0) {
      animationSection.classList.add('hidden');
      return;
    }

    animClipSelect.innerHTML = '';
    clips.forEach((clip, index) => {
      const opt = document.createElement('option');
      opt.value = clip.name;
      opt.textContent = `${index + 1}. ${clip.name || 'Animation Clip'}`;
      animClipSelect.appendChild(opt);
    });

    animationSection.classList.remove('hidden');
  }
}

