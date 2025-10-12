# Preview & Export

Learn how to test your game and export it for distribution.

---

## Game Preview

The preview feature lets you test your game without exporting it.

### Starting Preview

1. Click the "Preview" button in the editor header to playtest your game
2. The preview begins on the scene you were currently viewing within the editor
3. Test all interactions, text, and navigation
4. Hit the "Exit Preview" button in the page header to return to the editor

---

## Exporting Your Game

When your game is complete, you can export it for distribution.

### Export Process

1. Click "Export" in the editor header
2. Choose your export settings (see below)
3. Wait for the export to generate
4. Save the exported file(s)

---

## Export Settings

### Initial Scene

Select which scene the game starts on.

- Usually your opening scene or main menu
- Can be different from the first scene you created
- Test that the starting scene makes sense for new players

---

### Export Format

Choose between two export formats based on your needs:

#### Standalone HTML

Single HTML file with all resources embedded.

| Aspect | Details |
|--------|---------|
| **Pros** | Easy to share, works offline immediately, no setup required, single file to manage |
| **Cons** | Larger file size, slower loading time, harder to edit after export |

**Best for**: Sharing via email or file transfer, simple distribution, offline play, or quick prototypes.

#### Website Folder

ZIP file containing index.html and separate resource files.

| Aspect | Details |
|--------|---------|
| **Pros** | Smaller individual files, better for web hosting, efficient loading, easier to edit, better browser caching |
| **Cons** | Requires extraction/setup, multiple files to manage, needs web server for optimal performance |

**Best for**: Web hosting (GitHub Pages, itch.io, etc.), professional distribution, games with many assets, or projects you may need to modify later.

---

### Optimize Resources

Controls whether resources are compressed during export.

#### Enabled (Recommended)

Compresses images and uses efficient formats.

?> **Recommendation**: Keep optimization enabled unless you have a specific reason not to.

| Optimization | Result |
|--------------|--------|
| **Images** | Compressed to WebP format |
| **Audio** | Compressed to opus ogg codec |
| **File Size** | Significantly smaller |
| **Downloads** | Faster loading times |
| **Quality** | Good preservation |

#### Disabled

Keeps original file formats and sizes.

?> **Use when**: You need specific file formats or encounter compatibility issues (rare cases).

---

## After Export

### Standalone HTML

1. Locate the exported `.html` file
2. Open it in any modern web browser
3. Share the file directly with players

**Supported Browsers:**
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

---

### Website Folder

1. Locate the exported `.zip` file
2. Extract the ZIP file to a folder
3. Upload the contents to a web server

**Hosting Options:**

| Platform | Description |
|----------|-------------|
| **GitHub Pages** | Free hosting for static sites |
| **itch.io** | Popular game hosting platform |
| **Netlify/Vercel** | Modern hosting with easy deployment |
| **Your own web server** | Traditional hosting |

#### GitHub Pages Quick Setup

1. Create a GitHub repository
2. Extract and commit the exported files
3. Enable GitHub Pages in repository settings
4. Your game will be available at `https://username.github.io/repository`

---

## Testing Exports

Before distributing your game:

1. Test the exported version (not just preview mode)
2. Try it on different browsers
3. Test on different devices if possible
4. Check that all audio and images load correctly
5. Verify the initial scene is correct
6. Test all navigation paths

---

## File Size Considerations

| Game Size | Recommended Format |
|-----------|-------------------|
| **Small Games** (< 10MB) | Either format works well |
| **Medium Games** (10-50MB) | Website folder recommended |
| **Large Games** (> 50MB) | Website folder strongly recommended |

---

## Troubleshooting

### Export Fails

- Check that all referenced assets exist
- Ensure no scenes or elements are missing required data
- Try exporting with optimization disabled

### Assets Not Loading

- Verify all file uploads completed successfully
- Check browser console for error messages
- Test with a simpler project to isolate the issue

### Large File Size

- Enable resource optimization
- Consider using website folder format
- Compress audio files before uploading
- Resize images to reasonable dimensions before uploading
