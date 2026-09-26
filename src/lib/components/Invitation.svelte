<script lang="ts">
	import { party } from '$lib/party';
	import Hero from './Hero.svelte';
	import Countdown from './Countdown.svelte';
	import DetailsCard from './DetailsCard.svelte';
	import Program from './Program.svelte';
	import Closing from './Closing.svelte';
	import FloralDivider from './FloralDivider.svelte';
	import FloralFrame from './FloralFrame.svelte';
	import Picture from './Picture.svelte';

	let { headingRef = $bindable<HTMLElement | undefined>() } = $props();
</script>

<main id="invitation">
	<a class="skip-link" href="#details-heading">{party.text.skipLink}</a>

	<Hero bind:headingRef />

	<!-- One soft watercolour wash sits behind the whole middle of the invitation. -->
	<div class="body">
		<div class="wash" aria-hidden="true">
			<Picture name="wash-bg" alt="" decorative sizes="100vw" class="wash-img" />
		</div>

		<!-- The dividers alternate `flip` all the way down, so no two consecutive gold
		     rules mirror the same way. -->
		<div class="stack">
			<FloralDivider />
			<Countdown />
			<FloralDivider flip />
			<DetailsCard />
			<FloralDivider />
			<Program />
			<FloralDivider flip />
			<Closing />
		</div>
	</div>

	<!-- One frame around the whole invitation: the garland closes across the top of the
	     page, a lighter one across the bottom, and flowers run down both edges for the
	     entire scroll length in between. <main> is `position: relative` and spans the
	     whole document, so `inset: 0` is already the right box and nothing has to be
	     measured. Last child, deliberately — see the paint order note in app.css. -->
	<FloralFrame depth={2} />
</main>

<style>
	main {
		position: relative;
		z-index: 2;
		/* The same cream the body paints, stated here because from 48rem up this element
		   is a card sitting on the blush wash and has to be opaque over it. Below that
		   width it is the identical colour to what was already behind it. */
		background-color: var(--cream);
	}

	/**
	 * More screen than the invitation needs: it becomes a card, centred.
	 *
	 * This is the whole trick, and it is why there is nothing else to it. FloralFrame is
	 * already `position: absolute; inset: 0` inside this element, so capping the element
	 * brings the top garland, the bottom garland and both side rails in with it — no
	 * measuring, no scroll listener, no second layout to keep in step. The wash and the
	 * body gradient are children too, so they come along as well.
	 *
	 * `overflow: clip` trims the garlands to the card's rounded corners. Nothing inside
	 * needs to escape: the skip link's resting position is above the top edge, which is
	 * precisely where it is supposed to be invisible.
	 */
	@media (min-width: 48rem) {
		main {
			width: min(var(--card-width), 100%);
			margin-inline: auto;
			border-radius: var(--radius-l);
			overflow: clip;
			box-shadow: var(--shadow-lift);
		}
	}

	.body {
		position: relative;
		/* Fades from the hero's cream into the wash without a visible seam. */
		background: linear-gradient(to bottom, var(--cream) 0%, var(--cream-deep) 40%, var(--cream) 100%);
	}

	.wash {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		opacity: 0.55;
		pointer-events: none;
	}

	.wash :global(.wash-img),
	.wash :global(.wash-img img) {
		width: 100%;
		height: 100%;
	}

	.wash :global(.wash-img img) {
		object-fit: cover;
		object-position: center top;
	}

	.stack {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-l);
		/* A comfortable reading measure on a phone, centred on a tablet. */
		max-width: 32rem;
		margin-inline: auto;
		padding-block: var(--space-xl);
		/* The gutter the frame's two rails live in, so no line of text ever runs under a
		   petal. The extra --space-2xs is breathing room past the point where the rail's
		   mask has faded out entirely. */
		padding-inline: calc(var(--safe-left) + var(--frame-rail) + var(--space-2xs))
			calc(var(--safe-right) + var(--frame-rail) + var(--space-2xs));
	}

	/* Below the rule above, deliberately: it is the same specificity, so it only wins from
	   here. Inside the card the card is already the measure, and the 32rem cap was doing
	   harm — minus the two rail gutters it left the sections just 400px of a 640px card,
	   which is what kept "Add to calendar" wrapping inside its own pill. Every section
	   still carries its own max-width, so the reading measures do not change; they simply
	   have room to reach them. */
	@media (min-width: 48rem) {
		.stack {
			max-width: none;
		}
	}
</style>
