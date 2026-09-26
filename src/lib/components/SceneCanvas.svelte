<script lang="ts">
	import { onMount } from 'svelte';
	import { motion } from '$lib/motion.svelte';
	import { tilt } from '$lib/pointer.svelte';
	import { mountScene, unmountScene } from '$lib/three';

	/**
	 * Hosts the one and only WebGL canvas, fixed over the whole invitation.
	 *
	 * It draws exactly one thing: the 3D bunny, aimed at the .stage box in
	 * Closing.svelte. The florals are not here — they are one frame of plain DOM inside
	 * the scrolling page (see FloralFrame.svelte), which is what lets them stay with the
	 * page as it scrolls instead of riding the viewport.
	 *
	 * It is purely decorative, so it is hidden from assistive technology and can
	 * never receive focus or a tap. The bunny is made interactive by a real
	 * <button> placed over it in Closing.svelte instead.
	 */
	let canvas: HTMLCanvasElement | undefined = $state();
	let webgl = $state(false);
	let mounted = $state(false);

	onMount(() => {
		let gone = false;
		let started = false;

		/**
		 * Fetching three.js and building the scene costs a couple of long tasks, and
		 * doing it during hydration makes the guest wait to tap on something purely
		 * decorative. So it waits for the main thread to go quiet first — but the first
		 * gesture promotes the load anyway, because a guest who is touching the screen
		 * is a guest who will reach the bunny, and three should already be resident by
		 * the time they scroll to it. Whichever comes first wins.
		 *
		 * The `timeout` only ever fires on a phone that never goes idle, which is
		 * exactly the phone that should be finishing the invitation's own paint rather
		 * than starting on decoration — so it is generous on purpose. A device with a spare
		 * moment reaches `start` long before it expires.
		 */
		function start() {
			if (started || gone || !canvas) return;
			started = true;
			stopWaiting();

			void mountScene({
				canvas,
				reducedMotion: motion.reduced,
				tilt: () => ({ x: tilt.x, y: tilt.y })
			}).then((quality) => {
				if (gone) return;
				// No quality at all means three never loaded: same outcome as no WebGL.
				webgl = quality?.webgl ?? false;
				mounted = true;
			});
		}

		const idle =
			'requestIdleCallback' in window
				? requestIdleCallback(start, { timeout: 3000 })
				: setTimeout(start, 400);

		function stopWaiting() {
			if ('requestIdleCallback' in window) cancelIdleCallback(idle as number);
			else clearTimeout(idle as ReturnType<typeof setTimeout>);
			removeEventListener('pointerdown', start, true);
			removeEventListener('keydown', start, true);
		}

		// Capture, so a tap starts the download before any handler can stop propagating.
		addEventListener('pointerdown', start, { capture: true, passive: true });
		addEventListener('keydown', start, { capture: true, passive: true });

		return () => {
			gone = true;
			stopWaiting();
			unmountScene();
		};
	});
</script>

<div class="layer" aria-hidden="true" role="presentation">
	<canvas bind:this={canvas} class:hidden={mounted && !webgl}></canvas>
</div>

<style>
	/**
	 * Above the invitation and below the gate — see the layer-order note in app.css.
	 * It used to sit at z-index 30, above everything, because the floral frame was
	 * painted here and had to cover the gate too. Now that the canvas carries only the
	 * bunny it belongs where the bunny does: over the invitation it stands on, and
	 * under the gate that hides the invitation entirely.
	 *
	 * Nothing else needs to keep off it. The bunny is confined to the .stage box it
	 * tracks, and there is no text under that box.
	 */
	.layer {
		position: fixed;
		inset: 0;
		z-index: 3;
		/* Decorative only: taps must always reach the invitation underneath. */
		pointer-events: none;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	/* No WebGL at all: hide the canvas outright. There is nothing to fall back to
	   because nothing was lost but the bunny — every garland on the page is DOM. */
	.hidden {
		display: none;
	}
</style>
