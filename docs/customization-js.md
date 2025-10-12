# Extending Functionality

This guide covers how to modify behavior and add features to your PACE game by editing the `Engine.js` file.

---

## Finding Engine.js

After exporting your game as a "Website Folder":

1. Extract the ZIP file
2. Look for `Engine.js` in the root folder
3. Open it with any code editor (VS Code, Sublime Text, etc.)

---

## Engine Structure Overview

The `Engine.js` file contains a JavaScript class with these main components:

| Component | Key Methods |
|-----------|-------------|
| **Constructor** | Initializes game state and configuration |
| **Scene Management** | `setCurrentScene()`, `setupScene()`, `navigateToScene()` |
| **Element Handling** | `renderElement()`, `handleElementClick()`, `handleElementHover()` |
| **Text System** | `showTextbox()`, `startTyping()`, `clearTextbox()` |
| **Audio System** | `playMusic()`, `playSound()`, `stopMusic()` |
| **Utility Methods** | `getResourceUrl()`, `updateCanvasRect()`, etc. |

---

## Configuration Variables

The Engine constructor sets up several configuration variables you can easily modify.

### Timing Variables

Located in the constructor around line 37-38:

```javascript
constructor(project, resources, options = {}) {
  // ... other initialization ...

  // Configuration
  this.sceneTextDelay = 300;
  this.textLetterDelay = 20;
}
```

---

#### sceneTextDelay

Controls how long to wait (in milliseconds) before showing scene text when entering a new scene.

**Default**: `300` (0.3 seconds)

```javascript
// Show text immediately
this.sceneTextDelay = 0;

// Wait 1 second before showing text
this.sceneTextDelay = 1000;

// Wait half a second
this.sceneTextDelay = 500;
```

**Use cases:**

| Delay | Best For |
|-------|----------|
| `0ms` | Instant text for fast-paced games |
| `300ms` | Default, gives players time to see the scene |
| `1000ms+` | Dramatic pauses for atmospheric moments |

---

#### textLetterDelay

Controls the speed of the typewriter effect (in milliseconds per letter).

**Default**: `20` (50 characters per second)

```javascript
// Very fast typing
this.textLetterDelay = 10;

// Slow, dramatic typing
this.textLetterDelay = 50;

// Instant text (no typewriter effect)
this.textLetterDelay = 0;
```

**Use cases:**

| Delay | Best For |
|-------|----------|
| `10ms` | Fast-paced dialogue |
| `20ms` | Default, comfortable reading speed |
| `30-50ms` | Slow, atmospheric narration |
| `0ms` | Instant text reveal (removes typewriter effect entirely) |

---

### Audio Variables

```javascript
// Music volume (default 0.5 = 50%)
this.musicRef.volume = 0.5;

// Sound effect volume (default 0.7 = 70%)
this.soundEffectRef.volume = 0.7;
```

Find these in the `playMusic()` method (around line 354) and `playSound()` method (around line 322).

**Changing default volumes:**

```javascript
// In playMusic() method
this.musicRef.volume = 0.3; // Quieter background music

// In playSound() method
this.soundEffectRef.volume = 0.9; // Louder sound effects
```

---

## Common Customizations

> Note: Many of these are rough guidelines or approaches, not usable code.

### 1. Adjust All Timing

Edit how long it takes for scene text to appear and how quickly letters appear:

```javascript
constructor(project, resources, options = {}) {
  // ... existing code ...

  // Faster for quick playthroughs
  this.sceneTextDelay = 100;
  this.textLetterDelay = 5;
}
```

---

### 2. Add Fade Transitions Between Scenes

Modify the `setCurrentScene()` method (around line 108):

```javascript
setCurrentScene(scene) {
  // Add fade out
  this.canvas.style.transition = 'opacity 0.3s ease';
  this.canvas.style.opacity = '0';

  setTimeout(() => {
    // Original scene change logic
    this.currentScene = scene;
    this.clearTextbox();
    this.setupScene();
    this.handleBackgroundMusic();
    this.scheduleSceneText();
    this.adjustCanvasSizeToAspect();

    // Fade back in
    setTimeout(() => {
      this.canvas.style.opacity = '1';
    }, 50);
  }, 300);
}
```

---

### 3. Add Element Fade-In Effect

Modify the `renderElement()` method to make elements fade in when a scene loads:

```javascript
renderElement(element) {
  const elementDiv = document.createElement('div');
  elementDiv.className = 'pace-element';
  elementDiv.id = `element-${element.id}`;

  // Add fade-in styling
  elementDiv.style.opacity = '0';
  elementDiv.style.transition = 'opacity 0.5s ease';

  // ... rest of existing rendering code ...

  this.canvas.appendChild(elementDiv);

  // Trigger fade-in after element is added to DOM
  requestAnimationFrame(() => {
    elementDiv.style.opacity = '1';
  });
}
```

---

### 4. Add Custom Element Click Sound

Make all elements play a default sound when clicked, even without a specific sound set:

```javascript
handleElementClick(element) {
  // Play element's specific sound, or a default click sound
  if (element.onClickSound) {
    this.playSound(element.onClickSound);
  } else {
    // Play default click sound (you'd need to add this audio file)
    this.playSound('/files/default-click.mp3');
  }

  // ... rest of existing click handling ...
}
```

---

### 5. Add Inventory System

Add inventory tracking to the engine:

```javascript
constructor(project, resources, options = {}) {
  // ... existing initialization ...

  // Add inventory
  this.inventory = [];
}

// Add new method after constructor
addToInventory(itemName) {
  if (!this.inventory.includes(itemName)) {
    this.inventory.push(itemName);
    console.log(`Added ${itemName} to inventory:`, this.inventory);

    // Optional: Show notification to player
    this.showTextbox(`You obtained: ${itemName}`);
  }
}

hasItem(itemName) {
  return this.inventory.includes(itemName);
}

// Modify handleElementClick to support item collection
handleElementClick(element) {
  // ... existing click handling ...

  // Add custom property support for items
  if (element.customProperties && element.customProperties.collectible) {
    this.addToInventory(element.customProperties.itemName || element.name);
  }
}
```

---

### 6. Change Text Box Click Behavior

Make clicking the textbox (not just pressing Space) advance text:

```javascript
renderTextbox() {
  // ... existing code ...

  textbox.addEventListener('click', (e) => {
    e.stopPropagation();
    this.handleTextboxClick(); // Now clicking advances text
  });

  // ... rest of rendering ...
}
```

---

### 7. Add Automatic Text Advancement

Make text continue automatically after a delay:

```javascript
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

      // Add auto-advance after text finishes
      setTimeout(() => {
        this.handleTextboxClick();
      }, 2000); // Wait 2 seconds then auto-continue
    }
  }, this.textLetterDelay);

  this.updateTextboxContinue();
}
```

---

### 8. Add Scene Visit Tracking

Track which scenes players have visited:

```javascript
constructor(project, resources, options = {}) {
  // ... existing initialization ...

  // Track visited scenes
  this.visitedScenes = new Set();
}

setCurrentScene(scene) {
  // ... existing scene change code ...

  // Track visit
  this.visitedScenes.add(scene.id);
  console.log('Visited scenes:', Array.from(this.visitedScenes));
}

hasVisitedScene(sceneId) {
  return this.visitedScenes.has(sceneId);
}
```

---

### 9. Add Custom Key Bindings

Replace Space with other keys for text advancement:

```javascript
handleTextboxKeydown(e) {
  if (!this.textboxVisible) return;

  // Support multiple keys: Space, Enter, or E
  const isAdvanceKey =
    e.code === 'Space' ||
    e.key === ' ' ||
    e.key === 'Spacebar' ||
    e.code === 'Enter' ||
    e.key === 'Enter' ||
    e.key === 'e' ||
    e.key === 'E';

  if (!isAdvanceKey) return;

  e.preventDefault();
  e.stopPropagation();
  this.handleTextboxClick();
}
```

---

## Advanced Customizations

### Add Save/Load System

Implement basic save functionality:

> Note: This only works for hosted sites, as `localStorage` is not accessible for offline html files.

```javascript
// Add to Engine class

saveGame(slotName = 'save1') {
  const saveData = {
    currentSceneId: this.currentScene?.id,
    inventory: this.inventory || [],
    visitedScenes: Array.from(this.visitedScenes || []),
    customData: this.customSaveData || {},
    timestamp: Date.now()
  };

  localStorage.setItem(`pace-save-${slotName}`, JSON.stringify(saveData));
  console.log('Game saved to slot:', slotName);
  return true;
}

loadGame(slotName = 'save1') {
  const saveDataStr = localStorage.getItem(`pace-save-${slotName}`);
  if (!saveDataStr) {
    console.log('No save found in slot:', slotName);
    return false;
  }

  const saveData = JSON.parse(saveDataStr);

  // Restore state
  this.inventory = saveData.inventory || [];
  this.visitedScenes = new Set(saveData.visitedScenes || []);
  this.customSaveData = saveData.customData || {};

  // Load scene
  if (saveData.currentSceneId) {
    const scene = this.project.scenes.find(s => s.id === saveData.currentSceneId);
    if (scene) {
      this.setCurrentScene(scene);
    }
  }

  console.log('Game loaded from slot:', slotName);
  return true;
}
```

Then you can call these methods from the browser console or add UI buttons.

---

### Add Conditional Element Visibility

Show/hide elements based on conditions:

```javascript
renderElement(element) {
  // ... existing code ...

  // Check custom visibility conditions
  if (element.customProperties?.requiresItem) {
    const hasRequiredItem = this.hasItem(element.customProperties.requiresItem);
    if (!hasRequiredItem) {
      elementDiv.style.display = 'none';
      return; // Don't add to canvas if requirement not met
    }
  }

  // ... rest of rendering ...
}
```

---

## Common Issues

**Changes not working?**
- Check browser console for JavaScript errors
- Ensure syntax is correct (commas, braces, semicolons)
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Timing feels wrong?**
- Adjust `sceneTextDelay` and `textLetterDelay`
- Test with different values to find what feels right

**Breaking the game?**
- Restore from backup, use git
- Check that you didn't accidentally delete closing braces
- Verify you're editing inside the correct method

## Next Steps

Want to customize appearance and styling? Check out [Modifying Appearance](customization-css.md) to learn about editing Engine.css.

---

## Resources

| Resource | Description |
|----------|-------------|
| [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) | Comprehensive JavaScript documentation |
| [JavaScript.info](https://javascript.info/) | Modern JavaScript tutorial |
| [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/) | Learn to debug effectively |
