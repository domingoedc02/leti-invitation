import { browser } from '$app/environment';

/**
 * Whether this guest has asked their device to reduce motion.
 *
 * Read by the three.js layer (to skip the particle system and the bunny's hop
 * entirely) and by the reveal action. The CSS side of the same preference lives
 * in app.css. Kept reactive because the setting can change while the page is open.
 */
let reduced = $state(false);

if (browser) {
	const query = window.matchMedia('(prefers-reduced-motion: reduce)');
	reduced = query.matches;
	query.addEventListener('change', (event) => {
		reduced = event.matches;
	});
}

export const motion = {
	get reduced() {
		return reduced;
	}
};
