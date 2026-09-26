import {
	Color,
	DataTexture,
	Group,
	Mesh,
	MeshToonMaterial,
	NearestFilter,
	RedFormat,
	SphereGeometry,
	CapsuleGeometry,
	CircleGeometry,
	type BufferGeometry,
	type Material
} from 'three';

/**
 * Leti's bunny mascot, assembled in code out of spheres and capsules.
 *
 * There is no bunny model file in this project, and downloading a glTF would cost
 * more bytes than the rest of the page put together, so the little fellow is built
 * from primitives and toon-shaded to match the watercolour bunny in the artwork.
 *
 * The rig is a nest of Groups so that each motion can be authored independently:
 *
 *   root ......... placed to line up with a DOM element, carries the hop
 *     lean ....... whole-body lean and the happy spin
 *       squash ... squash and stretch
 *         body
 *         head ... follows the guest's finger or phone tilt
 *           ears . jiggle, lagging behind the head like real ears do
 */

/** Three flat bands of light, which is what gives MeshToonMaterial its look. */
function toonGradient(): DataTexture {
	const steps = new Uint8Array([96, 165, 220, 255]);
	const texture = new DataTexture(steps, steps.length, 1, RedFormat);
	texture.minFilter = NearestFilter;
	texture.magFilter = NearestFilter;
	texture.generateMipmaps = false;
	texture.needsUpdate = true;
	return texture;
}

export interface Bunny {
	group: Group;
	update(delta: number, elapsed: number, tiltX: number, tiltY: number): void;
	/** Place the bunny over a rectangle of the page, in world units. */
	place(x: number, y: number, scale: number): void;
	/** A happy spin plus an extra-high hop. */
	poke(): void;
	dispose(): void;
}

