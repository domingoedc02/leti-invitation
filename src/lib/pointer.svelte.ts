import { browser } from '$app/environment';

/**
 * A single shared "where is the guest looking" signal in the range -1..1 on both
 * axes, fed by whichever input the device actually has:
 *
 *   - phone tilt  (DeviceOrientationEvent, the nicest one)
 *   - finger drag or mouse position
 *
 * Both the 3D bunny's head tilt and the background parallax read from here, so
 * they always agree with each other and we only ever attach one set of listeners.
 */
let x = $state(0);
let y = $state(0);
let hasOrientation = $state(false);

/** Smoothing, so a jittery accelerometer doesn't make the bunny twitch. */
const ease = 0.12;
let targetX = 0;
let targetY = 0;
let frame = 0;

function clamp(n: number) {
	return Math.max(-1, Math.min(1, n));
}

function tick() {
	x += (targetX - x) * ease;
	y += (targetY - y) * ease;
	// Settle exactly, otherwise this loop never stops asymptotically approaching.
	if (Math.abs(targetX - x) < 0.001 && Math.abs(targetY - y) < 0.001) {
		x = targetX;
		y = targetY;
		frame = 0;
		return;
	}
	frame = requestAnimationFrame(tick);
}

function nudge(nx: number, ny: number) {
	targetX = clamp(nx);
	targetY = clamp(ny);
	if (!frame) frame = requestAnimationFrame(tick);
}

function onOrientation(event: DeviceOrientationEvent) {
	if (event.gamma === null || event.beta === null) return;
	hasOrientation = true;
	// gamma is the left/right roll; beta is the front/back pitch. A phone held
	// comfortably sits around beta 45, so that is treated as the neutral centre.
	nudge(event.gamma / 40, (event.beta - 45) / 40);
}

function onPointer(event: PointerEvent) {
	// Once the accelerometer is talking, ignore the mouse so the two don't fight.
	if (hasOrientation) return;
	nudge(
		(event.clientX / window.innerWidth) * 2 - 1,
		(event.clientY / window.innerHeight) * 2 - 1
	);
}

if (browser) {
	window.addEventListener('pointermove', onPointer, { passive: true });
	// Non-iOS devices stream orientation without asking; iOS needs the request below.
	window.addEventListener('deviceorientation', onOrientation, { passive: true });
}

type PermissionCapableDeviceOrientation = typeof DeviceOrientationEvent & {
	requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
};

/**
 * iOS 13+ only hands out motion data if you ask from inside a real user gesture.
 * The invitation's "tap to open" is exactly that gesture, so this is called from
 * there. A refusal is completely fine - pointer input takes over.
 */
export async function requestOrientationPermission(): Promise<void> {
	if (!browser) return;
	const ctor = window.DeviceOrientationEvent as PermissionCapableDeviceOrientation | undefined;
	if (typeof ctor?.requestPermission !== 'function') return;
	try {
		const result = await ctor.requestPermission();
		if (result === 'granted') {
			window.addEventListener('deviceorientation', onOrientation, { passive: true });
		}
	} catch {
		// Denied, or fired outside a gesture. Pointer input already works.
	}
}

export const tilt = {
	get x() {
		return x;
	},
	get y() {
		return y;
	}
};
