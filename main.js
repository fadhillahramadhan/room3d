import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import {
	CSS3DObject,
	CSS3DRenderer,
} from 'three/examples/jsm/renderers/CSS3DRenderer.js';

class RoomPortfolio {
	constructor() {
		this.scene = new THREE.Scene();
		this.css3dScene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.renderer = new THREE.WebGLRenderer({
			canvas: document.getElementById('three-canvas'),
			antialias: true,
		});
		this.css3dRenderer = new CSS3DRenderer();
		this.controls = null;
		this.roomModel = null;
		this.chairModel = null;
		// Add your own screen variables here
		// Add your own state variables here

		// Chair animation variables
		this.chairAnimationTime = 0;
		this.chairRotationSpeed = 0.5; // Speed of rotation (lower = slower)
		this.chairRotationAmplitude = Math.PI / 6; // Maximum rotation angle (30 degrees)
		this.chairBaseRotationY = -Math.PI; // Base rotation (-180 degrees)

		this.init();
	}

	init() {
		// Initialize RectAreaLight uniforms (required for RectAreaLight)
		RectAreaLightUniformsLib.init();

		this.setupRenderer();
		this.setupLights();
		this.setupCamera();
		this.setupControls();
		this.loadRoom();
		this.loadChair();
		this.setupScreens();
		this.setupEventListeners();
		this.animate();
	}

