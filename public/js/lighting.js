import * as THREE from 'three';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.lightsGroup = new THREE.Group();
    this.scene.add(this.lightsGroup);

    this.ambientLight = null;
    this.keyLight = null;
    this.fillLight = null;
    this.rimLight = null;

    this.baseIntensity = 1.0;
    this.currentPreset = 'studio';

    this.init();
  }

  init() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.lightsGroup.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.keyLight.position.set(6, 10, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 40;
    this.keyLight.shadow.bias = -0.0005;

    const shadowDist = 8;
    this.keyLight.shadow.camera.left = -shadowDist;
    this.keyLight.shadow.camera.right = shadowDist;
    this.keyLight.shadow.camera.top = shadowDist;
    this.keyLight.shadow.camera.bottom = -shadowDist;
    this.lightsGroup.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xdde8ff, 0.9);
    this.fillLight.position.set(-6, 4, -4);
    this.lightsGroup.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.rimLight.position.set(0, 8, -8);
    this.lightsGroup.add(this.rimLight);

    this.applyPreset('studio');
  }

  setIntensity(multiplier) {
    this.baseIntensity = multiplier;
    this.applyPreset(this.currentPreset);
  }

  applyPreset(presetName) {
    this.currentPreset = presetName;
    const mult = this.baseIntensity;

    switch (presetName) {
      case 'warm':
        this.ambientLight.color.setHex(0xffecd2);
        this.ambientLight.intensity = 0.8 * mult;
        this.keyLight.color.setHex(0xffaa55);
        this.keyLight.intensity = 2.4 * mult;
        this.keyLight.position.set(8, 9, 6);
        this.fillLight.color.setHex(0x7fb5ff);
        this.fillLight.intensity = 0.7 * mult;
        this.rimLight.color.setHex(0xffd199);
        this.rimLight.intensity = 1.0 * mult;
        break;

      case 'cyberpunk':
        this.ambientLight.color.setHex(0x181828);
        this.ambientLight.intensity = 0.5 * mult;
        this.keyLight.color.setHex(0x00f0ff);
        this.keyLight.intensity = 2.5 * mult;
        this.keyLight.position.set(6, 6, 6);
        this.fillLight.color.setHex(0xff007f);
        this.fillLight.intensity = 2.2 * mult;
        this.fillLight.position.set(-6, 3, -4);
        this.rimLight.color.setHex(0x7928ca);
        this.rimLight.intensity = 1.8 * mult;
        break;

      case 'studio':
      default:
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.7 * mult;
        this.keyLight.color.setHex(0xffffff);
        this.keyLight.intensity = 2.0 * mult;
        this.keyLight.position.set(6, 10, 8);
        this.fillLight.color.setHex(0xdde8ff);
        this.fillLight.intensity = 0.9 * mult;
        this.fillLight.position.set(-6, 4, -4);
        this.rimLight.color.setHex(0xffffff);
        this.rimLight.intensity = 1.2 * mult;
        break;
    }
  }
}

