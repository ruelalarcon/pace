/**
 * PACE Game Engine - Standalone JavaScript implementation
 * Can be used both in React components and standalone HTML exports
 */

class Engine {
    constructor(project, resources, options = {}) {
        this.project = project;
        this.resources = resources || {};
        this.canvasId = options.canvasId || 'pace-canvas';
        this.serverUrl = options.serverUrl || 'http://localhost:3001';

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
        this.audioRef = null;
        this.typingInterval = null;
        this.pendingNavigation = null;
        this.sceneTextTimer = null;

        // Configuration
        this.sceneTextDelay = 300;
        this.textLetterDelay = 10;

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
            this.setCurrentScene(this.project.scenes[0]);
        }

        // Set up resize observer
        const resizeObserver = new ResizeObserver(() => {
            this.updateCanvasRect();
        });
        resizeObserver.observe(this.canvas);
        this.updateCanvasRect();
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
    }

    setupScene() {
        if (!this.currentScene) return;

        // Set aspect ratio
        const aspectRatio = this.getAspectRatio();
        this.canvas.style.aspectRatio = aspectRatio;

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

        this.currentScene.elements.forEach(element => {
            this.renderElement(element);
        });
    }

    getResourceUrl(resourcePath) {
        // If we have a base64 resource map (for exports), use it
        if (this.resources[resourcePath]) {
            return this.resources[resourcePath];
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
        const elementWidth = (element.scale * element.aspectRatio) / sceneAspectRatio;

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
        elementDiv.addEventListener('click', () => this.handleElementClick(element));
        elementDiv.addEventListener('mouseenter', () => this.handleElementHover(element, true));
        elementDiv.addEventListener('mouseleave', () => this.handleElementHover(element, false));

        this.canvas.appendChild(elementDiv);
    }

    handleElementClick(element) {
        // Play click sound
        if (element.onClickSound) {
            const audio = new Audio(this.getResourceUrl(element.onClickSound));
            audio.volume = 0.7;
            audio.play().catch(console.error);
        }

        // Change music
        if (element.onClickMusicChange) {
            const newMusicUrl = this.getResourceUrl(element.onClickMusicChange);
            if (!this.audioRef || this.audioRef.src !== newMusicUrl) {
                if (this.audioRef) {
                    this.audioRef.pause();
                }
                this.audioRef = new Audio(newMusicUrl);
                this.audioRef.loop = true;
                this.audioRef.volume = 0.5;
                this.audioRef.play().catch(console.error);
            }
        }

        this.pendingNavigation = null;

        const hasText = typeof element.onClickText === 'string' && element.onClickText.trim().length > 0;

        if (element.destinationScene) {
            if (hasText) {
                this.pendingNavigation = element.destinationScene;
                this.showTextbox(element.onClickText);
            } else {
                this.navigateToScene(element.destinationScene);
            }
        } else if (hasText) {
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
        const targetScene = this.project.scenes.find(scene => scene.id === sceneId);
        if (targetScene) {
            this.setCurrentScene(targetScene);
        }
    }

    handleBackgroundMusic() {
        if (!this.currentScene) return;

        const newMusicUrl = this.currentScene.music
            ? this.getResourceUrl(this.currentScene.music) : null;

        if (newMusicUrl) {
            if (this.audioRef && this.audioRef.src === newMusicUrl && !this.audioRef.paused) {
                return;
            }

            if (this.audioRef) {
                this.audioRef.pause();
            }

            this.audioRef = new Audio(newMusicUrl);
            this.audioRef.loop = true;
            this.audioRef.volume = 0.5;
            this.audioRef.play().catch(console.error);
        } else if (this.audioRef) {
            this.audioRef.pause();
            this.audioRef = null;
        }
    }

    scheduleSceneText() {
        if (this.sceneTextTimer) {
            clearTimeout(this.sceneTextTimer);
            this.sceneTextTimer = null;
        }

        if (this.currentScene && this.currentScene.sceneText) {
            this.pendingNavigation = null;
            this.sceneTextTimer = setTimeout(() => {
                this.showTextbox(this.currentScene.sceneText);
                this.sceneTextTimer = null;
            }, this.sceneTextDelay);
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

        const lines = text.split('\n').filter(l => l.trim() !== '');
        if (lines.length === 0) return;

        this.textLines = lines;
        this.currentLineIndex = 0;
        this.textboxContent = lines[0];
        this.startTyping(lines[0]);
        this.textboxVisible = true;
        this.renderTextbox();
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
            this.handleTextboxClick();
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
            const displayText = currentLine.substring(0, this.textboxIndex) || '\u00A0';
            textElement.textContent = displayText;
        }
    }

    updateTextboxContinue() {
        const continueElement = document.getElementById('textbox-continue');
        if (continueElement) {
            continueElement.textContent = this.isTyping ? 'Click to Fast Forward' : 'Click to Continue';
        }
    }

    handleTextboxClick() {
        if (this.isTyping) {
            if (this.typingInterval) {
                clearInterval(this.typingInterval);
            }
            const fullLine = this.textLines[this.currentLineIndex] || this.textboxContent;
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

    // Cleanup method for React components
    destroy() {
        if (this.audioRef) {
            this.audioRef.pause();
        }
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        if (this.sceneTextTimer) {
            clearTimeout(this.sceneTextTimer);
        }
    }
}

// Export for both ES modules and global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
} else if (typeof window !== 'undefined') {
    window.Engine = Engine;
}
