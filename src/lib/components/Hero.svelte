<script lang="ts">
	import { party } from '$lib/party';
	import Picture from './Picture.svelte';
	import { reveal } from '$lib/actions/reveal';

	let { headingRef = $bindable<HTMLElement | undefined>() } = $props();
</script>

<section class="hero" aria-labelledby="hero-heading">
	<div class="inner">
		<p class="eyebrow" use:reveal>{party.text.heroEyebrow}</p>

		<!-- The tiara sits above the portrait: the princess note the theme asks for. -->
		<svg class="tiara" viewBox="0 0 120 54" width="120" height="54" aria-hidden="true" focusable="false">
			<path
				d="M8 46 L20 18 L36 36 L60 8 L84 36 L100 18 L112 46 Z"
				fill="var(--gold-light)"
				stroke="var(--gold)"
				stroke-width="2"
				stroke-linejoin="round"
			/>
			<circle cx="60" cy="6" r="5.5" fill="var(--rose)" stroke="var(--gold)" stroke-width="1.6" />
			<circle cx="20" cy="15" r="3.6" fill="var(--white)" stroke="var(--gold)" stroke-width="1.4" />
			<circle cx="100" cy="15" r="3.6" fill="var(--white)" stroke="var(--gold)" stroke-width="1.4" />
			<path d="M8 46 H112" stroke="var(--gold)" stroke-width="3.5" stroke-linecap="round" />
		</svg>

		<div class="portrait" use:reveal={{ delay: 120 }}>
			<div class="frame">
				<!-- Eager, but not high priority: the gate's artwork still paints first,
				     while Leti's portrait warms in the background so it is already there
				     the moment the invitation is revealed. Everything else here stays lazy,
				     because the gate skips rendering this whole subtree until it opens. -->
				<Picture
					name="leti"
					alt={party.text.heroPhotoAlt}
					sizes="(min-width: 40rem) 22rem, 68vw"
					loading="eager"
					class="portrait-img"
				/>
			</div>
			<span class="glow" aria-hidden="true"></span>
		</div>

		<h1 id="hero-heading" bind:this={headingRef} tabindex="-1" class="name">
			<span class="script shimmer">{party.childName}</span>
		</h1>

		<p class="turning" use:reveal={{ delay: 200 }}>
			<span class="turning-word">{party.text.heroTurningWord}</span>
			<span class="age" aria-hidden="true">{party.age}</span>
			<span class="sr-only">{party.age}</span>
		</p>

		<p class="tagline" use:reveal={{ delay: 300 }}>{party.tagline}</p>
	</div>
</section>

<style>
	.hero {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 100dvh;
		/* Clears the frame's top garland, which hangs `--frame-depth * 2` down from the
		   very top of the page, and its two rails at the sides. */
		padding-block: calc(var(--safe-top) + var(--frame-depth) * 2 + var(--space-s)) var(--space-2xl);
		padding-inline: calc(var(--frame-rail) + var(--space-2xs));
		overflow: hidden;
	}

	.inner {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		max-width: 26rem;
	}

	.eyebrow {
		font-size: var(--step--1);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--rose-ink);
	}

	.tiara {
		width: clamp(4.5rem, 18vw, 6.5rem);
		height: auto;
		margin-block: var(--space-s) calc(var(--space-xs) * -1);
		filter: drop-shadow(0 2px 4px rgb(160 120 40 / 25%));
		animation: float-soft 5s ease-in-out infinite;
	}

	.portrait {
		position: relative;
		margin-block: var(--space-s) var(--space-m);
		animation: float-soft 7s ease-in-out infinite 0.4s;
	}

	/* An oval, gold-rimmed frame around Leti. */
	.frame {
		position: relative;
		z-index: 1;
		width: min(17rem, 66vw);
		aspect-ratio: 1 / 1.18;
		overflow: hidden;
		border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%;
		background: linear-gradient(170deg, var(--white), var(--blush));
		box-shadow:
			0 0 0 3px var(--white),
			0 0 0 6px var(--gold-light),
			var(--shadow-lift);
	}

	.frame :global(.portrait-img),
	.frame :global(.portrait-img img) {
		width: 100%;
		height: 100%;
	}

	.frame :global(.portrait-img img) {
		object-fit: cover;
		/* Keeps her face in the oval rather than centring on the whole cutout. */
		object-position: center 18%;
		scale: 1.06;
	}

	/* A soft halo behind the frame. */
	.glow {
		position: absolute;
		inset: -12%;
		z-index: 0;
		background: radial-gradient(circle at 50% 45%, rgb(244 166 184 / 45%), transparent 68%);
		animation: pulse-soft 6s ease-in-out infinite;
	}

	.name {
		line-height: 1.2;
	}

	.script {
		font-family: var(--font-script);
		font-weight: 400;
		font-size: var(--step-5);
		padding-inline-end: 0.08em;
	}

	.turning {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-s);
		margin-block-start: var(--space-2xs);
	}

	.turning-word {
		font-family: var(--font-display);
		font-size: var(--step-1);
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}

	/* The big number: the single loudest thing on the page. */
	.age {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(4rem, 22vw, 7rem);
		line-height: 0.9;
		/**
		 * `background-clip: text` paints the gradient only inside this element's border
		 * box, and Playfair's 3 is an old-style figure whose tail drops about 0.1em below
		 * a 0.9 line box. The overhanging part was getting no gradient at all — measured
		 * at 8.5px unpainted on a 390px phone — which read as a flat cut across the
		 * bottom of the number.
		 *
		 * The padding grows the box the gradient may paint in; the equal negative margin
		 * takes the same space straight back out of the layout, so the margin box is
		 * exactly the height it was and nothing moves: not the tagline below, and not the
		 * optical centring against "turning" in this flex row. 0.18em rather than 0.1em
		 * because Georgia, the fallback face, descends further still.
		 */
		padding-block-end: 0.18em;
		margin-block-end: -0.18em;
		background-image: linear-gradient(160deg, var(--rose-display), var(--gold), var(--rose-display));
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		filter: drop-shadow(0 3px 6px rgb(214 92 127 / 28%));
		animation:
			pop-in 900ms var(--ease-bounce) 500ms both,
			pulse-soft 4.5s ease-in-out 1.4s infinite;
	}

	.tagline {
		font-family: var(--font-display);
		font-size: var(--step-1);
		font-style: italic;
		color: var(--rose-ink);
		/* The 3's tail is now actually painted (see .age above), and it reaches this far
		   down: measured 0.4px into this line's ascenders on a 390px phone and 1.4px on a
		   desktop. The ink was always there — it was only invisible — so this is the
		   clearance the line should have had all along. */
		margin-block-start: var(--space-xs);
	}

	/* Inside the card (see --card-width in app.css) there is room for a larger portrait
	   and a wider measure, so the hero fills the card rather than sitting in the middle of
	   it at phone size. `min(…, 66vw)` no longer does anything useful here: at this width
	   66vw is always the larger of the two.

	   33rem is the card's full content box — 40rem less the two rail gutters — and it is
	   chosen for the name: "Leticia Khloe" sets to about 495px of Parisienne at the 88px
	   cap of --step-5, so a narrower measure breaks it across two lines. Only the hero is
	   this wide; the reading sections below keep their own, tighter measures. */
	@media (min-width: 48rem) {
		.inner {
			max-width: 33rem;
		}

		.frame {
			width: 20rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* Keep the number visible: pop-in uses `both`, so a paused animation would
		   otherwise leave it stuck at 70% scale and transparent. */
		.age {
			animation: none;
		}
	}
</style>
