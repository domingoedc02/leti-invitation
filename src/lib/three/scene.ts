import {
	Color,
	DirectionalLight,
	HemisphereLight,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer
} from 'three';
import { createBunny, type Bunny } from './bunny';
import { detectQuality, type Quality } from './quality';

/**
 * The single WebGL context for the whole invitation.
 *
 * Deliberately a module singleton that lives for the life of the page: the gate
 * screen and the invitation are the same route, so the context is created once and
 * survives the transition between them. Creating a second context on mobile Safari
 * is a good way to have the first one silently killed.
 *
 * Everything the components need is exposed as a plain function, so no component
 * ever has to hold a renderer, a camera or a mesh.
 */

const FOV = 45;
const CAMERA_DISTANCE = 10;

let renderer: WebGLRenderer | undefined;
let scene: Scene | undefined;
let camera: PerspectiveCamera | undefined;
let bunny: Bunny | undefined;
let quality: Quality | undefined;

let anchor: HTMLElement | null = null;
let anchorVisible = false;
let anchorObserver: IntersectionObserver | undefined;

let running = false;
let lastFrame = 0;
let elapsed = 0;
let viewportWidth = 0;
let viewportHeight = 0;
let worldPerPx = 1;

/** Reads the live tilt signal. Injected so this module stays free of Svelte. */
let readTilt: () => { x: number; y: number } = () => ({ x: 0, y: 0 });

/** How many world units one CSS pixel covers on the z = 0 plane. */
function computeScale() {
	const visibleHeight = 2 * CAMERA_DISTANCE * Math.tan((FOV * Math.PI) / 360);
	worldPerPx = viewportHeight > 0 ? visibleHeight / viewportHeight : 1;
}

/** Converts a point in viewport CSS pixels into world units on the z = 0 plane. */
function screenToWorld(px: number, py: number): { x: number; y: number } {
	return {
		x: (px - viewportWidth / 2) * worldPerPx,
		y: -(py - viewportHeight / 2) * worldPerPx
	};
}

function resize() {
	if (!renderer || !camera || !quality) return;

	viewportWidth = window.innerWidth;
	viewportHeight = window.innerHeight;

	renderer.setPixelRatio(quality.pixelRatio);
	renderer.setSize(viewportWidth, viewportHeight, true);
	camera.aspect = viewportWidth / viewportHeight;
	camera.updateProjectionMatrix();

	computeScale();
}

let resizeTimer: ReturnType<typeof setTimeout> | undefined;
function onResize() {
	// Mobile browsers fire resize continuously while the URL bar collapses, so the
	// actual work is debounced rather than run dozens of times per scroll.
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(resize, 150);
}

function frame(time: number) {
	if (!renderer || !scene || !camera) return;

	const delta = lastFrame === 0 ? 0.016 : Math.min((time - lastFrame) / 1000, 0.05);
	lastFrame = time;
	elapsed += delta;

	const tilt = readTilt();

	if (bunny) {
		if (anchor && anchorVisible) {
			// Track the anchor every frame so the bunny stays glued to its spot on
			// the page while the guest scrolls.
			const rect = anchor.getBoundingClientRect();
			const centre = screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
			// The rig is about 2 world units tall from feet to ear tips.
			bunny.place(centre.x, centre.y - rect.height * worldPerPx * 0.12, (rect.height * worldPerPx) / 2.1);
			bunny.group.visible = true;

			bunny.update(delta, elapsed, tilt.x, tilt.y);
		} else {
			bunny.group.visible = false;
		}
	}

	renderer.render(scene, camera);
}

function start() {
	if (running || !renderer) return;
	running = true;
	lastFrame = 0;
	renderer.setAnimationLoop(frame);
}

function stop() {
	if (!running || !renderer) return;
	running = false;
	renderer.setAnimationLoop(null);
}

function onVisibilityChange() {
	// A backgrounded tab should not be spending the guest's battery on decoration.
	if (document.hidden) stop();
	else start();
}

export interface MountOptions {
	canvas: HTMLCanvasElement;
	reducedMotion: boolean;
	tilt: () => { x: number; y: number };
}

/** Creates the context and starts rendering. Returns the chosen quality tier. */
export function mountScene({ canvas, reducedMotion, tilt }: MountOptions): Quality {
	quality = detectQuality(reducedMotion);
	readTilt = tilt;

	if (!quality.webgl) return quality;

	try {
		renderer = new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: quality.antialias,
			powerPreference: 'high-performance'
		});
	} catch {
		// A context can still fail to materialise even when the probe succeeded
		// (driver blocklists, too many live contexts). Fall back to no 3D at all.
		quality = { ...quality, webgl: false, tier: 'off' };
		return quality;
	}

	renderer.outputColorSpace = SRGBColorSpace;
	renderer.setClearColor(new Color(0x000000), 0);

	scene = new Scene();
	camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
	camera.position.z = CAMERA_DISTANCE;

	// Soft, high-key lighting to match the watercolour artwork: warm sky, blush
	// bounce from below, and one gentle key light.
	const hemisphere = new HemisphereLight(0xfff6ef, 0xf6c9ce, 2.1);
	const key = new DirectionalLight(0xffffff, 1.9);
	key.position.set(2.5, 4, 3.5);
	scene.add(hemisphere, key);

	viewportWidth = window.innerWidth;
	viewportHeight = window.innerHeight;
	computeScale();

	bunny = createBunny();
	bunny.group.visible = false;
	scene.add(bunny.group);

	resize();

	window.addEventListener('resize', onResize, { passive: true });
	window.addEventListener('orientationchange', onResize, { passive: true });
	document.addEventListener('visibilitychange', onVisibilityChange);

	start();
	return quality;
}

export function unmountScene() {
	stop();
	clearTimeout(resizeTimer);
	window.removeEventListener('resize', onResize);
	window.removeEventListener('orientationchange', onResize);
	document.removeEventListener('visibilitychange', onVisibilityChange);
	anchorObserver?.disconnect();
	anchorObserver = undefined;
	anchor = null;

	bunny?.dispose();
	scene?.clear();
	// Hands the GPU memory and the context itself back.
	renderer?.dispose();
	renderer?.forceContextLoss();

	renderer = undefined;
	scene = undefined;
	camera = undefined;
	bunny = undefined;
}

/**
 * Tells the scene which element on the page the bunny should stand on. The bunny
 * is only animated and drawn while that element is actually on screen.
 */
export function setBunnyAnchor(element: HTMLElement | null) {
	anchorObserver?.disconnect();
	anchor = element;
	anchorVisible = false;

	if (!element || typeof IntersectionObserver === 'undefined') {
		anchorVisible = Boolean(element);
		return;
	}

	anchorObserver = new IntersectionObserver(
		(entries) => {
			anchorVisible = entries[0]?.isIntersecting ?? false;
		},
		{ rootMargin: '15% 0px' }
	);
	anchorObserver.observe(element);
}

/** The bunny's happy spin: a fresh hop and a turn on the spot. Always safe to call. */
export function pokeBunny() {
	bunny?.poke();
}
