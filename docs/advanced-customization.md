# Advanced Customization

> **Warning**: This section is intended for developers with knowledge of web development (HTML, CSS, JavaScript). If you're not familiar with programming, you can skip this section and use PACE as-is through the visual editor.

PACE exports games as readable, organized JavaScript, HTML, and CSS files. This makes it easy to customize and extend your game beyond what the visual editor provides.

## Why Customize?

While PACE's visual editor provides everything you need for basic point-and-click games, you might want to:

- Change the visual style (fonts, colors, textbox design)
- Adjust timing and animation speeds
- Add custom game mechanics (inventory, stats, mini-games)
- Implement unique interaction patterns
- Create custom UI elements
- Add save/load functionality

## Understanding the Export Structure

When you export a game, you get access to two key files that control everything:

### Engine.js - The Game Logic

This JavaScript file contains the `Engine` class that handles:

- Scene management and transitions
- Element rendering and interactions
- Text system (typewriter effect, dialogue)
- Audio playback (music and sound effects)
- Input handling (clicks, keyboard)

The code is well-organized into methods, making it easy to find and modify specific behaviors.

### Engine.css - The Visual Styling

This CSS file controls all visual aspects:

- Textbox appearance and position
- Text styling (font, size, colors, shadows)
- Element hover effects and animations
- Scene canvas styling
- Responsive design rules

Both files use clear naming conventions and include comments to help you understand what each part does.

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

## Getting Started

1. **Export your game** using the "Website Folder" format for easiest editing
2. **Extract the files** and locate `Engine.js` and `Engine.css`
3. **Make backups** of the original files before making changes
4. **Use a code editor** like VS Code, Sublime Text, or even Notepad++
5. **Test frequently** by opening your game in a browser after each change

## Prerequisites

To successfully customize PACE exports, you should be comfortable with:

- **CSS**: Selectors, properties, values, and the box model
- **JavaScript**: Variables, functions, objects, and classes
- **HTML**: Basic structure and the DOM
- **Browser DevTools**: Inspecting elements and debugging

If you're new to these technologies, consider using PACE as-is, or learning the basics first through resources like [MDN Web Docs](https://developer.mozilla.org).

## Best Practices

1. **Start small**: Make one change at a time and test
2. **Keep backups**: Always preserve the original files
3. **Comment your changes**: Leave notes explaining what you modified
4. **Test across browsers**: Check Chrome, Firefox, and Safari
5. **Use DevTools**: Experiment with changes live before editing files

## Next Steps

Choose a guide based on what you want to customize:

- **Want to change how things look?** → [Modifying Appearance](customization-css.md)
- **Want to add new features or change behavior?** → [Extending Functionality](customization-js.md)

Both guides include practical examples and code snippets you can use right away!
