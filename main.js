import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
// Add your own CSS3D imports here

class RoomPortfolio {
	constructor() {
		this.scene = new THREE.Scene();
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
		// Add your own CSS3D renderer here
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

		// Add your own CSS3D renderer setup here
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

	setupEventListeners() {
		// Handle window resize
		window.addEventListener('resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
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

		this.renderer.render(this.scene, this.camera);
	}
}

// Initialize the room portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const roomPortfolio = new RoomPortfolio();

	// Make roomPortfolio globally accessible
	window.roomPortfolio = roomPortfolio;
});
