# Installation

PACE Editor is available for Windows and Linux. Choose the appropriate version for your operating system.

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10/11 or modern Linux distribution
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 200MB free space for application, plus space for your projects
- **Display**: 1280x720 minimum resolution

### Supported Platforms

- Windows 10 and 11 (64-bit)
- Linux (64-bit) with AppImage support or portable ZIP

## Download

All releases are available on the [PACE GitHub Releases page](https://github.com/ruelalarcon/pace/releases).

Latest version: **v1.0.0**

## Windows Installation

### Option 1: Installer (Recommended)

**Best for**: Most users who want a traditional installation

1. **Download** the installer:
   - [pace_v1.0.0_windows_x64.exe](https://github.com/ruelalarcon/pace/releases/download/v1.0.0/pace_v1.0.0_windows_x64.exe)

2. **Run the setup file**:
   - Double-click `pace_v1.0.0_windows_x64.exe`
   - Windows may show a SmartScreen warning - click "More info" then "Run anyway"
   - Follow the installation wizard prompts

3. **Launch PACE**:
   - Find PACE in your Start Menu
   - Or use the desktop shortcut if you created one during installation

### Option 2: Portable ZIP

**Best for**: Users who don't want to install, or want to run from USB drives

1. **Download** the portable ZIP:
   - [pace_v1.0.0_windows_x64_portable.zip](https://github.com/ruelalarcon/pace/releases/download/v1.0.0/pace_v1.0.0_windows_x64_portable.zip)

2. **Extract the ZIP**:
   - Right-click the ZIP file
   - Select "Extract All..."
   - Choose a location (e.g., `C:\Program Files\PACE` or your USB drive)

3. **Run PACE**:
   - Open the extracted folder
   - Double-click `pace.exe` to launch

> **Note**: The portable version stores projects in the same folder as the executable by default.

## Linux Installation

### Option 1: AppImage (Recommended)

**Best for**: Most Linux users, no installation required

1. **Download** the AppImage:
   - [pace_v1.0.0_linux_x86_64.AppImage](https://github.com/ruelalarcon/pace/releases/download/v1.0.0/pace_v1.0.0_linux_x86_64.AppImage)

2. **Make it executable**:
   ```bash
   chmod +x pace_v1.0.0_linux_x86_64.AppImage
   ```

3. **Run PACE**:
   ```bash
   ./pace_v1.0.0_linux_x86_64.AppImage
   ```

   Or double-click the file in your file manager.

> **Tip**: You can move the AppImage to `~/Applications` or `~/.local/bin` for easier access.

### Option 2: Portable ZIP

**Best for**: Users who want to extract and run without AppImage dependencies

1. **Download** the portable ZIP:
   - [pace_v1.0.0_linux_x64_portable.zip](https://github.com/ruelalarcon/pace/releases/download/v1.0.0/pace_v1.0.0_linux_x64_portable.zip)

2. **Extract the ZIP**:
   ```bash
   unzip pace_v1.0.0_linux_x64_portable.zip -d ~/pace
   cd ~/pace
   ```

3. **Make executable and run**:
   ```bash
   chmod +x pace
   ./pace
   ```

## First Launch

When you first launch PACE:

1. The **Dashboard** will appear
2. You can create a new project or open an existing one
3. Your projects are stored in a default location:
   - **Windows**: `C:\Users\YourName\Documents\PACE Projects`
   - **Linux**: `~/Documents/PACE Projects`

## Troubleshooting

### Windows Issues

**"Windows protected your PC" warning:**
- This is normal for new applications
- Click "More info" then "Run anyway"
- PACE is open-source and safe to run

**Application won't start:**
- Ensure you have Windows 10 or later
- Try running as administrator (right-click → "Run as administrator")
- Check that your antivirus isn't blocking the application

**Missing DLL errors:**
- Install [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)

### Linux Issues

**AppImage won't run:**
- Make sure you've made it executable: `chmod +x pace_*.AppImage`
- Install FUSE if needed: `sudo apt install fuse` (Ubuntu/Debian) or `sudo dnf install fuse` (Fedora)
- Try running from terminal to see error messages

**Missing dependencies:**
- Most dependencies are bundled, but you may need:
  ```bash
  # Ubuntu/Debian
  sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1

  # Fedora
  sudo dnf install gtk3 libnotify nss libXScrnSaver libXtst xdg-utils at-spi2-atk libdrm mesa-libgbm
  ```

**Permission denied:**
- Ensure the file has execute permissions: `chmod +x pace`

## Uninstalling

### Windows (Installer Version)

1. Open Windows Settings
2. Go to "Apps" or "Apps & Features"
3. Find "PACE Editor" in the list
4. Click "Uninstall"

### Windows (Portable Version)

Simply delete the folder containing the PACE files.

### Linux

Delete the AppImage file or the extracted portable folder.

## Updating

To update PACE:

1. Download the latest version from the [releases page](https://github.com/ruelalarcon/pace/releases)
2. For installers: Run the new installer (it will replace the old version)
3. For portable versions: Extract to a new location or replace the old files
4. Your projects are stored separately and won't be affected by updates

## Getting Help

If you encounter issues during installation:

1. Check the [GitHub Issues](https://github.com/ruelalarcon/pace/issues) page
2. Create a new issue with:
   - Your operating system and version
   - The PACE version you downloaded
   - Steps to reproduce the problem
   - Any error messages you see

---

**Ready to start?** Continue to the [Getting Started Guide](getting-started.md) to create your first project!
