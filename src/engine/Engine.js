/**
 * PACE Game Engine - Standalone JavaScript implementation
 * Can be used both in React components and HTML exports
 */

class Engine {
  constructor(project, resources, options = {}) {
    this.project = project;
    this.resources = resources || {};
    this.canvasId = options.canvasId || 'pace-canvas';
    this.serverUrl = options.serverUrl || 'http://localhost:3001';
    this.initialSceneId = options.initialSceneId || null;

    // Game state
    this.currentScene = null;
    this.textboxVisible = false;
    this.textboxContent = '';
    this.textboxIndex = 0;
    this.isTyping = false;
    this.textLines = [];
    this.currentLineIndex = 0;
    this.hoveredElementId = null;
    this.canvas = null;
    this.canvasRect = null;
    this.typingInterval = null;
    this.pendingNavigation = null;
    this.sceneTextTimer = null;

    // Audio handling
    this.musicRef = null;
    this.soundEffectRef = null;
    this.currentMusicPath = null;
    this.userHasInteracted = false;
    this.queuedMusicPath = null;

    // Configuration
    this.sceneTextDelay = 300;
    this.textLetterDelay = 20;

    this.init();
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) {
      console.error(`Canvas element with id "${this.canvasId}" not found`);
      return;
    }

    // Set up initial scene
    if (this.project.scenes && this.project.scenes.length > 0) {
      let initialScene = this.project.scenes[0];

      // Use specific initial scene if provided
      if (this.initialSceneId) {
        const foundScene = this.project.scenes.find(
          (scene) => scene.id === this.initialSceneId,
        );
        if (foundScene) {
          initialScene = foundScene;
        }
      }

      this.setCurrentScene(initialScene);
    }

    // Set up resize observer
    this.canvasResizeObserver = new ResizeObserver(() => {
      this.updateCanvasRect();
      this.adjustCanvasSizeToAspect();
    });
    this.canvasResizeObserver.observe(this.canvas);

    if (this.canvas.parentElement) {
      this.parentResizeObserver = new ResizeObserver(() => {
        this.updateCanvasRect();
        this.adjustCanvasSizeToAspect();
      });
      this.parentResizeObserver.observe(this.canvas.parentElement);
    }
    this.updateCanvasRect();
    this.adjustCanvasSizeToAspect();

