import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Viewer {
  constructor(canvas) {
    this.canvas = canvas;
    this.container = canvas.parentElement;

    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    // Helpers & Objects
    this.gridHelper = null;
    this.shadowPlane = null;
    this.currentModel = null;

    // Animation & State
    this.clock = new THREE.Clock();
    this.isAutoRotating = false;
    this.autoRotateSpeed = 1.5;
    this.isWireframe = false;
    this.showGrid = true;
    this.showShadows = true;

    // FPS calculation
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.onFpsUpdate = null;

    // Animation transition for camera views
    this.targetCameraPos = null;
    this.targetControlsTarget = null;
    this.isTransitioningCamera = false;

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#14171f');

    // 2. Camera
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(4, 3, 5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // 5. Grid Helper & Shadow Plane
    this.setupGroundHelpers();

    // Resize listener
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupGroundHelpers() {
    this.gridHelper = new THREE.GridHelper(20, 20, 0x4f46e5, 0x272b38);
    this.gridHelper.position.y = -0.01;
    this.scene.add(this.gridHelper);

    const planeGeo = new THREE.PlaneGeometry(30, 30);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    this.shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  fitModelToView(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    object.position.x -= center.x;
    object.position.y -= box.min.y;
    object.position.z -= center.z;

    const newBox = new THREE.Box3().setFromObject(object);
    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * this.camera.fov) / 360));
    const fitDistance = fitHeightDistance * 1.5;

    const cameraOffset = new THREE.Vector3(1, 0.7, 1.2).normalize().multiplyScalar(fitDistance);
    const targetY = size.y * 0.5;

    this.camera.position.copy(cameraOffset.add(new THREE.Vector3(0, targetY, 0)));
    this.controls.target.set(0, targetY, 0);
    this.camera.near = fitDistance / 100;
    this.camera.far = fitDistance * 100;
    this.camera.updateProjectionMatrix();
    this.controls.update();

    const gridScale = Math.max(10, Math.ceil(maxSize * 4));
    this.gridHelper.scale.set(gridScale / 10, 1, gridScale / 10);
  }

  setModel(model) {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.disposeObject(this.currentModel);
    }

    this.currentModel = model;

    this.currentModel.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        if (this.isWireframe && node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((m) => (m.wireframe = true));
          } else {
            node.material.wireframe = true;
          }
        }
      }
    });

    this.scene.add(this.currentModel);
    this.fitModelToView(this.currentModel);
  }

  setWireframe(enabled) {
    this.isWireframe = enabled;
    if (!this.currentModel) return;

    this.currentModel.traverse((node) => {
      if (node.isMesh && node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach((m) => (m.wireframe = enabled));
        } else {
          node.material.wireframe = enabled;
        }
      }
    });
  }

  setGrid(enabled) {
    this.showGrid = enabled;
    if (this.gridHelper) this.gridHelper.visible = enabled;
  }

  setShadows(enabled) {
    this.showShadows = enabled;
    if (this.shadowPlane) this.shadowPlane.visible = enabled;
    this.renderer.shadowMap.enabled = enabled;
  }

  setBackgroundColor(colorHex) {
    if (this.scene) {
      this.scene.background = new THREE.Color(colorHex);
    }
  }

  setAutoRotate(enabled, speed = 1.5) {
    this.isAutoRotating = enabled;
    this.autoRotateSpeed = speed;
    this.controls.autoRotate = enabled;
    this.controls.autoRotateSpeed = speed;
  }

  setCameraPreset(viewName) {
    if (!this.currentModel) return;

    const box = new THREE.Box3().setFromObject(this.currentModel);
    const size = box.getSize(new THREE.Vector3());
    const targetY = size.y * 0.5;
    const maxSize = Math.max(size.x, size.y, size.z);
    const dist = Math.max(maxSize * 2, 2.5);

    const targetCenter = new THREE.Vector3(0, targetY, 0);
    let newPos = new THREE.Vector3();

    switch (viewName) {
      case 'front':
        newPos.set(0, targetY, dist);
        break;
      case 'back':
        newPos.set(0, targetY, -dist);
        break;
      case 'top':
        newPos.set(0, dist * 1.3, 0.001);
        break;
      case 'left':
        newPos.set(-dist, targetY, 0);
        break;
      case 'right':
        newPos.set(dist, targetY, 0);
        break;
      case 'reset':
      default:
        this.fitModelToView(this.currentModel);
        return;
    }

    this.smoothMoveCamera(newPos, targetCenter);
  }

  smoothMoveCamera(pos, target) {
    this.targetCameraPos = pos;
    this.targetControlsTarget = target;
    this.isTransitioningCamera = true;
  }

  takeScreenshot() {
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `3d-snapshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    return dataUrl;
  }

  getSnapshotDataUrl() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  disposeObject(obj) {
    obj.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  update(animationMixer) {
    const delta = this.clock.getDelta();

    if (this.isTransitioningCamera && this.targetCameraPos) {
      this.camera.position.lerp(this.targetCameraPos, 0.1);
      this.controls.target.lerp(this.targetControlsTarget, 0.1);
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.02) {
        this.camera.position.copy(this.targetCameraPos);
        this.controls.target.copy(this.targetControlsTarget);
        this.isTransitioningCamera = false;
      }
    }

    this.controls.update();

    if (animationMixer) {
      animationMixer.update(delta);
    }

    this.renderer.render(this.scene, this.camera);

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      if (this.onFpsUpdate) this.onFpsUpdate(this.fps);
    }
  }
}

