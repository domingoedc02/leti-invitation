<script lang="ts">
	import { party, ordinal } from '$lib/party';
	import Picture from './Picture.svelte';
	import Sparkles from './Sparkles.svelte';
	import FloralFrame from './FloralFrame.svelte';
	import { parallax } from '$lib/actions/parallax.svelte';

	/**
	 * The first thing every guest sees: a full-screen "You're Invited" card over the
	 * peeking-bunny artwork, which opens the invitation when tapped.
	 *
	 * The headings are real headings in normal flow, and a single transparent button
	 * is laid over the whole screen to catch the tap. Putting the headings *inside* a
	 * <button> would be invalid HTML and would stop screen readers announcing them
	 * as headings at all.
	 */
	let { onopen }: { onopen: () => void } = $props();
</script>

<div class="gate">
	<div class="art" use:parallax={{ strength: 10 }}>
		<Picture
			name="gate-bg"
			alt=""
			decorative
			priority
			sizes="100vw"
			class="art-img"
		/>
	</div>
	<div class="veil" aria-hidden="true"></div>
	<!-- The same frame the invitation wears, so the two read as one card. The gate never
	     scrolls, so here the frame's document happens to be a single screen. -->
	<FloralFrame depth={1.4} />
	<Sparkles count={22} class="gate-sparkles" />

	<div class="content">
		<p class="eyebrow">{party.text.gateEyebrow}</p>

		<h1 class="headline">
			<span class="script shimmer">{party.text.gateHeadline}</span>
		</h1>

		<div class="rule" aria-hidden="true">
			<span></span>
			<svg viewBox="0 0 24 24" width="14" height="14" focusable="false" aria-hidden="true">
				<path
					d="M12 21s-7.5-4.7-7.5-10a4.5 4.5 0 0 1 7.5-3.3A4.5 4.5 0 0 1 19.5 11c0 5.3-7.5 10-7.5 10Z"
					fill="var(--rose)"
				/>
			</svg>
			<span></span>
		</div>

		<p class="occasion">
			to <strong>{party.nickname}&rsquo;s</strong>
			<span class="nowrap">{ordinal(party.age)} Birthday</span>
		</p>
	</div>

	<p class="prompt" aria-hidden="true">
		<span class="prompt-text">{party.text.gatePrompt}</span>
		<svg viewBox="0 0 24 24" width="20" height="20" focusable="false">
			<path
				d="M6 10l6 6 6-6"
				fill="none"
				stroke="var(--rose-ink)"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</p>

	<!-- The real control. Covers the whole screen so any tap opens the invitation,
	     and carries the accessible name for the decorative prompt above. -->
	<button type="button" class="opener" onclick={() => onopen()}>
		{party.text.gateOpenLabel}
	</button>
</div>

