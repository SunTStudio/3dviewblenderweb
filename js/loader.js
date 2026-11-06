import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();

    // Draco loader support for compressed meshes
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  // Load model from a local File object (File Picker or Drag-and-Drop)
  loadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      const filename = file.name.toLowerCase();
      if (!filename.endsWith('.glb') && !filename.endsWith('.gltf')) {
        reject(new Error('Format file tidak didukung. Harap gunakan file .glb atau .gltf.'));
        return;
      }

      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = (e.loaded / e.total) * 100;
          onProgress(percent);
        }
      };

      reader.onload = (e) => {
        const contents = e.target.result;
        this.loader.parse(
          contents,
          '',
          (gltf) => {
            const stats = this.extractModelStats(gltf.scene);
            stats.name = file.name;
            resolve({
              scene: gltf.scene,
              animations: gltf.animations || [],
              stats: stats
            });
          },
          (error) => {
            reject(new Error('Gagal mem-parsing file 3D: ' + error.message));
          }
        );
      };

      reader.onerror = () => {
        reject(new Error('Gagal membaca file dari sistem.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Load model from URL
  loadUrl(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const stats = this.extractModelStats(gltf.scene);
          stats.name = url.split('/').pop().split('?')[0];
          resolve({
            scene: gltf.scene,
            animations: gltf.animations || [],
            stats: stats
          });
        },
        (xhr) => {
          if (xhr.lengthComputable && onProgress) {
            const percent = (xhr.loaded / xhr.total) * 100;
            onProgress(percent);
          }
        },
        (error) => {
          reject(new Error('Gagal memuat model dari URL: ' + error.message));
        }
      );
    });
  }

  // Extract polygon count, vertex count, and mesh count
  extractModelStats(object) {
    let triangles = 0;
    let vertices = 0;
    let meshes = 0;

    object.traverse((child) => {
      if (child.isMesh && child.geometry) {
        meshes++;
        const geo = child.geometry;
        if (geo.index) {
          triangles += geo.index.count / 3;
        } else if (geo.attributes.position) {
          triangles += geo.attributes.position.count / 3;
        }
        if (geo.attributes.position) {
          vertices += geo.attributes.position.count;
        }
      }
    });

    return {
      triangles: Math.round(triangles),
      vertices: vertices,
      meshes: meshes
    };
  }

  // ========================================================
  // Procedural 3D Demo Models (Immediate offline availability)
  // ========================================================

  createSciFiDrone() {
    const group = new THREE.Group();
    group.name = 'SciFi_Drone';

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x22252e,
      roughness: 0.3,
      metalness: 0.85
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.9
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.0,
      roughness: 0.1
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.9
    });

    // Central Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMesh = new THREE.Mesh(coreGeo, metalMat);
    coreMesh.position.y = 1.6;
    group.add(coreMesh);

    // Glowing Reactor Ring
    const ringGeo = new THREE.TorusGeometry(0.85, 0.08, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, glowMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 1.6;
    group.add(ringMesh);

    // Drone Armor Plates (Top & Bottom Caps)
    const capGeo = new THREE.ConeGeometry(0.7, 0.4, 6);
    const topCap = new THREE.Mesh(capGeo, accentMat);
    topCap.position.y = 2.4;
    group.add(topCap);

    const botCap = new THREE.Mesh(capGeo, accentMat);
    botCap.rotation.x = Math.PI;
    botCap.position.y = 0.8;
    group.add(botCap);

    // 4 Quad Thruster Arms
    const armGeo = new THREE.BoxGeometry(0.12, 0.12, 1.6);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(Math.cos(angle) * 1.1, 1.6, Math.sin(angle) * 1.1);
      arm.rotation.y = angle;
      group.add(arm);

      // Thruster pod
      const podGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.4, 24);
      const pod = new THREE.Mesh(podGeo, goldMat);
      pod.position.set(Math.cos(angle) * 1.9, 1.6, Math.sin(angle) * 1.9);
      group.add(pod);

      // Thruster Flame/Glow
      const flameGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
      const flame = new THREE.Mesh(flameGeo, glowMat);
      flame.rotation.x = Math.PI;
      flame.position.set(Math.cos(angle) * 1.9, 1.25, Math.sin(angle) * 1.9);
      group.add(flame);
    }

    const stats = this.extractModelStats(group);
    stats.name = 'Sci-Fi Drone (Demo)';

    return {
      scene: group,
      animations: [],
      stats: stats
    };
  }

  createMechCube() {
    const group = new THREE.Group();
    group.name = 'Mech_Core_Cube';

    // Materials
    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.35,
      metalness: 0.8
    });

    const goldTrim = new THREE.MeshStandardMaterial({
      color: 0xdfa025,
      roughness: 0.2,
      metalness: 0.95
    });

    const rubyCore = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0044,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.1
    });

    // Outer Cage Cubes
    const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const box = new THREE.Mesh(boxGeo, darkMetal);
    box.position.y = 1.5;
    group.add(box);

    // Beveled frame
    const frameGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 4);
    const frame1 = new THREE.Mesh(frameGeo, goldTrim);
    frame1.position.y = 1.5;
    group.add(frame1);

    const frame2 = frame1.clone();
    frame2.rotation.x = Math.PI / 2;
    group.add(frame2);

    const frame3 = frame1.clone();
    frame3.rotation.y = Math.PI / 2;
    group.add(frame3);

    // Floating internal core
    const coreGeo = new THREE.OctahedronGeometry(0.65, 0);
    const core = new THREE.Mesh(coreGeo, rubyCore);
    core.position.y = 1.5;
    group.add(core);

    const stats = this.extractModelStats(group);
    stats.name = 'Mech Core Cube (Demo)';

    return {
      scene: group,
      animations: [],
      stats: stats
    };
  }
}

