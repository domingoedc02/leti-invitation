/**
 * Decides how much 3D work this device should be asked to do.
 *
 * The invitation will be opened on cheap, old phones over mobile data, so the pixel
 * ratio and antialiasing scale down rather than assuming a fast device. `off` means:
 * do not create a WebGL context at all — the florals are plain DOM and unaffected, so
 * the only thing that tier loses is the 3D bunny.
 */
export type Tier = 'off' | 'low' | 'mid' | 'high';

export interface Quality {
	webgl: boolean;
	tier: Tier;
	pixelRatio: number;
	antialias: boolean;
}

/**
 * Renderers that are really the CPU wearing a GPU's name.
 *
 * A context that exists is not the same as a context worth using: when the driver
 * is missing or blocklisted, browsers quietly fall back to a software rasterizer.
 * Measured on this scene, that costs about 5 seconds of blocked main thread versus
 * 30ms on a real GPU — so these devices are far better off with no bunny at all.
 */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|basic render|basic display|mesa offscreen/i;

/** Cheap capability probe: make a context, ask what it is, then hand it straight back. */
function supportsWebGL(): boolean {
	try {
		const canvas = document.createElement('canvas');
		const gl =
			canvas.getContext('webgl2') ??
			canvas.getContext('webgl') ??
			canvas.getContext('experimental-webgl');
		if (!gl) return false;

		let usable = true;
		if (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext) {
			const info = gl.getExtension('WEBGL_debug_renderer_info');
			if (info) {
				// An unreadable name is not evidence of anything, so absence means "allow".
				const name = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '');
				usable = !SOFTWARE_RENDERER.test(name);
			}
			// Release it immediately; browsers cap how many live contexts exist.
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		}
		return usable;
	} catch {
		return false;
	}
}

export function detectQuality(reducedMotion: boolean): Quality {
	if (reducedMotion || typeof window === 'undefined' || !supportsWebGL()) {
		return { webgl: false, tier: 'off', pixelRatio: 1, antialias: false };
	}

	const cores = navigator.hardwareConcurrency ?? 4;
	// deviceMemory is Chromium-only; absent elsewhere, so treat unknown as mid.
	const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
	const dpr = window.devicePixelRatio || 1;

	let tier: Tier;
	if (cores <= 4 || memory <= 2) tier = 'low';
	else if (cores <= 6 || memory <= 4) tier = 'mid';
	else tier = 'high';

	return {
		webgl: true,
		tier,
		// Past 2x the extra pixels are invisible but the fill cost is very real.
		pixelRatio: Math.min(dpr, tier === 'low' ? 1.5 : 2),
		antialias: tier === 'high'
	};
}
