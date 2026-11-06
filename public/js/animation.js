import * as THREE from 'three';

export class AnimationManager {
  constructor() {
    this.mixer = null;
    this.clips = [];
    this.actions = new Map();
    this.currentAction = null;
    this.isPlaying = true;
    this.speed = 1.0;

    this.onClipChange = null;
  }

  setup(rootObject, animations = []) {
    this.stop();
    this.actions.clear();
    this.clips = animations;

    if (!animations || animations.length === 0) {
      this.mixer = null;
      return false;
    }

    this.mixer = new THREE.AnimationMixer(rootObject);

    animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      this.actions.set(clip.name, action);
    });

    const firstClip = animations[0];
    this.playClip(firstClip.name);

    return true;
  }

  playClip(clipName) {
    const action = this.actions.get(clipName);
    if (!action) return;

    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(0.3);
    }

    action.reset().fadeIn(0.3).play();
    action.timeScale = this.speed;
    this.currentAction = action;
    this.isPlaying = true;

    if (this.onClipChange) {
      this.onClipChange(clipName);
    }
  }

  togglePlay() {
    if (!this.currentAction) return false;

    this.isPlaying = !this.isPlaying;
    this.currentAction.paused = !this.isPlaying;
    return this.isPlaying;
  }

  setSpeed(speedVal) {
    this.speed = speedVal;
    if (this.currentAction) {
      this.currentAction.timeScale = speedVal;
    }
  }

  stop() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    this.currentAction = null;
    this.isPlaying = false;
  }

  getMixer() {
    return this.mixer;
  }

  getClips() {
    return this.clips;
  }
}

