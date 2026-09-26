import type { Action } from 'svelte/action';
import { tilt } from '../pointer.svelte';
import { motion } from '../motion.svelte';

/**
 * Writes the shared tilt signal onto an element as --parallax-x / --parallax-y in
 * pixels, so a background layer can drift as the phone moves. The element decides
 * how to use them, which keeps the maths here and the design in the component.
 */
export const parallax: Action<HTMLElement, { strength?: number } | undefined> = (node, params) => {
	let strength = params?.strength ?? 12;
	let frame = 0;

	const apply = () => {
		frame = 0;
		if (motion.reduced) {
			node.style.setProperty('--parallax-x', '0px');
			node.style.setProperty('--parallax-y', '0px');
			return;
		}
		node.style.setProperty('--parallax-x', `${(-tilt.x * strength).toFixed(2)}px`);
		node.style.setProperty('--parallax-y', `${(-tilt.y * strength).toFixed(2)}px`);
	};

	// $effect.root lets a plain action subscribe to runes outside a component.
	const stop = $effect.root(() => {
		$effect(() => {
			// Touch both so the effect re-runs when either changes, then batch the
			// actual style write into a frame to avoid layout thrash.
			void tilt.x;
			void tilt.y;
			void motion.reduced;
			if (!frame) frame = requestAnimationFrame(apply);
		});
	});

	return {
		update(next) {
			strength = next?.strength ?? 12;
		},
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			stop();
		}
	};
};
