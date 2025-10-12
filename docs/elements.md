# Working with Elements

Elements are interactive objects that players can click on within a scene. They can trigger various actions like showing text, playing sounds, changing music, or navigating to other scenes.

---

## Creating Elements

1. Select a scene in the Tree View
2. Click "Add Element" in the floating toolbar
3. The element appears in the center of the scene

---

## Selecting Elements

Once you have created an element, you can select it in two ways:

- **In Scene Canvas**: If you're viewing the scene containing it, click on it directly in the main scene viewer
- **In Tree View**: Expand a scene in the Tree View (by clicking the small arrow to the left of its name), then click on an element

![Selecting an Element](./assets/selecting_an_element_example.gif 'Selecting an Element')

---

## Positioning Elements

### Drag and Drop

Click and drag elements directly on the scene canvas for quick positioning.

### Inspector Properties

Use X Position and Y Position fields for precise placement:

| Value | Position |
|-------|----------|
| 0 | Left/top edge |
| 0.5 | Center of the scene |
| 1 | Right/bottom edge |

?> **Note**: The position of an element corresponds to the **center** of that element, not its edge.

---

## Element Properties

### Basic Properties

| Property | Description | Range/Type |
|----------|-------------|------------|
| **Name** | Display name for organization (not shown to players) | Text |
| **X Position** | Horizontal center position | 0 to 1 |
| **Y Position** | Vertical center position | 0 to 1 |
| **Scale** | Relative height of the element | 0 to 1+ (1 = full scene height) |
| **Corner Radius** | Rounded corners | Pixels |

---

### Visual Properties

#### Image

The visual representation of your element.

- Click "Choose Image" to upload an image
- The element's aspect ratio is automatically calculated from the image
- Scale is automatically set to 0.2 (20% of scene height)

---

### Interactive Properties

#### Destination Scene

Scene to navigate to when clicked.

- Choose from dropdown of available scenes
- Cannot navigate to its own scene

#### On-Click Text

Text that appears when the element is clicked.

- If both text and destination scene are set, text appears first, then navigation to the new scene occurs after the player "continues" beyond the textbox
- Clicking an element with text cancels any pending scene text

---

### Audio Properties

#### On-Click Sound

Sound effect that plays when clicked.

**Behavior:**
- Plays immediately when element is clicked
- Sound volume is set to 70%
- Each click restarts the sound

#### On-Click Music Change

Changes background music when clicked.

**Behavior:**
- Replaces the current scene's music
- Will not restart if the chosen music is already playing
- Music loops automatically

---

### Hover Effects

#### Highlight on Hover

Makes the element glow when the mouse hovers over it.

#### Highlight Color

Color of the glow effect (default: white).

- Only available when Highlight on Hover is enabled
- Click the color picker to choose a custom color

---

## Tips

- Use hover highlights to make elements more discoverable
- Combine text and destination scenes for narrative flow
- Position elements carefully using the inspector for pixel-perfect placement
- Test element interactions in preview mode before exporting
