# Modifying Appearance

This guide covers how to customize the visual style of your PACE game by editing the `Engine.css` file.

---

## Finding Engine.css

After exporting your game as a "Website Folder":

1. Extract the ZIP file
2. Look for `Engine.css` in the root folder
3. Open it with any text editor or code editor

---

## CSS Structure Overview

The `Engine.css` file is organized into sections:

| Section                | Purpose                         |
| ---------------------- | ------------------------------- |
| **Body and Container** | Overall game layout             |
| **Canvas**             | The main game scene area        |
| **Elements**           | Interactive objects             |
| **Textbox**            | Dialogue and text display       |
| **Animations**         | Keyframe animations             |
| **Responsive Design**  | Mobile and accessibility styles |

---

## Customizing the Textbox

The textbox is the most commonly customized element. Here's the default styling:

```css
.pace-textbox {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-image: linear-gradient(
    rgba(44 44 44 / 0.47),
    rgba(24 24 24 / 0.48)
  );
  border: 5px solid #93b6df;
  border-radius: var(--radius-md);
  padding: 20px 24px 16px 24px;
  box-shadow: 0 0 10px 0 rgba(147, 182, 223, 0.5);
  backdrop-filter: blur(3px);
}
```

---

### Change Position

Move the textbox to different locations:

```css
/* Top of screen */
.pace-textbox {
  top: 20px;
  bottom: auto;
}

/* Centered horizontally */
.pace-textbox {
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 800px;
}

/* Right side */
.pace-textbox {
  left: auto;
  right: 20px;
  width: 400px;
}
```

---

### Change Colors

Customize the textbox appearance:

```css
/* Solid dark background */
.pace-textbox {
  background: #000000;
  border: 5px solid #ffffff;
}

/* Transparent with border */
.pace-textbox {
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid #ff6b6b;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

/* No blur effect */
.pace-textbox {
  backdrop-filter: none;
}
```

---

### Change Size and Padding

Adjust spacing and dimensions:

```css
/* More compact */
.pace-textbox {
  padding: 12px 16px;
}

/* Larger padding */
.pace-textbox {
  padding: 30px 40px;
}

/* Fixed width */
.pace-textbox {
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
}
```

---

## Customizing Text Style

The text inside the textbox is controlled by `.pace-textbox-text`:

```css
.pace-textbox-text {
  font-size: 30px;
  font-family:
    'MS Gothic',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    sans-serif;
  color: var(--text);
  text-shadow: /* ... */;
  line-height: 1.5;
}
```

---

### Change Font

Replace the font family:

```css
/* Modern sans-serif */
.pace-textbox-text {
  font-family: 'Arial', 'Helvetica', sans-serif;
}

/* Serif font */
.pace-textbox-text {
  font-family: 'Georgia', 'Times New Roman', serif;
}

/* Pixel/retro font (requires loading the font first - see below) */
.pace-textbox-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px; /* Pixel fonts need smaller sizes */
}

/* Handwriting style */
.pace-textbox-text {
  font-family: 'Comic Sans MS', cursive;
}
```

---

### Using Custom Fonts

To use fonts that aren't installed on every computer (like custom or downloadable fonts), you need to include the font files with your game and load them using `@font-face`.

#### Step 1: Get Your Font Files

Download a font from a website like:

| Source                                                | Description                      |
| ----------------------------------------------------- | -------------------------------- |
| [Google Fonts](https://fonts.google.com/)             | Free, open-source fonts          |
| [Font Squirrel](https://www.fontsquirrel.com/)        | Free fonts for commercial use    |
| [DaFont](https://www.dafont.com/)                     | Large collection, check licenses |
| [itch.io](https://itch.io/game-assets/free/tag-fonts) | Game-specific fonts              |

Font files come in different formats:

| Format    | Extension | Description                           |
| --------- | --------- | ------------------------------------- |
| **WOFF2** | `.woff2`  | Modern, best compression, recommended |
| **WOFF**  | `.woff`   | Good browser support                  |
| **TTF**   | `.ttf`    | TrueType Font, widely supported       |
| **OTF**   | `.otf`    | OpenType Font, similar to TTF         |

?> **Recommendation**: Use WOFF2 for best performance, with WOFF or TTF as fallback.

#### Step 2: Add Font Files to Your Game Folder

1. After exporting your game, create a `fonts` folder in the same directory as `Engine.css`
2. Copy your font files into this folder
3. Your structure should look like:
   ```
   your-game/
   ├── Engine.js
   ├── Engine.css
   ├── index.html
   └── fonts/
       ├── MyCustomFont.woff2
       └── MyCustomFont.woff
   ```

#### Step 3: Load the Font in Engine.css

Add an `@font-face` rule at the **very top** of your `Engine.css` file, before any other styles:

**For WOFF2 files:**

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('./fonts/MyCustomFont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

/* Now you can use it */
.pace-textbox-text {
  font-family: 'MyCustomFont', sans-serif;
}
```

**For TTF or OTF files:**

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('./fonts/MyCustomFont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.pace-textbox-text {
  font-family: 'MyCustomFont', sans-serif;
}
```

**For multiple formats (best browser support):**

```css
@font-face {
  font-family: 'MyCustomFont';
  src:
    url('./fonts/MyCustomFont.woff2') format('woff2'),
    url('./fonts/MyCustomFont.woff') format('woff'),
    url('./fonts/MyCustomFont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

#### Step 4: Use the Font

Now you can use your custom font anywhere in the CSS:

```css
.pace-textbox-text {
  font-family: 'MyCustomFont', Arial, sans-serif;
}
```

?> **Tip**: Always include a fallback font (like `Arial, sans-serif`) in case the custom font fails to load.

#### Complete Example: Adding a Pixel Font

Let's add the "Press Start 2P" font from Google Fonts:

1. **Download the font:**
   - Go to [Google Fonts - Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
   - Click "Download family"
   - Extract the ZIP and find `PressStart2P-Regular.ttf`

2. **Add to your game:**
   - Create a `fonts` folder next to `Engine.css`
   - Copy `PressStart2P-Regular.ttf` into it

3. **Load in Engine.css** (add at the very top):

```css
@font-face {
  font-family: 'Press Start 2P';
  src: url('./fonts/PressStart2P-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* Use it for textbox text */
.pace-textbox-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px; /* Pixel fonts work best at smaller sizes */
  line-height: 1.8; /* Extra line height for readability */
}
```

---

#### Font Loading Tips

**Font not showing up?**

- Check the file path in `url()` is correct
- Make sure the font file is in the right folder
- Check browser console (F12) for loading errors
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Font looks blurry or wrong size?**

- Some fonts (especially pixel fonts) need smaller sizes (10-16px)
- Try adding `-webkit-font-smoothing: none;` for pixel fonts
- Adjust `line-height` if text feels cramped

**Using different font weights (bold, light, etc.)?**

You need separate `@font-face` rules for each weight:

```css
/* Regular */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

/* Bold */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

/* Italic */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont-Italic.ttf') format('truetype');
  font-weight: 400;
  font-style: italic;
}
```

---

### Change Text Size and Color

Adjust readability:

```css
/* Larger text */
.pace-textbox-text {
  font-size: 36px;
}

/* Smaller, more compact */
.pace-textbox-text {
  font-size: 20px;
  line-height: 1.3;
}

/* Different color */
.pace-textbox-text {
  color: #ffffff;
}

/* With custom shadow for readability */
.pace-textbox-text {
  color: #ffee00;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}
```

---

### Remove or Simplify Text Shadow

The default has a complex text shadow. Simplify it:

```css
/* Simple drop shadow */
.pace-textbox-text {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

/* No shadow */
.pace-textbox-text {
  text-shadow: none;
}

/* Outline effect */
.pace-textbox-text {
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
}
```

---

## Customizing the Continue Prompt

The "Press Space to Continue" text:

```css
.pace-textbox-continue span {
  font-size: 18px;
  color: var(--text);
  font-family: 'Geist';
  font-style: italic;
  opacity: 0.9;
  animation: pace-pulse 1s infinite;
}
```

### Change Continue Prompt Style

```css
/* Larger and bold */
.pace-textbox-continue span {
  font-size: 20px;
  font-weight: bold;
  font-style: normal;
}

/* Different position */
.pace-textbox-continue {
  justify-content: center; /* Center instead of right */
}

/* No animation */
.pace-textbox-continue span {
  animation: none;
  opacity: 0.8;
}

/* Faster pulse */
.pace-textbox-continue span {
  animation: pace-pulse 0.5s infinite;
}
```

---

## Customizing Elements

Interactive elements use these classes:

```css
.pace-element {
  transition:
    filter 0.2s ease,
    transform 0.2s ease;
}

.pace-element:active {
  transform: scale(0.99);
}
```

### Change Hover and Click Effects

```css
/* No click animation */
.pace-element:active {
  transform: none;
}

/* Stronger click effect */
.pace-element:active {
  transform: scale(0.95);
}

/* Faster transitions */
.pace-element {
  transition:
    filter 0.1s ease,
    transform 0.1s ease;
}

/* Add rotation on click */
.pace-element:active {
  transform: scale(0.99) rotate(2deg);
}
```

---

## Complete Style Examples

?> Note: As mentioned earlier, you may need to download and add custom fonts used in these examples.

### Example 1: Pixel Art Style

```css
.pace-textbox {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 800px;
  background: #000000;
  border: 4px solid #ffffff;
  box-shadow:
    inset 0 0 0 4px #000000,
    inset 0 0 0 8px #ffffff;
  padding: 16px;
  image-rendering: pixelated;
  backdrop-filter: none;
}

.pace-textbox-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffffff;
  text-shadow: 2px 2px 0 #000000;
  line-height: 1.8;
}
```

---

### Example 2: Modern Minimal

```css
.pace-textbox {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  max-width: 700px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: none;
}

.pace-textbox-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 22px;
  color: #1a1a1a;
  text-shadow: none;
  line-height: 1.6;
}
```

---

### Example 3: Fantasy RPG Style

```css
.pace-textbox {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: linear-gradient(
    to bottom,
    rgba(40, 20, 10, 0.95),
    rgba(20, 10, 5, 0.95)
  );
  border: 6px solid #8b6914;
  border-radius: 8px;
  padding: 20px 28px;
  box-shadow:
    0 0 20px rgba(139, 105, 20, 0.4),
    inset 0 2px 10px rgba(0, 0, 0, 0.5);
}

.pace-textbox-text {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 24px;
  color: #f4e8c1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.6;
}
```

---

## Customizing the Space Key Indicator

The keyboard icon that appears in the continue prompt:

```css
.pace-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  min-width: 44px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #93b6df;
  background: linear-gradient(
    to bottom,
    rgba(147, 182, 223, 0.12),
    rgba(147, 182, 223, 0.08)
  );
  color: #cdd6f4;
  font-size: 18px;
  box-shadow: /* ... */;
}
```

### Customize Key Style

```css
/* Simpler flat style */
.pace-key {
  padding: 4px 12px;
  border-radius: 4px;
  border: 2px solid #ffffff;
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  box-shadow: none;
}

/* Hide the key indicator entirely */
.pace-key {
  display: none;
}
/* Then update the text in Engine.js to not include the key */
```

---

## Debugging CSS Changes

### Using Browser DevTools

1. **Open your game** in a web browser
2. **Press F12** to open DevTools
3. **Click the inspector** (top-left icon)
4. **Click on the textbox** or element you want to modify
5. **Edit styles live** in the Styles panel
6. **Copy working changes** back to Engine.css

?> **Tip**: Use DevTools to experiment with changes before editing files - it's much faster and you can see results instantly.

---

### Common Issues

**Changes not appearing?**

- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check for typos in CSS selectors

**Layout broken?**

- Check for missing semicolons or braces
- Validate your CSS using browser DevTools
- Restore from backup and try again

**Colors look wrong?**

- Check color format (hex, rgb, rgba)
- Verify transparency values (0-1 for alpha)
- Test in different browsers

---

## Tips and Best Practices

1. **Make one change at a time** - Easier to identify issues
2. **Keep backups** - Save original Engine.css before editing
3. **Test across browsers** - Chrome, Firefox, Safari may render differently
4. **Use DevTools** - Experiment live before committing changes
5. **Comment your changes** - Add `/* notes */` to remember what you did
6. **Check mobile** - Test responsive behavior at different screen sizes

---

## Next Steps

Want to modify behavior and add features? Check out [Extending Functionality](customization-js.md) to learn about editing Engine.js.
