<script lang="ts">
	import { onMount } from 'svelte';
	import { party, startsAtDate } from '$lib/party';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * Ticking countdown to the party.
	 *
	 * The digits are hidden from assistive technology and a separate, coarser
	 * sentence is announced roughly once a minute instead. A live region that
	 * updated every second would make this page genuinely unusable with a screen
	 * reader, which is the opposite of the point.
	 */
	/** Pulled out because the derived array below reads all four of them. */
	const units = party.text.countdownUnits;

	let now = $state(Date.now());
	let spoken = $state('');

	const target = startsAtDate.getTime();
	const remaining = $derived(Math.max(0, target - now));
	const arrived = $derived(remaining === 0);

	const parts = $derived.by(() => {
		const total = Math.floor(remaining / 1000);
		return [
			{ label: units.days, value: Math.floor(total / 86400) },
			{ label: units.hours, value: Math.floor((total % 86400) / 3600) },
			{ label: units.minutes, value: Math.floor((total % 3600) / 60) },
			{ label: units.seconds, value: total % 60 }
		];
	});

	function summarise(ms: number): string {
		if (ms === 0) return `Today is ${party.childName}'s birthday party!`;
		const total = Math.floor(ms / 1000);
		const days = Math.floor(total / 86400);
		const hours = Math.floor((total % 86400) / 3600);
		const minutes = Math.floor((total % 3600) / 60);
		const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

		if (days > 0) return `${plural(days, 'day')} and ${plural(hours, 'hour')} until the party.`;
		if (hours > 0) return `${plural(hours, 'hour')} and ${plural(minutes, 'minute')} until the party.`;
		return `${plural(minutes, 'minute')} until the party.`;
	}

	onMount(() => {
		now = Date.now();
		spoken = summarise(Math.max(0, target - now));

		const tick = setInterval(() => (now = Date.now()), 1000);
		// The spoken summary is deliberately on its own, much slower, schedule.
		const speak = setInterval(() => (spoken = summarise(Math.max(0, target - Date.now()))), 60_000);

		return () => {
			clearInterval(tick);
			clearInterval(speak);
		};
	});
</script>

<section class="countdown" aria-labelledby="countdown-heading">
	<h2 id="countdown-heading" class="heading" use:reveal>
		{#if arrived}
			{party.text.countdownArrivedHeading}
		{:else}
			{party.text.countdownHeading}
		{/if}
	</h2>

	{#if arrived}
		<p class="today" use:reveal={{ delay: 100 }}>
			{party.text.countdownToday}
		</p>
	{:else}
		<!-- aria-hidden: the numbers change every second and are announced by the
		     polite summary below instead. -->
		<ol class="grid" use:reveal={{ delay: 100 }} aria-hidden="true">
			{#each parts as part (part.label)}
				<li class="cell">
					<!-- Keyed so Svelte replaces the span when the value changes, which
					     restarts the roll animation. -->
					{#key part.value}
						<span class="value">{String(part.value).padStart(2, '0')}</span>
					{/key}
					<span class="label">{part.label}</span>
				</li>
			{/each}
		</ol>
	{/if}

	<p class="sr-only" aria-live="polite" aria-atomic="true">{spoken}</p>
</section>

<style>
	.countdown {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-m);
		text-align: center;
	}

	.heading {
		font-size: var(--step-2);
		color: var(--rose-ink);
	}

	.today {
		font-family: var(--font-display);
		font-size: var(--step-1);
		font-style: italic;
		color: var(--ink);
	}

	.grid {
		display: grid;
		/**
		 * Four across on every normal phone, folding to two-by-two when it genuinely
		 * cannot hold four.
		 *
		 * The track minimum is in `em` on purpose: it is the one unit that tracks the
		 * reader's own font setting, so at 150% text the four 3.4em tracks no longer fit
		 * the reading column and auto-fit drops to two rows by itself. A `repeat(4, ...)`
		 * would instead keep four columns and crush the words inside them.
		 */
		grid-template-columns: repeat(auto-fit, minmax(3.4em, 1fr));
		gap: var(--space-xs);
		width: 100%;
		max-width: 24rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xs);
		/* Padding rather than a height, so larger font settings simply make the
		   card taller instead of clipping the number. */
		padding: var(--space-s) var(--space-2xs);
		background: rgb(255 255 255 / 78%);
		border: 1px solid var(--blush);
		border-radius: var(--radius-m);
		box-shadow: var(--shadow-soft);
	}

	.value {
		display: block;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--step-3);
		line-height: 1.1;
		color: var(--rose-display);
		font-variant-numeric: tabular-nums;
		animation: roll 420ms var(--ease-soft);
	}

	.label {
		/**
		 * Fluid, like the cell it sits in. Measured on a 320px phone: the frame's rails
		 * leave about 59px per cell, and "Seconds" at the full --step--1 with 0.1em of
		 * tracking is 69px wide -- which ran MINUTES and SECONDS together into one word.
		 *
		 * The `max()` keeps the rem floor above the vw term, so the label still grows
		 * with the reader's font setting instead of being pinned to the viewport.
		 */
		font-size: min(var(--step--1), max(0.7rem, 3.4vw));
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	@keyframes roll {
		from {
			opacity: 0;
			translate: 0 calc(-60% * var(--motion));
		}
		to {
			opacity: 1;
			translate: 0 0;
		}
	}
</style>
