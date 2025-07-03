# 3D Room Portfolio

An interactive 3D room portfolio website built with Three.js and Vite. This project showcases your room in 3D with an interactive computer screen that displays your portfolio information.

## Features

-   **3D Room Visualization**: Load and display your room from a GLB file
-   **CSS3D Interactive Screen**: Real web content displayed on the computer screen using CSS3D renderer
-   **Interactive Computer Screen**: Click on the computer screen to interact with actual web content
-   **YouTube Integration**: Load and play YouTube videos directly in the 3D scene
-   **Website Embedding**: Display any website content within the 3D environment
-   **Portfolio Display**: Built-in portfolio section with skills and projects
-   **Responsive Design**: Works on desktop and mobile devices
-   **Modern UI**: Clean, cyberpunk-inspired interface
-   **Smooth Animations**: Fluid transitions and interactions
-   **ESC Key Support**: Press ESC to close the interactive screen

## Technologies Used

-   **Three.js**: 3D graphics rendering
-   **CSS3DRenderer**: Embed real HTML/CSS content in 3D scenes
-   **Vite**: Fast build tool and development server
-   **WebGL**: Hardware-accelerated 3D graphics
-   **Modern JavaScript**: ES6+ features and modules
-   **CSS3**: Advanced styling and animations

## Installation

1. **Clone or download the project**
2. **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

1. **Start the development server:**

    ```bash
    npm run dev
    ```

2. **Open your browser** and navigate to `http://localhost:5173`

3. **Interact with the room:**

    - Click and drag to look around
    - Scroll to zoom in/out
    - Click on the computer screen to interact with real web content
    - Use buttons on the screen to load YouTube videos, websites, or portfolio
    - Press ESC to close the interactive screen

4. **Position the screen manually (optional):**
    - Press **P** key to see demo positions, OR
    - Open browser console (F12)
    - Use: `setScreenPosition(x, y, z, rotX, rotY, rotZ, scale)`
    - Example: `setScreenPosition(2, 1.5, -1, 0, Math.PI/4, 0, 0.002)`

## Project Structure

```
My Room/
├── room.glb              # Your 3D room model
├── index.html            # Main HTML file
├── main.js              # Main JavaScript file with Three.js logic
├── style.css            # CSS styles
├── package.json         # Project dependencies
└── README.md           # This file
```

## Customization

### Updating Portfolio Content

Edit the HTML in `index.html` to update your portfolio information:

-   **About Section**: Update the about text
-   **Projects Section**: Add your projects and descriptions
-   **Contact Section**: Update your contact links

### Styling

Modify `style.css` to customize the appearance:

-   **Colors**: Change the color scheme
-   **Fonts**: Update typography
-   **Animations**: Modify transitions and effects

### 3D Scene

Adjust the 3D scene in `main.js`:

-   **Camera Position**: Modify initial camera position
-   **Lighting**: Adjust lighting setup
-   **Materials**: Change material properties

## GLB File Requirements

Your `room.glb` file should:

-   Be properly scaled (the code assumes a reasonable room size)
-   Have a computer screen object (the code will try to detect it automatically)
-   Include proper materials and textures
-   Be optimized for web use (< 50MB recommended)

## Computer Screen Detection

The code automatically detects the computer screen in your GLB file by:

1. Looking for objects with "screen" in their name
2. Finding dark/black materials that might be a screen
3. Creating a placeholder screen if none is found

## CSS3D Integration

The computer screen uses Three.js CSS3DRenderer to display real web content:

-   **YouTube Videos**: Load and play actual YouTube videos
-   **Website Content**: Display any website using iframes
-   **Portfolio Content**: Built-in portfolio display with HTML/CSS
-   **Interactive Elements**: Buttons, scrolling, and full web interactions
-   **Responsive**: Content adapts to screen size

### Screen Content Options:

-   **YouTube Button**: Loads a YouTube video player
-   **Three.js Button**: Displays the Three.js examples page
-   **Portfolio Button**: Shows your portfolio information

## Manual Screen Positioning

You can manually position the computer screen exactly where you want it in your 3D room using these functions:

### Using Browser Console:

```javascript
// Try the demo first to see different positions
demoPositions();

// Position the screen at specific coordinates
setScreenPosition(x, y, z, rotationX, rotationY, rotationZ, scale);

// Example: Position screen at x=2, y=1.5, z=-1 with slight Y rotation
setScreenPosition(2, 1.5, -1, 0, Math.PI / 4, 0, 0.002);

// Create a new screen at a specific position
createScreenAt(x, y, z, rotationX, rotationY, rotationZ, scale);
```

### Using Code:

```javascript
// Access the room portfolio instance
window.roomPortfolio.setComputerScreenPosition(
	x,
	y,
	z,
	rotX,
	rotY,
	rotZ,
	scale
);

// Create CSS3D screen at custom position
window.roomPortfolio.createCSS3DScreenAtPosition(
	x,
	y,
	z,
	rotX,
	rotY,
	rotZ,
	scale
);
```

### Parameters:

-   **x, y, z**: Position coordinates in 3D space
-   **rotationX, rotationY, rotationZ**: Rotation in radians (use Math.PI for 180°)
-   **scale**: Size of the screen (0.001 = very small, 0.01 = larger)

### Examples:

```javascript
// Screen on the right wall
setScreenPosition(3, 2, 0, 0, -Math.PI / 2, 0, 0.002);

// Screen on the desk
setScreenPosition(0, 1, -2, -Math.PI / 8, 0, 0, 0.0015);

// Large screen on back wall
setScreenPosition(0, 2, -4, 0, 0, 0, 0.005);
```

## Building for Production

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

To preview the production build:

```bash
npm run preview
```

## Browser Support

-   Chrome (recommended)
-   Firefox
-   Safari
-   Edge

Note: WebGL support is required for 3D rendering.

## Performance Tips

-   Optimize your GLB file size
-   Use compressed textures
-   Limit polygon count for better performance
-   Test on different devices

## Troubleshooting

### GLB File Not Loading

-   Check that `room.glb` is in the project root
-   Verify the file is not corrupted
-   Check browser console for errors

### Computer Screen Not Detected

-   Ensure your GLB file has a screen object
-   Check the object naming in your 3D software
-   The code will create a placeholder if no screen is found

### Performance Issues

-   Reduce GLB file size
-   Lower screen resolution
-   Close other browser tabs

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please check the browser console for error messages and ensure all dependencies are properly installed.

---

Enjoy exploring your 3D room portfolio! 🎮✨