	setupRenderer() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0x000000);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0; // Balanced exposure for realistic lighting
		this.renderer.physicallyCorrectLights = true; // Enable physically correct lighting for Blender lights

		// CSS3D renderer setup
		this.css3dRenderer.setSize(window.innerWidth, window.innerHeight);
		this.css3dRenderer.domElement.style.position = 'absolute';
		this.css3dRenderer.domElement.style.top = '0px';
		this.css3dRenderer.domElement.style.pointerEvents = 'none';
		this.css3dRenderer.domElement.style.zIndex = '10';
		document.body.appendChild(this.css3dRenderer.domElement);
	}

	setupLights() {
		// Initialize lighting system
		this.initializeLightingSystem();
	}

	initializeLightingSystem() {
		this.lights = {};
		this.lightHelpers = {};
		this.setupRealisticRoomLighting();
	}

	setupRealisticRoomLighting() {
		// Clear existing lights first
		this.clearCustomLights();

		// Minimal ambient light (like real room with lights off)
		const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
		this.scene.add(ambientLight);
		this.lights.ambient = ambientLight;

		// Main center ceiling light
		const centerLight = new THREE.PointLight(0xffffff, 2.0, 30);
		centerLight.position.set(-0.5, 2.7, 0.5);

		centerLight.castShadow = true;
		centerLight.shadow.mapSize.width = 2048;
		centerLight.shadow.mapSize.height = 2048;
		centerLight.shadow.camera.near = 0.5;
		centerLight.shadow.camera.far = 30;
		centerLight.shadow.bias = -0.0001;
		this.scene.add(centerLight);
		this.lights.center = centerLight;

		// Long neon side light (RectAreaLight)
		const neonLight1 = new THREE.RectAreaLight(0xffffff, 20, 0.1, 3.0);
		neonLight1.position.set(0.8, 2.8, 1.3);
		neonLight1.rotation.set(-Math.PI / 2, 0, 0);

		this.scene.add(neonLight1);
		this.lights.neon = neonLight1;

		const neonLight2 = new THREE.RectAreaLight(0xffffff, 30, 0.1, 3.0);
		neonLight2.position.set(-1.85, 2.8, 1.3);
		neonLight2.rotation.set(-Math.PI / 2, 0, 0);
		this.scene.add(neonLight2);
		this.lights.neon2 = neonLight2;

		// Optional: Add some point lights for shadows (since RectAreaLight doesn't cast shadows)
	}

	setupScreens() {
		this.screens = [];

		// Create CSS3D group for screens
		var group = new THREE.Group();

		// Create a prominent screen positioned where it's easy to see
		const screen1 = this.createElement('portfolio', -0.45, 1.91, 0.1, 0);

		// Scale the screen to a reasonable size
		screen1.scale.set(0.005, 0.005, 0.005);

		group.add(screen1);

		this.css3dScene.add(group);
		this.screens.push(screen1);

		console.log(
			'🖥️ Screen created at position (0, 1.5, -2) with scale 0.005'
		);
	}

	// Manual light positioning helpers
	addLightHelpers() {
		// Clear existing helpers
		this.clearLightHelpers();

		// Add helpers for each light
		Object.keys(this.lights).forEach((lightName) => {
			const light = this.lights[lightName];
			if (light.isPointLight) {
				const helper = new THREE.PointLightHelper(light, 0.5);
				helper.name = `${lightName}_helper`;
				this.scene.add(helper);
				this.lightHelpers[lightName] = helper;
			} else if (light.isRectAreaLight) {
				const helper = new RectAreaLightHelper(light);
				helper.name = `${lightName}_helper`;
				this.scene.add(helper);
				this.lightHelpers[lightName] = helper;
			}
		});

		console.log('🔦 Light helpers added - you can now see light positions');
	}

	clearLightHelpers() {
		Object.keys(this.lightHelpers).forEach((helperName) => {
			this.scene.remove(this.lightHelpers[helperName]);
		});
		this.lightHelpers = {};
	}

	// Manual light positioning methods
	moveLightTo(lightName, x, y, z) {
		if (this.lights[lightName]) {
			this.lights[lightName].position.set(x, y, z);
		} else {
			console.warn(
				`Light '${lightName}' not found. Available lights:`,
				Object.keys(this.lights)
			);
		}
	}

	adjustLightIntensity(lightName, intensity) {
		if (this.lights[lightName]) {
			this.lights[lightName].intensity = intensity;
		} else {
			console.warn(
				`Light '${lightName}' not found. Available lights:`,
				Object.keys(this.lights)
			);
		}
	}

	// Special methods for neon light
	adjustNeonSize(width, height) {
		if (this.lights.neon && this.lights.neon.isRectAreaLight) {
			this.lights.neon.width = width;
			this.lights.neon.height = height;
		} else {
			console.warn('Neon light not found or not a RectAreaLight');
		}
	}

	rotateNeonLight(x, y, z) {
		if (this.lights.neon && this.lights.neon.isRectAreaLight) {
			this.lights.neon.rotation.set(x, y, z);
		} else {
			console.warn('Neon light not found or not a RectAreaLight');
		}
	}

	adjustNeonColor(hexColor) {
		if (this.lights.neon && this.lights.neon.isRectAreaLight) {
			this.lights.neon.color.setHex(hexColor);
		} else {
			console.warn('Neon light not found or not a RectAreaLight');
		}
	}

	setupCamera() {
		this.camera.position.set(0, 3, 5);
		this.camera.lookAt(0, 0, 0);
	}

	setupControls() {
		this.controls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;
		this.controls.screenSpacePanning = false;
		this.controls.minDistance = 2;
		this.controls.maxDistance = 20;
		this.controls.maxPolarAngle = Math.PI / 2;
	}

	clearCustomLights() {
		const lightsToRemove = [];
		this.scene.traverse((child) => {
			if (child.isLight) {
				lightsToRemove.push(child);
			}
		});

		lightsToRemove.forEach((light) => {
			this.scene.remove(light);
		});
	}

	loadRoom() {
		const loader = new GLTFLoader();
		const loadingScreen = document.getElementById('loading-screen');

		loader.load(
			'./assets/glb/room.glb',
			(gltf) => {
				this.roomModel = gltf.scene;

				// Scale and position the model
				this.roomModel.scale.set(1, 1, 1);
				this.roomModel.position.set(0, 0, 0);

				// Enable shadows and extract Blender lights
				let hasBlenderLights = false;
				this.roomModel.traverse((child) => {
					if (child.isMesh) {
						child.castShadow = true;
						child.receiveShadow = true;

						// Add your own screen detection logic here

						// Enhance materials
						if (child.material) {
							child.material.needsUpdate = true;
						}
					}

					// Extract Blender lights
					if (child.isLight) {
						hasBlenderLights = true;
						console.log(
							'Found Blender light:',
							child.name,
							child.type
						);

						// Configure the light properly for Three.js
						if (child.type === 'DirectionalLight') {
							child.castShadow = true;
							child.shadow.mapSize.width = 1024;
							child.shadow.mapSize.height = 1024;
							child.shadow.camera.near = 0.5;
							child.shadow.camera.far = 500;
							child.shadow.camera.left = -10;
							child.shadow.camera.right = 10;
							child.shadow.camera.top = 10;
							child.shadow.camera.bottom = -10;
						} else if (child.type === 'PointLight') {
							child.castShadow = true;
							child.shadow.mapSize.width = 1024;
							child.shadow.mapSize.height = 1024;
						} else if (child.type === 'SpotLight') {
							child.castShadow = true;
							child.shadow.mapSize.width = 1024;
							child.shadow.mapSize.height = 1024;
						}

						// Increase intensity for better visibility
						child.intensity *= 2;
					}
				});

				// If we found Blender lights, use them primarily
				if (hasBlenderLights) {
					console.log('Using Blender lights from GLB file');
					// Clear existing lights first
					this.clearCustomLights();
					// Add minimal ambient light
					const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
					this.scene.add(ambientLight);
				} else {
					console.log(
						'No Blender lights found, using custom lighting'
					);
				}

				// Create your own screen system here
				console.log(
					'Room loaded - ready for your custom screen system!'
				);

				this.scene.add(this.roomModel);

				// Hide loading screen
				loadingScreen.style.opacity = '0';
				setTimeout(() => {
					loadingScreen.style.display = 'none';
				}, 500);
			},
			undefined,
			(error) => {
				console.error('Error loading room:', error);
				loadingScreen.innerHTML =
					'<div class="loader"><p>Error loading room. Please check the console.</p></div>';
			}
		);
	}

	loadChair() {
		const loader = new GLTFLoader();

		loader.load(
			'./assets/glb/redchair.glb',
			(gltf) => {
				this.chairModel = gltf.scene;

				// Scale and position the chair
				this.chairModel.scale.set(1, 1, 1);
				this.chairModel.position.set(-0.7, 0.73, 1.2); // Default position - you can adjust this
				// rotate the chair
				this.chairModel.rotation.set(0, -180, 0);

				// Enable shadows for the chair
				this.chairModel.traverse((child) => {
					if (child.isMesh) {
						child.castShadow = true;
						child.receiveShadow = true;

						// Enhance materials
						if (child.material) {
							child.material.needsUpdate = true;
						}
					}
				});

				this.scene.add(this.chairModel);
			},
			undefined,
			(error) => {
				console.error('Error loading chair:', error);
			}
		);
	}

	createElement(id, x, y, z, ry) {
		// Create screen container with proper styling
		var div = document.createElement('div');
		div.style.width = '130px';
		div.style.height = '55px';
		div.style.backgroundColor = '#000';
		div.style.border = '3px solid #333';
		div.style.borderRadius = '8px';
		div.style.overflow = 'hidden';
		div.style.boxShadow = '0 0 20px rgba(0,150,255,0.5)';
		div.style.position = 'relative';
		div.style.pointerEvents = 'auto';
		// z-index 100
		div.style.zIndex = '100';

		// Create iframe with proper settings
		var iframe = document.createElement('iframe');
		iframe.style.width = '722px';
		iframe.style.height = '305px';
		iframe.style.border = 'none';
		iframe.style.display = 'block';
		iframe.style.position = 'absolute';
		iframe.style.top = '0';
		iframe.style.left = '0';
		iframe.style.transform = 'scale(0.18)';
		iframe.style.transformOrigin = '0 0';
		iframe.style.imageRendering = 'crisp-edges';
		iframe.style.imageRendering = '-webkit-crisp-edges';
		iframe.style.imageRendering = 'pixelated';

		// Try the website first, with fallback content
		iframe.src = 'https://fadhillahramadhan.github.io/';

		// Handle iframe load errors
		iframe.onerror = () => {
			console.log('Failed to load website, showing fallback content');
			this.showFallbackContent(div);
		};

		// Check if iframe loads successfully
		iframe.onload = () => {
			try {
				// Test if we can access the iframe content
				iframe.contentWindow.document;
				console.log('Website loaded successfully');
			} catch (e) {
				console.log(
					'Website blocks iframe embedding, showing fallback'
				);
				this.showFallbackContent(div);
			}
		};

		div.appendChild(iframe);

		// Create CSS3D object
		var object = new CSS3DObject(div);
		object.position.set(x, y, z);
		object.rotation.y = ry;

		return object;
	}

	showFallbackContent(div) {
		// Clear existing content
		div.innerHTML = '';

		// Create fallback content
		var fallbackDiv = document.createElement('div');
		fallbackDiv.style.width = '100%';
		fallbackDiv.style.height = '100%';
		fallbackDiv.style.backgroundColor = '#1a1a1a';
		fallbackDiv.style.color = '#00ff00';
		fallbackDiv.style.display = 'flex';
		fallbackDiv.style.flexDirection = 'column';
		fallbackDiv.style.justifyContent = 'center';
		fallbackDiv.style.alignItems = 'center';
		fallbackDiv.style.fontFamily = 'monospace';
		fallbackDiv.style.fontSize = '14px';
		fallbackDiv.style.textAlign = 'center';
		fallbackDiv.style.padding = '20px';

		fallbackDiv.innerHTML = `
			<div style="font-size: 8px; color: #00ff00; text-align: center; margin-top: 5px;">
				🖥️ SCREEN
			</div>
			<div style="font-size: 6px; color: #888; text-align: center; margin-top: 2px;">
				fadhillahramadhan.github.io
			</div>
			<div style="margin-top: 8px; text-align: center;">
				<button onclick="window.open('https://fadhillahramadhan.github.io/', '_blank')" 
					style="background: #00ff00; color: #000; border: none; padding: 2px 6px; 
					cursor: pointer; border-radius: 2px; font-family: monospace; font-size: 6px;">
					OPEN
				</button>
			</div>
		`;

		div.appendChild(fallbackDiv);
	}

	createScreen(id, x, y, z, ry) {
		return this.createElement(id, x, y, z, ry);
	}

	// Helper method to position screens
	positionScreen(screenIndex, x, y, z, scale = 0.005) {
		if (this.screens[screenIndex]) {
			this.screens[screenIndex].position.set(x, y, z);
			this.screens[screenIndex].scale.set(scale, scale, scale);
			console.log(
				`🖥️ Screen ${screenIndex} positioned at (${x}, ${y}, ${z}) with scale ${scale}`
			);
		} else {
			console.warn(`Screen ${screenIndex} not found`);
		}
	}

	// Helper method to rotate screens
	rotateScreen(screenIndex, x, y, z) {
		if (this.screens[screenIndex]) {
			this.screens[screenIndex].rotation.set(x, y, z);
			console.log(
				`🖥️ Screen ${screenIndex} rotated to (${x}, ${y}, ${z})`
			);
		} else {
			console.warn(`Screen ${screenIndex} not found`);
		}
	}

	// Show current screen positions
	showScreenPositions() {
		console.log('🖥️ Current Screen Positions:');
		this.screens.forEach((screen, index) => {
			const pos = screen.position;
			const rot = screen.rotation;
			const scale = screen.scale;
			console.log(
				`Screen ${index}: Position(${pos.x.toFixed(2)}, ${pos.y.toFixed(
					2
				)}, ${pos.z.toFixed(2)}) Rotation(${rot.x.toFixed(
					2
				)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(
					2
				)}) Scale(${scale.x.toFixed(4)})`
			);
		});
	}

	// Demo different screen positions
	demoScreenPositions() {
		console.log(
			'🖥️ Demo Screen Positions - Press P again to cycle through positions'
		);
		if (!this.demoIndex) this.demoIndex = 0;

		const positions = [
			{ x: 0, y: 1.5, z: -2, scale: 0.005 }, // Front wall
			{ x: 2, y: 1.5, z: 0, scale: 0.004 }, // Right wall
			{ x: -2, y: 1.5, z: 0, scale: 0.004 }, // Left wall
			{ x: 0, y: 2.5, z: -1, scale: 0.003 }, // High on front wall
			{ x: 1, y: 0.8, z: -1, scale: 0.002 }, // Lower right
		];

		const pos = positions[this.demoIndex % positions.length];
		this.positionScreen(0, pos.x, pos.y, pos.z, pos.scale);

		this.demoIndex++;
		console.log(
			`Position ${this.demoIndex}/${positions.length}: Use window.roomPortfolio.positionScreen(0, ${pos.x}, ${pos.y}, ${pos.z}, ${pos.scale}) to set manually`
		);
	}

	setupEventListeners() {
		// Handle window resize
		window.addEventListener('resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.css3dRenderer.setSize(window.innerWidth, window.innerHeight);
		});

		// Handle keyboard shortcuts
		document.addEventListener('keydown', (event) => {
			// Manual lighting shortcuts
			switch (event.key) {
				case 'l':
					this.addLightHelpers();
					break;
				case 'h':
					this.clearLightHelpers();
					break;
				case 's':
					this.showScreenPositions();
					break;
				case 'p':
					this.demoScreenPositions();
					break;
				// Chair animation controls
			}
		});
	}

	animate() {
		requestAnimationFrame(() => this.animate());

		// Update chair rotation animation
		if (this.chairModel) {
			this.chairAnimationTime += 0.016; // Increment time (roughly 60 FPS)

			// Calculate the rotation using sine wave for smooth back-and-forth motion
			const rotationOffset =
				Math.sin(this.chairAnimationTime * this.chairRotationSpeed) *
				this.chairRotationAmplitude;

			// Apply the rotation (base rotation + animated offset)
			this.chairModel.rotation.y =
				this.chairBaseRotationY + rotationOffset;

			// add move little bat back and forth
		}

		// Update controls
		if (this.controls) {
			this.controls.update();
		}

		// Render both WebGL and CSS3D scenes
		this.renderer.render(this.scene, this.camera);
		this.css3dRenderer.render(this.css3dScene, this.camera);
	}
}

// Initialize the room portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const roomPortfolio = new RoomPortfolio();

	// Make roomPortfolio globally accessible
	window.roomPortfolio = roomPortfolio;
});
