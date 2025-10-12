# Audio System

PACE includes a comprehensive audio system for creating atmospheric games with music and sound effects.

---

## Audio File Support

### Upload Locations

| Audio Type | Location |
|------------|----------|
| **Scene Music** | Scene Properties inspector |
| **Element Sounds** | Element Properties inspector |
| **Music Changes** | Element Properties inspector |

---

## Music System

### Background Music

Background music loops continuously while a scene is active.

**Behavior:**
- Set in Scene Properties under "Music"
- Loops automatically without gaps
- Transitions smoothly between scenes

### Smart Music Transitions

PACE intelligently handles music playback:

- Same music won't restart when transitioning between scenes
- Seamless continuation if both scenes use the same track
- New music fades in when changed

### First Scene Restriction

For the very first scene the player loads into, the music **will not play** until the player interacts with the page by pressing a key or clicking something.

!> **Important**: This is due to a restriction modern browsers have for audio in webpages. In some cases, it may be wise to have the first scene be a "title" screen with an element that acts as a "play" button to proceed to the next scene and truly begin the game.

### Music Changes via Elements

Elements can change the background music when clicked:

**Configuration:**
- Set in Element Properties under "On-Click Music Change"
- Replaces the current scene's music
- Won't restart if the chosen music is already playing
- Useful for dynamic music changes based on player actions

---

## Sound Effects

### On-Click Sounds

Elements can play sound effects when clicked:

**Configuration:**
- Set in Element Properties under "On-Click Sound"
- Plays immediately when element is clicked
- Volume is set to 70% to avoid overpowering music
- Each click restarts the sound

### Sound Behavior

| Aspect | Behavior |
|--------|----------|
| **One-Shot Playback** | Sounds play once when triggered |
| **Immediate Response** | No delay between click and sound |
| **Overlap** | Multiple sounds can play simultaneously |
| **Volume Balance** | Sound effects are quieter than music by default |

---

## Best Practices

### Music Tips

- Use loopable tracks that don't have obvious start/end points
- Keep file sizes reasonable (aim for 1-5MB per track)
- Use consistent audio quality across all tracks
- Consider using a title screen to work around the first-scene audio restriction

### Sound Effect Tips

- Keep sounds short (under 2 seconds for UI elements)
- Use appropriate volume levels - PACE sets sounds to 70% by default
- Test sound timing with element interactions
- Don't overuse sounds - they should enhance, not distract

### File Size Optimization

?> **Tip**: Enable "Optimize Resources" when exporting to significantly reduce file sizes while maintaining quality.

**Optimization details:**
- Enable "Optimize Resources" when exporting to compress audio files
- Optimized exports convert audio to the opus ogg codec for smaller files
- Consider the trade-off between quality and download time
- Test your exported game to ensure audio quality is acceptable

---

## Troubleshooting

### Music Not Playing

- Check if it's the first scene - player must interact first
- Verify the audio file format is supported
- Test in preview mode before exporting

### Sounds Not Working

- Ensure the file uploaded successfully
- Check browser console for error messages
- Verify the file isn't corrupted