    this.boundHandleInteraction = this.handleFirstInteraction.bind(this);
    window.addEventListener('click', this.boundHandleInteraction, {
      once: true,
    });
    window.addEventListener('keydown', this.boundHandleInteraction, {
      once: true,
    });
  }

  handleFirstInteraction() {
    if (this.userHasInteracted) return;
    this.userHasInteracted = true;

    // Play queued music if any
    if (this.queuedMusicPath) {
      this.playMusic(this.queuedMusicPath);
      this.queuedMusicPath = null;
    }
  }

  updateCanvasRect() {
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  setCurrentScene(scene) {
    this.currentScene = scene;
    this.clearTextbox();
    this.setupScene();
    this.handleBackgroundMusic();
    this.scheduleSceneText();
    this.adjustCanvasSizeToAspect();
  }

  setupScene() {
    if (!this.currentScene) return;

    // Set aspect ratio
    const aspectRatio = this.getAspectRatio();
    this.canvas.style.aspectRatio = aspectRatio;

    // Ensure canvas sizing reflects desired aspect before measuring/rendering
    this.adjustCanvasSizeToAspect();
    this.updateCanvasRect();

    // Set background image
    if (this.currentScene.backgroundImage) {
      const bgUrl = this.getResourceUrl(this.currentScene.backgroundImage);
      this.canvas.style.backgroundImage = `url(${bgUrl})`;
    } else {
      this.canvas.style.backgroundImage = '';
    }

    // Clear and render elements
    this.canvas.innerHTML = '';
    if (!this.currentScene.backgroundImage) {
      const placeholder = document.createElement('div');
      placeholder.className = 'pace-canvas-placeholder';
      placeholder.innerHTML = '<p>No background image</p>';
      this.canvas.appendChild(placeholder);
    }

    this.currentScene.elements.forEach((element) => {
      this.renderElement(element);
    });
  }

  adjustCanvasSizeToAspect() {
    if (!this.canvas || !this.canvas.parentElement) return;

    const parentRect = this.canvas.parentElement.getBoundingClientRect();
    const availableWidth = parentRect.width;
    const availableHeight = parentRect.height;
    if (availableWidth === 0 || availableHeight === 0) return;

    const desiredAspect = this.getAspectRatio();
    const containerAspect = availableWidth / availableHeight;

    if (containerAspect > desiredAspect) {
      // Container is wider than desired; constrain by height
      this.canvas.style.height = '100%';
      this.canvas.style.width = 'auto';
    } else {
      // Container is narrower/taller; constrain by width
      this.canvas.style.width = '100%';
      this.canvas.style.height = 'auto';
    }
  }

  getResourceUrl(resourcePath) {
    // If we have a base64 resource map (for standalone exports), use it
    if (this.resources[resourcePath]) {
      return this.resources[resourcePath];
    }

    // For website exports, extract just the filename and use with serverUrl
    if (this.serverUrl && this.serverUrl.startsWith('./')) {
      const fileName = resourcePath.split('/').pop();
      return `${this.serverUrl}/${fileName}`;
    }

    // Otherwise, use server URL (for preview)
    return `${this.serverUrl}${resourcePath}`;
  }

  renderElement(element) {
    const elementDiv = document.createElement('div');
    elementDiv.className = 'pace-element';
    elementDiv.id = `element-${element.id}`;

    if (!this.canvasRect) {
      this.updateCanvasRect();
    }

    const sceneAspectRatio = this.canvasRect.width / this.canvasRect.height;
    const elementHeight = element.scale;
    const elementWidth =
      (element.scale * element.aspectRatio) / sceneAspectRatio;

    const width = `${elementWidth * 100}%`;
    const height = `${elementHeight * 100}%`;

    elementDiv.style.left = `calc(${element.x * 100}% - (${width}) / 2)`;
    elementDiv.style.top = `calc(${element.y * 100}% - (${height}) / 2)`;
    elementDiv.style.width = width;
    elementDiv.style.height = height;
    elementDiv.style.cursor = 'pointer';

    if (element.cornerRadius) {
      elementDiv.style.borderRadius = `${element.cornerRadius}px`;
    }

    // Add image or placeholder
    if (element.image) {
      const img = document.createElement('img');
      img.src = this.getResourceUrl(element.image);
      img.alt = element.name;
      img.className = 'pace-element-image';
      img.draggable = false;
      elementDiv.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'pace-element-placeholder';
      elementDiv.appendChild(placeholder);
    }

    // Add event listeners
    elementDiv.addEventListener('click', () =>
      this.handleElementClick(element),
    );
    elementDiv.addEventListener('mouseenter', () =>
      this.handleElementHover(element, true),
    );
    elementDiv.addEventListener('mouseleave', () =>
      this.handleElementHover(element, false),
    );

    this.canvas.appendChild(elementDiv);
  }

  handleElementClick(element) {
    if (element.onClickSound) {
      this.playSound(element.onClickSound);
    }

    if (element.onClickMusicChange) {
      this.playMusic(element.onClickMusicChange);
    }

    const hasText =
      typeof element.onClickText === 'string' &&
      element.onClickText.trim().length > 0;

    // Cancel any pending scene text when element is clicked
    if (this.sceneTextTimer) {
      clearTimeout(this.sceneTextTimer);
      this.sceneTextTimer = null;
    }

    // Clear any existing textbox (including scene text) before showing new text
    if (hasText || element.destinationScene) {
      this.clearTextbox();
    }

    if (element.destinationScene) {
      if (hasText) {
        this.pendingNavigation = element.destinationScene;
        this.showTextbox(element.onClickText);
      } else {
        this.navigateToScene(element.destinationScene);
      }
    } else if (hasText) {
      // Clear any scene text navigation when showing element text only
      this.pendingNavigation = null;
      this.showTextbox(element.onClickText);
    }
  }

  handleElementHover(element, isHovered) {
    const elementDiv = document.getElementById(`element-${element.id}`);
    if (!elementDiv) return;

    if (isHovered && element.highlightOnHover) {
      elementDiv.style.filter = `drop-shadow(0 0 8px ${element.highlightColor || '#ffffff'})`;
      elementDiv.style.zIndex = '30';
    } else {
      elementDiv.style.filter = '';
      elementDiv.style.zIndex = '10';
    }
  }

  navigateToScene(sceneId) {
    const targetScene = this.project.scenes.find(
      (scene) => scene.id === sceneId,
    );
    if (targetScene) {
      this.pendingNavigation = null;
      this.setCurrentScene(targetScene);
    }
  }

  handleBackgroundMusic() {
    if (!this.currentScene) return;

    if (this.currentScene.music) {
      this.playMusic(this.currentScene.music);
    } else {
      this.stopMusic();
    }
  }

  playSound(soundPath) {
    if (!soundPath) return;

    if (this.soundEffectRef) {
      this.soundEffectRef.pause();
      this.soundEffectRef.currentTime = 0;
    }
    this.soundEffectRef = new Audio(this.getResourceUrl(soundPath));
    this.soundEffectRef.volume = 0.7;
    this.soundEffectRef.play().catch(console.error);
  }

  playMusic(musicPath) {
    if (!musicPath) return;

    if (!this.userHasInteracted) {
      this.queuedMusicPath = musicPath;
      return;
    }

    const newMusicUrl = this.getResourceUrl(musicPath);

    // Don't restart if same music is already playing
    if (
      this.currentMusicPath === musicPath &&
      this.musicRef &&
      !this.musicRef.paused
    ) {
      return;
    }

    // Stop current music
    if (this.musicRef) {
      this.musicRef.pause();
      this.musicRef.currentTime = 0;
    }

    // Start new music
    this.musicRef = new Audio(newMusicUrl);
    this.musicRef.loop = true;
    this.musicRef.volume = 0.5;
    this.currentMusicPath = musicPath;
    this.musicRef.play().catch(console.error);
  }

  stopMusic() {
    if (this.musicRef) {
      this.musicRef.pause();
      this.musicRef.currentTime = 0;
      this.musicRef = null;
    }
    this.currentMusicPath = null;
  }

  scheduleSceneText() {
    if (this.sceneTextTimer) {
      clearTimeout(this.sceneTextTimer);
      this.sceneTextTimer = null;
    }

    if (this.currentScene && this.currentScene.sceneText) {
      // Capture the scene text and navigation at scheduling time
      const sceneText = this.currentScene.sceneText;
      const navigationTarget = this.currentScene.newSceneAfterText || null;

      this.sceneTextTimer = setTimeout(() => {
        // Set pending navigation right before showing textbox
        this.pendingNavigation = navigationTarget;
        this.showTextbox(sceneText);
        this.sceneTextTimer = null;
      }, this.sceneTextDelay);
    }
  }

  renderTextbox() {
    // Always recreate the textbox to ensure fresh listeners and markup
    const existing = document.querySelector('.pace-textbox');
    if (existing && existing.parentElement) {
      existing.parentElement.removeChild(existing);
    }

    const textbox = document.createElement('div');
    textbox.className = 'pace-textbox';
    textbox.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    this.canvas.appendChild(textbox);

    textbox.innerHTML = `
            <div class="pace-textbox-content">
                <p class="pace-textbox-text" id="textbox-text"></p>
            </div>
            <div class="pace-textbox-continue">
                <span id="textbox-continue"></span>
            </div>
        `;

    this.updateTextboxText();
    this.updateTextboxContinue();
  }

  updateTextboxText() {
    const textElement = document.getElementById('textbox-text');
    if (textElement) {
      const currentLine = this.textLines[this.currentLineIndex] || '';
      const displayText =
        currentLine.substring(0, this.textboxIndex) || '\u00A0';
      textElement.textContent = displayText;
    }
  }

  updateTextboxContinue() {
    const continueElement = document.getElementById('textbox-continue');
    if (continueElement) {
      const action = this.isTyping ? 'Fast Forward' : 'Continue';
      continueElement.innerHTML = `Press <kbd class="pace-key">Space</kbd> to ${action}`;
    }
  }

  handleTextboxKeydown(e) {
    if (!this.textboxVisible) return;
    const isSpace = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
    if (!isSpace) return;
    e.preventDefault();
    e.stopPropagation();
    this.handleTextboxClick();
  }

  handleTextboxClick() {
    if (this.isTyping) {
      if (this.typingInterval) {
        clearInterval(this.typingInterval);
      }
      const fullLine =
        this.textLines[this.currentLineIndex] || this.textboxContent;
      this.textboxIndex = fullLine.length;
      this.isTyping = false;
      this.updateTextboxText();
      this.updateTextboxContinue();
    } else {
      const nextIndex = this.currentLineIndex + 1;
      if (nextIndex < this.textLines.length) {
        this.currentLineIndex = nextIndex;
        this.textboxContent = this.textLines[nextIndex];
        this.startTyping(this.textLines[nextIndex]);
      } else {
        this.clearTextbox();
        if (this.pendingNavigation) {
          this.navigateToScene(this.pendingNavigation);
          this.pendingNavigation = null;
        }
      }
    }
  }

  showTextbox(text) {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    if (this.sceneTextTimer) {
      clearTimeout(this.sceneTextTimer);
      this.sceneTextTimer = null;
    }

    const lines = text.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) return;

    this.textLines = lines;
    this.currentLineIndex = 0;
    this.textboxContent = lines[0];
    this.startTyping(lines[0]);
    this.textboxVisible = true;
    this.renderTextbox();

    // Listen for Space to progress
    this.boundHandleTextboxKeydown = this.handleTextboxKeydown.bind(this);
    window.addEventListener('keydown', this.boundHandleTextboxKeydown);
  }

  startTyping(line) {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    this.textboxIndex = 0;
    this.isTyping = true;

    let index = 0;
    this.typingInterval = setInterval(() => {
      index++;
      this.textboxIndex = index;
      this.updateTextboxText();

      if (index >= line.length) {
        this.isTyping = false;
        clearInterval(this.typingInterval);
        this.updateTextboxContinue();
      }
    }, this.textLetterDelay);

    this.updateTextboxContinue();
  }

  clearTextbox() {
    const textbox = document.querySelector('.pace-textbox');
    if (textbox) {
      textbox.remove();
    }

    this.textboxVisible = false;
    this.textboxContent = '';
    this.textboxIndex = 0;
    this.isTyping = false;
    this.textLines = [];
    this.currentLineIndex = 0;

    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    if (this.boundHandleTextboxKeydown) {
      window.removeEventListener('keydown', this.boundHandleTextboxKeydown);
      this.boundHandleTextboxKeydown = null;
    }
  }

  getAspectRatio() {
    if (this.currentScene && this.currentScene.aspectRatio) {
      const parts = this.currentScene.aspectRatio.split(':');
      if (parts.length === 2) {
        const width = parseFloat(parts[0]);
        const height = parseFloat(parts[1]);
        if (!isNaN(width) && !isNaN(height) && height > 0) {
          return width / height;
        }
      }
    }
    return 16 / 9;
  }

  // Stop all audio without destroying the engine instance
  stopAudio() {
    this.stopMusic();
    if (this.soundEffectRef) {
      this.soundEffectRef.pause();
      this.soundEffectRef.currentTime = 0;
      this.soundEffectRef = null;
    }
  }

  // Cleanup method for React components
  destroy() {
    this.stopAudio();
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (this.sceneTextTimer) {
      clearTimeout(this.sceneTextTimer);
    }
    if (this.canvasResizeObserver) {
      this.canvasResizeObserver.disconnect();
    }
    if (this.parentResizeObserver) {
      this.parentResizeObserver.disconnect();
    }

    window.removeEventListener('click', this.boundHandleInteraction);
    window.removeEventListener('keydown', this.boundHandleInteraction);

    if (this.boundHandleTextboxKeydown) {
      window.removeEventListener('keydown', this.boundHandleTextboxKeydown);
      this.boundHandleTextboxKeydown = null;
    }
  }
}

// Global export - `export` line is removed when used in an exported game
export default Engine;
if (typeof window !== 'undefined') {
  window.Engine = Engine;
}
