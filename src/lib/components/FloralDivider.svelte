<script lang="ts">
	import { reveal } from '$lib/actions/reveal';

	/**
	 * A gold rule with a little bloom in the middle, drawn on as it scrolls in.
	 * Decorative, so it is hidden from assistive technology entirely.
	 */
	let { flip = false }: { flip?: boolean } = $props();
</script>

<div class="divider" class:flip use:reveal aria-hidden="true" role="presentation">
	<svg viewBox="0 0 320 40" width="320" height="40" fill="none" focusable="false">
		<path class="line" d="M6 20 H118" stroke="var(--gold-light)" stroke-width="1.4" stroke-linecap="round" />
		<path class="line" d="M202 20 H314" stroke="var(--gold-light)" stroke-width="1.4" stroke-linecap="round" />

		<g class="bloom">
			<!-- Five petals around a golden centre. -->
			{#each [0, 1, 2, 3, 4] as petal (petal)}
				<ellipse
					cx="160"
					cy="10.5"
					rx="5.6"
					ry="9"
					fill="var(--blush)"
					stroke="var(--rose)"
					stroke-width="0.8"
					transform="rotate({petal * 72} 160 20)"
				/>
			{/each}
			<circle cx="160" cy="20" r="4" fill="var(--gold-light)" stroke="var(--gold)" stroke-width="0.8" />
		</g>

		<path d="M132 20 q6 -7 12 0 q-6 7 -12 0" fill="var(--rose)" opacity="0.65" />
		<path d="M176 20 q6 -7 12 0 q-6 7 -12 0" fill="var(--rose)" opacity="0.65" />
	</svg>
</div>

<style>
	.divider {
		display: flex;
		justify-content: center;
		padding-block: var(--space-m);
	}

	.flip svg {
		scale: -1 1;
	}

	svg {
		width: min(20rem, 78%);
		height: auto;
	}

	.line {
		stroke-dasharray: 120;
		--dash: 120;
		animation: draw-line 1.1s var(--ease-soft) both;
	}

	.bloom {
		transform-box: fill-box;
		transform-origin: center;
		animation: pop-in 700ms var(--ease-bounce) 500ms both;
	}

	/* The divider only animates once it has scrolled into view. */
	.divider:not(:global(.is-visible)) .line,
	.divider:not(:global(.is-visible)) .bloom {
		animation-play-state: paused;
	}
</style>