export function createBunny(): Bunny {
	const gradientMap = toonGradient();
	const geometries: BufferGeometry[] = [];
	const materials: Material[] = [];

	function material(hex: string) {
		const m = new MeshToonMaterial({ color: new Color().setStyle(hex), gradientMap });
		materials.push(m);
		return m;
	}

	const fur = material('#FBF4EC');
	const furShade = material('#EFE0D2');
	const pink = material('#F4A6B8');
	const pinkSoft = material('#F9C6D0');
	const dark = material('#4A3038');
	const petalWhite = material('#FFFFFF');
	const gold = material('#E8C98A');

	function add(parent: Group, geometry: BufferGeometry, mat: Material) {
		geometries.push(geometry);
		const mesh = new Mesh(geometry, mat);
		parent.add(mesh);
		return mesh;
	}

	// ── Rig ──────────────────────────────────────────────────────────────────
	const root = new Group();
	const lean = new Group();
	const squash = new Group();
	const body = new Group();
	const head = new Group();
	const earL = new Group();
	const earR = new Group();

	root.add(lean);
	lean.add(squash);
	squash.add(body, head);
	head.add(earL, earR);

	// ── Body ─────────────────────────────────────────────────────────────────
	// A soft pear: a big lower sphere with a smaller chest sitting on top.
	const haunches = add(body, new SphereGeometry(0.56, 20, 16), fur);
	haunches.position.set(0, -0.46, -0.02);
	haunches.scale.set(1, 0.92, 0.95);

	const chest = add(body, new SphereGeometry(0.42, 20, 16), fur);
	chest.position.set(0, 0.02, 0.06);

	// Feet: two flattened spheres peeking out at the front.
	for (const side of [-1, 1]) {
		const foot = add(body, new SphereGeometry(0.17, 14, 12), fur);
		foot.position.set(side * 0.24, -0.9, 0.24);
		foot.scale.set(1, 0.58, 1.35);

		const paw = add(body, new SphereGeometry(0.115, 12, 10), fur);
		paw.position.set(side * 0.33, -0.2, 0.28);
		paw.scale.set(0.85, 1.15, 0.85);
	}

	// A fluffy tail at the back.
	const tail = add(body, new SphereGeometry(0.19, 14, 12), petalWhite);
	tail.position.set(0, -0.44, -0.52);

	// ── Head ─────────────────────────────────────────────────────────────────
	head.position.set(0, 0.5, 0.04);

	const skull = add(head, new SphereGeometry(0.44, 24, 20), fur);
	skull.scale.set(1, 0.94, 0.94);

	const muzzle = add(head, new SphereGeometry(0.2, 16, 14), fur);
	muzzle.position.set(0, -0.12, 0.33);
	muzzle.scale.set(1.15, 0.8, 0.9);

	const nose = add(head, new SphereGeometry(0.052, 12, 10), pink);
	nose.position.set(0, -0.07, 0.5);
	nose.scale.set(1.3, 0.85, 0.8);

	// Eyes are kept as separate meshes so they can be squashed for a blink.
	const eyes: Mesh[] = [];
	for (const side of [-1, 1]) {
		const eye = add(head, new SphereGeometry(0.068, 14, 12), dark);
		eye.position.set(side * 0.165, 0.02, 0.385);
		eyes.push(eye);

		// A tiny highlight, which is most of what makes the eyes read as friendly.
		const glint = add(head, new SphereGeometry(0.022, 8, 8), petalWhite);
		glint.position.set(side * 0.145, 0.06, 0.435);

		const cheek = add(head, new CircleGeometry(0.075, 14), pinkSoft);
		cheek.position.set(side * 0.28, -0.1, 0.33);
		cheek.rotation.y = side * 0.45;
	}

	// ── Ears ─────────────────────────────────────────────────────────────────
	for (const [ear, side] of [
		[earL, -1],
		[earR, 1]
	] as const) {
		ear.position.set(side * 0.16, 0.3, -0.04);
		ear.rotation.z = side * 0.2;

		const outer = add(ear, new CapsuleGeometry(0.11, 0.42, 6, 12), fur);
		outer.position.y = 0.3;
		outer.scale.set(1, 1, 0.48);

		const inner = add(ear, new CapsuleGeometry(0.068, 0.32, 5, 10), pinkSoft);
		inner.position.set(0, 0.3, 0.035);
		inner.scale.set(1, 1, 0.3);
	}

	// ── The little flower, matching the bunny in the artwork ──────────────────
	const flower = new Group();
	flower.position.set(-0.3, 0.26, 0.2);
	flower.rotation.set(0.2, -0.5, 0.35);
	head.add(flower);

	for (let i = 0; i < 5; i += 1) {
		const angle = (i / 5) * Math.PI * 2;
		const petal = add(flower, new SphereGeometry(0.055, 10, 8), petalWhite);
		petal.position.set(Math.cos(angle) * 0.062, Math.sin(angle) * 0.062, 0);
		petal.scale.set(1, 1, 0.42);
	}
	const pollen = add(flower, new SphereGeometry(0.032, 10, 8), gold);
	pollen.position.z = 0.02;

	// Shade the undersides very slightly so the silhouette stays readable against
	// the pale background rather than dissolving into it.
	haunches.material = fur;
	tail.material = furShade;

	// ── Animation state ──────────────────────────────────────────────────────
	let hopStart = -Infinity;
	let nextHopAt = 2.5;
	const HOP_SECONDS = 0.66;
	let hopHeight = 0.42;

	let blinkStart = -Infinity;
	let nextBlinkAt = 3;
	const BLINK_SECONDS = 0.14;

	let spinStart = -Infinity;
	const SPIN_SECONDS = 0.85;

	/** The resting y that place() parks the bunny at; the hop is added on top. */
	let rootBaseY = 0;
	/** Latest elapsed time, so poke() can schedule against the same clock. */
	let lastElapsed = 0;

	// Eased head angles, so the bunny turns smoothly instead of snapping.
	let headYaw = 0;
	let headPitch = 0;

	const baseScale = { value: 1 };

	return {
		group: root,

		place(x, y, scale) {
			root.position.x = x;
			rootBaseY = y;
			baseScale.value = scale;
			root.scale.setScalar(scale);
		},

		update(delta, elapsed, tiltX, tiltY) {
			lastElapsed = elapsed;

			// ── Breathing ───────────────────────────────────────────────────────
			const breath = Math.sin(elapsed * 1.7);
			let scaleY = 1 + breath * 0.022;
			let scaleXZ = 1 - breath * 0.016;

			// ── Hop ─────────────────────────────────────────────────────────────
			if (elapsed > nextHopAt) {
				hopStart = elapsed;
				hopHeight = 0.34 + Math.random() * 0.2;
				// Long, unpredictable gaps read as a calm animal rather than a toy.
				nextHopAt = elapsed + HOP_SECONDS + 3.2 + Math.random() * 3.6;
			}

			const hopProgress = (elapsed - hopStart) / HOP_SECONDS;
			let hopY = 0;
			let airborne = false;

			if (hopProgress >= 0 && hopProgress <= 1) {
				if (hopProgress < 0.16) {
					// Anticipation: crouch before pushing off.
					const crouch = Math.sin((hopProgress / 0.16) * Math.PI);
					scaleY -= crouch * 0.13;
					scaleXZ += crouch * 0.1;
				} else {
					const flight = (hopProgress - 0.16) / 0.84;
					hopY = Math.sin(flight * Math.PI) * hopHeight;
					airborne = flight < 0.92;
					// Stretch on the way up, squash on the way down.
					const stretch = Math.cos(flight * Math.PI);
					scaleY += stretch * 0.09;
					scaleXZ -= stretch * 0.07;
					lean.rotation.x = -stretch * 0.1;
				}
			} else {
				lean.rotation.x += (0 - lean.rotation.x) * Math.min(1, delta * 6);
			}

			root.position.y = hopY * baseScale.value + rootBaseY;

			// ── Happy spin, triggered by a tap ──────────────────────────────────
			const spinProgress = (elapsed - spinStart) / SPIN_SECONDS;
			if (spinProgress >= 0 && spinProgress <= 1) {
				// Ease out so the spin lands softly facing forward again.
				const eased = 1 - (1 - spinProgress) ** 3;
				lean.rotation.y = eased * Math.PI * 2;
			} else {
				lean.rotation.y = 0;
			}

			squash.scale.set(scaleXZ, scaleY, scaleXZ);

			// ── Head follows the guest ──────────────────────────────────────────
			const targetYaw = tiltX * 0.42;
			const targetPitch = tiltY * 0.24;
			const follow = Math.min(1, delta * 3.5);
			headYaw += (targetYaw - headYaw) * follow;
			headPitch += (targetPitch - headPitch) * follow;
			head.rotation.y = headYaw;
			head.rotation.x = headPitch;

			// ── Ears lag behind the head, and flap during a hop ──────────────────
			const flap = airborne ? Math.sin(elapsed * 17) * 0.22 : 0;
			const jiggle = Math.sin(elapsed * 2.4) * 0.035;
			earL.rotation.z = -0.2 - headYaw * 0.5 - jiggle - flap;
			earR.rotation.z = 0.2 - headYaw * 0.5 + jiggle + flap;
			earL.rotation.x = earR.rotation.x = -headPitch * 0.35 + flap * 0.4;

			// ── Blink ───────────────────────────────────────────────────────────
			if (elapsed > nextBlinkAt) {
				blinkStart = elapsed;
				nextBlinkAt = elapsed + 2.4 + Math.random() * 4;
			}
			const blinkProgress = (elapsed - blinkStart) / BLINK_SECONDS;
			const lidClose =
				blinkProgress >= 0 && blinkProgress <= 1 ? Math.sin(blinkProgress * Math.PI) : 0;
			for (const eye of eyes) {
				eye.scale.y = 1 - lidClose * 0.88;
			}

			// The flower bounces a beat behind the head.
			flower.rotation.z = 0.35 + Math.sin(elapsed * 3.1) * 0.12 + (airborne ? flap * 0.5 : 0);
		},

		poke() {
			// Restart both the spin and a big hop from the next update.
			spinStart = lastElapsed;
			hopStart = lastElapsed;
			hopHeight = 0.62;
			nextHopAt = lastElapsed + HOP_SECONDS + 3;
		},

		dispose() {
			for (const geometry of geometries) geometry.dispose();
			for (const mat of materials) mat.dispose();
			gradientMap.dispose();
		}
	};
}
