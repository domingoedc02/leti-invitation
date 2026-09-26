<script lang="ts">
	/** A scattering of twinkling stars. Purely decorative. */
	let { count = 18, class: className = '' }: { count?: number; class?: string } = $props();

	// Deterministic placement so the server and client render identically and the
	// sparkles do not jump on hydration.
	const stars = $derived(
		Array.from({ length: count }, (_, i) => ({
			top: (i * 37 + 11) % 94,
			left: (i * 61 + 7) % 94,
			delay: ((i * 517) % 400) / 100,
			size: 3 + ((i * 7) % 5),
			duration: 2.4 + ((i * 13) % 20) / 10
		}))
	);
</script>

<div class="sparkles {className}" aria-hidden="true" role="presentation">
	{#each stars as star, i (i)}
		<span
			style:top="{star.top}%"
			style:left="{star.left}%"
			style:width="{star.size}px"
			style:height="{star.size}px"
			style:animation-delay="-{star.delay}s"
			style:animation-duration="{star.duration}s"
		></span>
	{/each}
</div>

<style>
	.sparkles {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	span {
		position: absolute;
		background: radial-gradient(circle, var(--white) 0%, var(--gold-light) 45%, transparent 70%);
		border-radius: 50%;
		animation-name: twinkle;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}
</style>
