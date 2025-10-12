# Text System

The text system in PACE creates an immersive dialogue experience with typewriter effects and player interaction.

## Text Behavior

- Text appears with a typewriter effect (20ms delay between letters)
- Players can press Space to fast-forward the typing
- After typing completes, players press Space again to continue
- Multiple lines (separated by newlines) create separate text bubbles, such that the player must press space each time to reveal the next line of text
- Text appears in a semi-transparent textbox at the bottom of the screen

## Where Text Can Appear

### Scene Text

Text that automatically appears when entering a scene.

- Found in the Scene Properties inspector
- Appears after a short delay (300ms)
- Can lead to automatic navigation with "New Scene After Text"

### Element Text

Text that appears when clicking an element.

- Found in the Element Properties inspector under "On-Click Text"
- Cancels any pending scene text
- Can be combined with destination scenes for narrative transitions

## Text Navigation

### Scene Text Navigation

When scene text has a "New Scene After Text" set, navigation happens after the player "continues" past the scene text's textbox.

> **Important**: This can be cancelled if the player clicks an element which has text instead of continuing the scene text. It may be important to add an element that leads the player to the next scene if it's critical that the player reaches the next scene.

### Element Text Navigation

When element text has a "Destination Scene" set, navigation happens after the player "continues" past the element text's textbox.

## Text Formatting Tips

- Use newlines to break text into multiple dialogue bubbles
- Keep individual text bubbles short for better pacing
- Test your text timing in preview mode
- Consider the reading speed of your players

## Common Patterns

### Cutscene Pattern

Use scene text with "New Scene After Text" to create non-interactive cutscenes or narrative sequences.

### Interactive Dialogue

Use element text without automatic navigation to let players control the conversation flow.

### Guided Navigation

Combine scene text with elements that have destination scenes to guide players while giving them control.
