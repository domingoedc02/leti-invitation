import type { Action } from 'svelte/action';

/**
 * Fades a section up as it scrolls into view, using one shared observer for the
 * whole page rather than one per element.
 *
 * Under reduced motion the CSS in app.css already leaves `.reveal` fully visible,
 * so this action's class toggle simply becomes a no-op rather than a requirement.
 */
let observer: IntersectionObserver | undefined;

function ensureObserver(): IntersectionObserver {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-visible');
				// One-shot: sections do not fade back out when scrolled past.
				observer?.unobserve(entry.target);
			}
		},
		{ rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
	);
	return observer;
}

export const reveal: Action<HTMLElement, { delay?: number } | undefined> = (node, params) => {
	node.classList.add('reveal');
	if (params?.delay) node.style.setProperty('--reveal-delay', `${params.delay}ms`);

	// If IntersectionObserver is missing, show the content immediately rather than
	// leaving a guest staring at an invisible invitation.
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('is-visible');
		return;
	}

	const io = ensureObserver();
	io.observe(node);

	return {
		destroy() {
			io.unobserve(node);
		}
	};
};