<style>
	.gate {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: grid;
		/* Content sits in the upper cream area; the prompt pins to the bottom. */
		grid-template-rows: 1fr auto;
		overflow: hidden;
		background: var(--cream);
		/**
		 * No padding, deliberately. Everything decorative here is `position: absolute;
		 * inset: 0` and has to reach the screen's real edges — the frame most of all,
		 * since a frame inset from the screen is not a frame. Engines disagree about
		 * whether an absolutely positioned child of a *grid* container resolves its insets
		 * against the padding box or the border box (measured: Chrome says border box,
		 * the Grid spec says padding edge), so the gate carries none and the two rows
		 * below hold their own reading gutters instead.
		 */
		--gutter-inline: calc(var(--safe-left) + var(--frame-rail) + var(--space-2xs))
			calc(var(--safe-right) + var(--frame-rail) + var(--space-2xs));
	}

	.art {
		position: absolute;
		/* Slightly oversized so the parallax drift never exposes an edge. */
		inset: -14px;
		z-index: 0;
	}

	.art :global(.art-img),
	.art :global(.art-img img) {
		width: 100%;
		height: 100%;
	}

	.art :global(.art-img img) {
		object-fit: cover;
		/* Anchors the bunny, tulips and pink wall to the bottom of the screen; any
		   cropping happens in the empty cream sky instead. */
		object-position: center bottom;
		translate: var(--parallax-x, 0) var(--parallax-y, 0);
		scale: 1.04;
		animation: float-soft 14s ease-in-out infinite;
	}

	/* Lifts text contrast over the artwork without hiding the bunny. */
	.veil {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(
			to bottom,
			rgb(253 244 238 / 88%) 0%,
			rgb(253 244 238 / 72%) 32%,
			rgb(253 244 238 / 18%) 58%,
			rgb(253 244 238 / 0%) 72%
		);
	}

	.gate :global(.gate-sparkles) {
		z-index: 2;
	}

	/* Over the veil, so the flowers are not washed out by it. */
	.gate :global(.floral-frame) {
		z-index: 2;
	}

	.content {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		/* Clears the frame's top garland, and pulls the stack into the upper half, above
		   the bunny. */
		padding-block: calc(var(--safe-top) + var(--frame-depth) * 1.4) 22vh;
		padding-inline: var(--gutter-inline);
		text-align: center;
	}

	.eyebrow {
		font-size: var(--step--1);
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--rose-ink);
		animation: fade-up 900ms var(--ease-soft) 60ms both;
	}

	.headline {
		margin-block: var(--space-2xs) 0;
		/* The script face needs headroom for its descenders and swashes. */
		line-height: 1.25;
		/* Deliberately the quickest entrance on the screen. This is the largest thing
		   the guest paints, so a long fade here is measured as the page being slow —
		   the original 380ms delay plus a 1s fade put the Largest Contentful Paint at
		   3.5s on a throttled phone. The rest of the gate still cascades in behind it. */
		animation: fade-up 620ms var(--ease-soft) 100ms both;
	}

	.script {
		font-family: var(--font-script);
		font-weight: 400;
		font-size: var(--step-5);
		/* Optical centring: the script face leans right. */
		padding-inline-end: 0.08em;
	}

	.rule {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		width: min(15rem, 68%);
		margin-block: var(--space-s);
		animation: fade-up 900ms var(--ease-soft) 620ms both;
	}

	.rule span {
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, transparent, var(--gold-light), transparent);
	}

	.occasion {
		font-family: var(--font-display);
		font-size: var(--step-2);
		color: var(--ink);
		animation: fade-up 900ms var(--ease-soft) 760ms both;
	}

	.occasion strong {
		font-weight: 600;
		color: var(--rose-ink);
	}

	.nowrap {
		white-space: nowrap;
	}

	.prompt {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xs);
		color: var(--rose-ink);
		font-size: var(--step--1);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		/* Clears the frame's bottom garland and the home-bar area. */
		padding-block-end: calc(var(--safe-bottom) + var(--frame-depth) * 1.4 * 0.5 + var(--space-m));
		padding-inline: var(--gutter-inline);
		animation: fade-up 900ms var(--ease-soft) 1s both;
	}

	.prompt svg {
		animation: prompt-nudge 1.9s ease-in-out infinite;
	}

	.prompt-text {
		padding: var(--space-2xs) var(--space-m);
		background: rgb(255 255 255 / 72%);
		border-radius: var(--radius-pill);
		backdrop-filter: blur(3px);
	}

	@keyframes prompt-nudge {
		0%,
		100% {
			translate: 0 0;
			opacity: 0.55;
		}
		50% {
			translate: 0 calc(6px * var(--motion));
			opacity: 1;
		}
	}

	/* Invisible, full-screen, and still a genuine button: focusable, announced, and
	   operable with Enter or Space. */
	.opener {
		position: absolute;
		inset: 0;
		z-index: 4;
		width: 100%;
		/* The label is for assistive tech only; the visual prompt is above. */
		color: transparent;
		font-size: 0;
		background: none;
	}

	.opener:focus-visible {
		outline-offset: -6px;
	}

	@media (min-width: 40rem) {
		.content {
			padding-block-end: 26vh;
		}
	}

	/**
	 * More screen than the gate needs: the same card the invitation becomes.
	 *
	 * Not only for symmetry — the wallpaper is portrait (736x1308), so `object-fit: cover`
	 * on a landscape window cropped it to a horizontal band, slicing the bunny's head off
	 * and upscaling what was left about twice over. Held to a portrait card, the artwork
	 * is framed the way it was drawn and renders near its native size.
	 *
	 * This element is `position: fixed` with `inset: 0`; a definite width plus auto inline
	 * margins is what centres it between those two insets. The blush wash on either side
	 * is the one `body` carries, from app.css.
	 */
	@media (min-width: 48rem) {
		.gate {
			width: min(var(--card-width), 100%);
			margin-inline: auto;
			border-radius: var(--radius-l);
			box-shadow: var(--shadow-lift);
		}
	}

	/**
	 * A phone turned on its side. 390px of height, and this screen has to hold a garland,
	 * a script headline, a rule, the occasion line and the tap prompt — with `overflow:
	 * hidden` above, so anything that does not fit is not scrolled to, it is lost. The
	 * type comes down via --step-5 in app.css; these are the paddings that were written
	 * for a tall screen.
	 */
	@media (orientation: landscape) and (max-height: 32rem) {
		.content {
			padding-block: calc(var(--safe-top) + var(--frame-depth)) 10vh;
		}

		.rule {
			margin-block: var(--space-2xs);
		}

		.prompt {
			padding-block-end: calc(var(--safe-bottom) + var(--space-s));
		}
	}
</style>
