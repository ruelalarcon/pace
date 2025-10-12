# PACE Editor Documentation

PACE (Point-and-Click Engine) is a visual editor for creating simple point-and-click adventure games. This guide will walk you through all the features and help you create your first interactive game.

## Getting Started

### Creating Your First Project

1. Launch PACE Editor
2. Click "New Project" on the dashboard
3. Enter a project name and click "Create"

### Understanding the Interface

The PACE Editor consists of three main areas:

- **Tree View** (left): Shows your scenes and elements in a hierarchical structure
- **Scene Canvas** (center): Visual preview of your current scene
- **Inspector** (right): Properties panel for the selected scene or element

![Editor Interface](./assets/editor_interface.png 'Editor Interface')

## Working with Scenes

Scenes are the individual screens or rooms in your game. Each scene can have a background image, music, text, and interactive elements.

### Creating Scenes

1. Click the "Add Scene" button in the floating toolbar
2. Enter a name for your scene
3. Click "Create"

### Scene Properties

You can select a scene by clicking it in the Tree View on the left of the editor.

When you select a scene, the Inspector (to the right of the editor) shows a variety of properties:

#### Basic Properties

- **Name**: The display name of your scene
- **Aspect Ratio**: Controls the dimensions of your scene (e.g., "16:9", "4:3")

#### Visual Properties

- **Background Image**: The main background image for your scene
  - Click "Choose Image" to upload an image file
  - Supported formats: JPG, PNG, GIF, WebP
  - The image will be scaled to fit the scene's aspect ratio

![Scene with Background Image](./assets/scene_with_background_image.png 'Scene with Background Image')

#### Audio Properties

- **Music**: Background music that plays when this scene is active
  - Click "Choose Music" to upload an audio file
  - Supported formats: MP3, WAV, OGG
  - Music loops automatically
  - If the same music is already playing from the previous scene, it won't restart

#### Scene Text and Navigation

- **Scene Text**: Text that appears automatically when entering the scene
  - Text appears in the main textbox after a short delay (300ms)
  - Players can press Space to fast-forward or continue

![Scene Text](./assets/scene_text_example.png 'Scene Text')

- **New Scene After Text**: The scene to navigate to after the player "continues" past the scene text's textbox
  - Only available when Scene Text is not empty
  - **Important**: If elements have text, clicking them will cancel the scene text and prevent automatic navigation

## Working with Elements

Elements are interactive objects that players can click on within a scene. They can trigger various actions like showing text, playing sounds, changing music, or navigating to other scenes.

### Creating Elements

1. Select a scene in the Tree View
2. Click "Add Element" in the floating toolbar
3. The element appears in the center of the scene

Once you have created an element, if you are currently viewing the scene containing it, you can select it by clicking on it in the Scene Canvas (the main scene viewer).

Alternatively, you can select an element by expanding a scene in the Tree View (by clicking the small arrow to the left of its name), and clicking on an element within the Tree View.

![Selecting an Element](./assets/selecting_an_element_example.gif 'Selecting an Element')

### Positioning Elements

- **Drag and Drop**: Click and drag elements directly on the scene canvas
- **Inspector Properties**: Use X Position and Y Position fields for precise placement
  - Values range from 0 to 1 (0 = left/top edge, 1 = right/bottom edge)
  - 0.5 = center of the scene
  - The position of an element corresponds to the **center** of that element.

### Element Properties

#### Basic Properties

- **Name**: Display name for organization (not shown to players)
- **X Position**: Horizontal center position (0 to 1)
- **Y Position**: Vertical center position (0 to 1)
- **Scale**: Relative height of the element (1 = full scene height)
- **Corner Radius**: Rounded corners in pixels

#### Visual Properties

- **Image**: The visual representation of your element
  - Click "Choose Image" to upload an image
  - The element's aspect ratio is automatically calculated from the image
  - Scale is automatically set to 0.2 (20% of scene height)

#### Interactive Properties

- **Destination Scene**: Scene to navigate to when clicked
  - Choose from dropdown of available scenes
  - Cannot navigate to its own scene

- **On-Click Text**: Text that appears when the element is clicked
  - If both text and destination scene are set, text appears first, then navigation to the new scene occurs after the player "continues" beyond the textbox
  - Clicking an element with text cancels any pending scene text

#### Audio Properties

- **On-Click Sound**: Sound effect that plays when clicked
  - Plays immediately when element is clicked
  - Sound volume is set to 70%
  - Each click restarts the sound

- **On-Click Music Change**: Changes background music when clicked
  - Replaces the current scene's music
  - Will not restart if the chosen music is already playing
  - Music loops automatically

#### Hover Effects

- **Highlight on Hover**: Makes the element glow when the mouse hovers over it
- **Highlight Color**: Color of the glow effect (default: white)
  - Only available when Highlight on Hover is enabled
  - Click the color picker to choose a custom color

## Text System

The text system in PACE creates an immersive dialogue experience with typewriter effects and player interaction.

### Text Behavior

- Text appears with a typewriter effect (20ms delay between letters)
- Players can press Space to fast-forward the typing
- After typing completes, players press Space again to continue
- Multiple lines (separated by newlines) create separate text bubbles, such that the player must press space each time to reveal the next line of text
- Text appears in a semi-transparent textbox at the bottom of the screen

### Text Navigation

- When scene text has a "New Scene After Text" set, navigation happens after the player "continues" past the scene text's textbox
  > It is important to note that this can be cancelled if the player, instead of continuing the scene text, presses an element which has text! It may be important to add an element that leads the player to the next scene if it important that the player makes it to the next scene.
- When element text has a "Destination Scene" set, navigation happens after the player "continues" past the element text's textbox

## Audio System

PACE includes a comprehensive audio system for creating atmospheric games.

### Music Behavior

- **Background Music**: Loops continuously while a scene is active
- **Smart Transitions**: Same music won't restart between scenes
- **User Interaction**: For the very first scene the player loads into, the music **will not play** until the player interacts with the page, by pressing a key or clicking something. This is due to a restriction modern browsers have for audio in webpages. In some cases, it may be wise to have the first scene be a "title" screen with an element that acts as a "play" button to proceed to the next scene and truly begin the game

### Sound Effects

- **One-Shot Sounds**: Play once when triggered
- **Immediate Playback**: Sounds play instantly when elements are clicked

## Game Preview

1. Click the "Preview" button in the editor header to playtest your game
   > The preview begins on the scene you were currently viewing within the editor
2. Test all interactions, text, and navigation
3. Hit the "Exit Preview" button in the page header to return to the editor

## Exporting Your Game

When your game is complete, you can export it for distribution.

### Export Options

1. Click "Export" in the editor header
2. Choose your settings:

#### Initial Scene

- Select which scene the game starts on
- Usually your opening scene or main menu

#### Export Format

**Standalone HTML**

- Single HTML file with all resources embedded
- Easy to share and distribute
- Larger file size
- Works offline immediately

**Website Folder**

- ZIP file containing index.html and separate resource files
- Smaller total filesize and smaller individual files
- Better for web hosting
- Much more efficient loading
- Easier editing of stylesheets and editing of the engine code itself

#### Optimize Resources

- **Enabled**: Compresses images and uses efficient formats
  > In particular, images are compressed to webp image files, and audio files are compressed to the opus ogg audio codec
- **Disabled**: Keeps original file formats and sizes
- Recommended: Keep enabled for smaller file sizes

### After Export

- **Standalone**: Open the HTML file in any web browser
- **Website**: Extract the ZIP and upload to a web server

---

_This documentation covers PACE Editor version 1.0. Features and interface may vary in different versions._
