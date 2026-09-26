<script lang="ts">
	import { party } from '$lib/party';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * The running order of the afternoon, as a timeline.
	 *
	 * A real <ol>, because a programme is chronological and that is what the element
	 * means. Deliberately *not* aria-hidden: the countdown's digits are the page's one
	 * hidden ordered list, and a second one here would be indistinguishable from it.
	 *
	 * The time sits above the activity rather than beside it. A two-column
	 * "1:00 – 1:30 | Opening Ceremony" grid looks tidier on a wide screen, but between the
	 * floral frame's two rails on a 320px phone it wraps every activity name to three
	 * lines, and at the largest OS font setting it clips outright.
	 */
</script>

<section class="program" aria-labelledby="program-heading">
	<h2 id="program-heading" class="heading" use:reveal>{party.text.programHeading}</h2>

	<p class="note" use:reveal={{ delay: 80 }}>{party.programNote}</p>

	<ol class="timeline" use:reveal={{ delay: 140 }}>
		{#each party.program as slot, i (slot.title)}
			<li style:--i={i} use:reveal={{ delay: 160 + i * 70 }}>
				<!-- The dash is for the eye only: a screen reader announcing "1:00 dash 1:30", or
				     running the two numbers together into one, is worse than the word "to". -->
				<p class="time">
					{slot.from}
					<span aria-hidden="true">&ndash;</span>
					<span class="sr-only">to</span>
					{slot.to}
				</p>
				<p class="title">{slot.title}</p>
				{#if slot.note}
					<p class="soft">{slot.note}</p>
				{/if}
			</li>
		{/each}
	</ol>
</section>

<style>
	.program {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-s);
		text-align: center;
	}

	.heading {
		font-size: var(--step-2);
		color: var(--rose-ink);
	}

	.note {
		max-width: 24rem;
		font-size: var(--step--1);
		color: var(--ink-soft);
	}

	/**
	 * Left-aligned inside a centred section, so every time reads down one column.
	 *
	 * Every measurement here that has to survive the reader's own font setting is in `em`:
	 * the gutter the dots sit in, the rail's end insets, and the gap between slots. A phone
	 * at 200% text then simply makes the whole timeline bigger instead of leaving the dots
	 * stranded off their line.
	 */
	.timeline {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.5em;
		width: 100%;
		max-width: 26rem;
		margin: var(--space-2xs) 0 0;
		/* The gutter the rail and the dots live in. */
		padding: 0 0 0 1.85em;
		text-align: start;
		list-style: none;
		/**
		 * At 200% text on a 320px phone the reading column between the rails is about
		 * 149px, and “Registration” alone wants 212px — an unbreakable word that ran out
		 * past the petals. `hyphens` breaks it where English allows (the document is
		 * `lang="en"`, which is what makes that work); `overflow-wrap` is the last resort
		 * for a name no dictionary knows.
		 */
		hyphens: auto;
		overflow-wrap: break-word;
	}

	/**
	 * The rail. It runs from the first dot's centre to the last one's, not the full height
	 * of the list — a line overshooting past the final dot reads as an unfinished
	 * programme. Both insets are the same distance from the top of a row that the dot is.
	 */
	.timeline::before {
		content: '';
		position: absolute;
		inset-block: 0.62em;
		inset-inline-start: 0.28em;
		width: 2px;
		background: linear-gradient(
			to bottom,
			var(--gold-light) 0%,
			var(--gold-light) 88%,
			rgb(214 92 127 / 0%) 100%
		);
		border-radius: 1px;
		transform-origin: top;
	}

	/* Draws downward as the timeline scrolls in. Under reduced motion the blanket
	   `animation-duration: 1ms` in app.css lands it straight on its end state. */
	.timeline:global(.is-visible)::before {
		animation: grow-line 900ms var(--ease-soft) both;
	}

	li {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.15em;
	}

	/* The dot on the rail. The white ring is what keeps it legible where the rail passes
	   behind it, the same trick the swatches used against the cream page. */
	li::before {
		content: '';
		position: absolute;
		inset-block-start: 0.4em;
		inset-inline-start: -1.85em;
		width: 0.62em;
		height: 0.62em;
		background: var(--rose);
		border-radius: 50%;
		box-shadow:
			0 0 0 3px var(--white),
			0 0 0 4px var(--gold-light);
		animation: pulse-soft 4.5s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.4s);
	}

	.time {
		font-size: var(--step--1);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		/* rose-ink, not gold: --gold is 2.4:1 and is for ornament only. */
		color: var(--rose-ink);
		font-variant-numeric: tabular-nums;
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--step-1);
		line-height: 1.25;
		color: var(--ink);
	}

	.soft {
		font-size: var(--step--1);
		font-style: italic;
		color: var(--ink-soft);
	}

	@keyframes grow-line {
		from {
			scale: 1 0;
		}
		to {
			scale: 1 1;
		}
	}
</style>
