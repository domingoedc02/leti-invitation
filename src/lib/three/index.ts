import { detectQuality, type Quality } from './quality';
import type { MountOptions } from './scene';

/**
 * A three-free front door to the 3D layer.
 *
 * three.js is about 130KB gzipped, which is more than everything else on this page
 * put together. Importing it eagerly would hold up the first tap on mobile data for
 * no good reason: the gate is fully readable and tappable straight from prerendered
 * HTML, and the florals are plain DOM that never needed three at all.
 *
 * So `./scene` — and with it three itself — is fetched only after mount, and this
 * module holds the handful of calls that can arrive before it lands. Every function
 * here is safe to call at any time, including before the scene exists and after a
 * failed download.
 */
type SceneModule = typeof import('./scene');

let scene: SceneModule | null = null;
let loading: Promise<SceneModule | null> | null = null;

/** Set by Closing.svelte, which may mount before the module has downloaded. */
let anchor: HTMLElement | null = null;

function load(): Promise<SceneModule | null> {
	loading ??= import('./scene').then(
		(module) => (scene = module),
		(error) => {
			// A chunk that fails to load is not worth breaking the invitation over:
			// SceneCanvas simply hides the canvas when no quality comes back, and the
			// florals were never three's job in the first place.
			console.warn('[leti] the 3D layer could not be loaded', error);
			return null;
		}
	);
	return loading;
}

/**
 * Downloads the scene, then starts it. Resolves to `null` if three is unavailable,
 * which the caller should treat exactly like "no WebGL".
 */
export async function mountScene(options: MountOptions): Promise<Quality | null> {
	/**
	 * Decide before downloading, not after.
	 *
	 * `detectQuality` is deliberately three-free, so a device that cannot usefully
	 * run the scene — no WebGL, a software rasterizer, or reduced motion requested —
	 * never fetches the 130KB three.js chunk at all. It loses only the bunny.
	 */
	const local = detectQuality(options.reducedMotion);
	if (!local.webgl) return local;

	const module = await load();
	if (!module) return null;

	const quality = module.mountScene(options);

	// Replay anything that happened while the download was still in flight.
	if (anchor) module.setBunnyAnchor(anchor);

	return quality;
}

export function unmountScene() {
	scene?.unmountScene();
}

export function setBunnyAnchor(element: HTMLElement | null) {
	anchor = element;
	scene?.setBunnyAnchor(element);
}

export function pokeBunny() {
	scene?.pokeBunny();
}
