# Working with Scenes

Scenes are the individual screens or rooms in your game. Each scene can have a background image, music, text, and interactive elements.

---

## Creating Scenes

1. Click the "Add Scene" button in the floating toolbar
2. Enter a name for your scene
3. Click "Create"

---

## Selecting Scenes

You can select a scene by clicking it in the Tree View on the left of the editor. When you select a scene, the Inspector (to the right of the editor) shows its properties.

---

## Scene Properties

### Basic Properties

| Property | Description |
|----------|-------------|
| **Name** | The display name of your scene |
| **Aspect Ratio** | Controls the dimensions of your scene (e.g., "16:9", "4:3") |

Note that keeping the same aspect ratio across all scenes creates a more consistent player experience.

---

### Visual Properties

#### Background Image

The main background image for your scene.

- Click "Choose Image" to upload an image file
- **Supported formats:** JPG, PNG, GIF, WebP
- The image will be scaled to fit the scene's aspect ratio

![Scene with Background Image](./assets/scene_with_background_image.png 'Scene with Background Image')

---

### Audio Properties

#### Music

Background music that plays when this scene is active.

- Click "Choose Music" to upload an audio file
- **Supported formats:** MP3, WAV, OGG
- Music loops automatically
- If the same music is already playing from the previous scene, it won't restart

> **Smart Transitions:** PACE won't restart music if it's already playing, creating seamless transitions between scenes with the same soundtrack.

---

### Scene Text and Navigation

#### Scene Text

Text that appears automatically when entering the scene.

- Text appears in the main textbox after a short delay (300ms)
- Players can press Space to fast-forward or continue

![Scene Text](./assets/scene_text_example.png 'Scene Text')

#### New Scene After Text

The scene to navigate to after the player "continues" past the scene text's textbox.

- Only available when Scene Text is not empty
- Creates automatic scene transitions after narrative text

> **Important:** If elements have text, clicking them will cancel the scene text and prevent automatic navigation. Consider this when designing your scene flow.

---

## Common Scene Patterns

### Narrative Cutscene

Use **Scene Text** with **New Scene After Text** to create non-interactive story moments:

```
Scene: "opening_cutscene"
├─ Background Image: dramatic_sky.jpg
├─ Music: ambient_music.mp3
├─ Scene Text: "Long ago, in a distant land..."
└─ New Scene After Text: "main_menu"
```

### Interactive Room

Create explorable spaces with elements but no auto-navigation:

```
Scene: "bedroom"
├─ Background Image: bedroom.jpg
├─ Music: calm_music.mp3
├─ Scene Text: (empty)
└─ Elements: [door, desk, window, bed]
```

### Transition Scene

Quick scenes that bridge two locations:

```
Scene: "walking_transition"
├─ Background Image: path.jpg
├─ Music: (same as previous scene)
├─ Scene Text: "You walk down the forest path..."
└─ New Scene After Text: "forest_clearing"
```

---

**Next:** Learn how to add [interactive elements](elements.md) to your scenes!
