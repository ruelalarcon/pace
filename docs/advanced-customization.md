# Advanced Customization

!> **Warning**: This section is intended for developers with knowledge of web development (HTML, CSS, JavaScript). If you're not familiar with programming, you can skip this section and use PACE as-is through the visual editor.

PACE exports games as readable, organized JavaScript, HTML, and CSS files. This makes it easy to customize and extend your game beyond what the visual editor provides.

---

## Why Customize?

While PACE's visual editor provides everything you need for basic point-and-click games, you might want to:

- Change the visual style (fonts, colors, textbox design)
- Adjust timing and animation speeds
- Add custom game mechanics (inventory, stats, mini-games)
- Implement unique interaction patterns
- Create custom UI elements
- Add save/load functionality

---

## Understanding the Export Structure

When you export a game, you get access to two key files that control everything:

### Engine.js - The Game Logic

This JavaScript file contains the `Engine` class that handles:

| Component | Responsibility |
|-----------|---------------|
| **Scene Management** | Scene transitions and navigation |
| **Element System** | Rendering and interactions |
| **Text System** | Typewriter effect and dialogue |
| **Audio System** | Music and sound effects playback |
| **Input Handling** | Clicks and keyboard input |

?> **Note**: The code is well-organized into methods, making it easy to find and modify specific behaviors.

### Engine.css - The Visual Styling

This CSS file controls all visual aspects:

| Category | What it Controls |
|----------|------------------|
| **Textbox** | Appearance and position |
| **Text Styling** | Font, size, colors, shadows |
| **Element Effects** | Hover effects and animations |
| **Canvas** | Scene styling and layout |
| **Responsive** | Mobile and accessibility styles |

?> **Note**: Both files use clear naming conventions and include comments to help you understand what each part does.

---

## What You'll Learn

This section is divided into two guides:

### [Modifying Appearance](customization-css.md)

Learn how to customize the visual style of your game by editing Engine.css:

- Redesign the textbox
- Change fonts, colors, and text styling
- Customize element hover effects
- Adjust layouts and positioning
- Create custom visual themes

### [Extending Functionality](customization-js.md)

Learn how to add new features and modify behavior by editing Engine.js:

- Adjust timing variables (text speed, delays)
- Add custom element behaviors
- Implement scene transitions
- Create new game mechanics
- Extend the engine with custom methods

---

## Getting Started

1. **Export your game** using the "Website Folder" format for easiest editing
2. **Extract the files** and locate `Engine.js` and `Engine.css`
3. **Make backups** of the original files before making changes
4. **Use a code editor** like VS Code, Sublime Text, or even Notepad++
5. **Test frequently** by opening your game in a browser after each change

---

## Prerequisites

To successfully customize PACE exports, you should be comfortable with:

| Technology | What You Need to Know |
|------------|----------------------|
| **CSS** | Selectors, properties, values, and the box model |
| **JavaScript** | Variables, functions, objects, and classes |
| **HTML** | Basic structure and the DOM |
| **Browser DevTools** | Inspecting elements and debugging |

---

## Next Steps

Choose a guide based on what you want to customize:

- **Want to change how things look?** → [Modifying Appearance](customization-css.md)
- **Want to add new features or change behavior?** → [Extending Functionality](customization-js.md)

Both guides include practical examples and code snippets.
