<script lang="ts">
	import Picture from './Picture.svelte';
	import { image, assetSrc } from '$lib/images';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax.svelte';

	/**
	 * One watercolour frame around the whole invitation.
	 *
	 * It is a single `position: absolute; inset: 0` child of the element it frames, so on
	 * the invitation it spans the entire document: the garland closes across the very top
	 * of the page, a second one closes across the very bottom, and two rails of flowers
	 * run down both edges for the full scroll length in between. Nothing here is fixed to
	 * the screen and nothing measures the page — it *is* part of the page, so it stays
	 * exactly where it is while you scroll past it.
	 *
	 * That is also why the decoration is DOM and not WebGL. Scrolling is composited on its
	 * own thread; a canvas repainted in `requestAnimationFrame` is not, so a fixed canvas
	 * frame slides against the words on every flick. There is no version of that which
	 * looks right, which is what killed the earlier three.js border.
	 *
	 * The flowers are the real artwork. Only the moving pieces are drawn in code:
	 * butterflies that flutter along the rails, gold sparkles, and a slow sway on the top
	 * and bottom garlands.
	 */
	let {
		/**
		 * Depth of the top garland, as a multiple of the shared `--frame-depth`. The
		 * bottom garland is deliberately lighter (see `.edge.bottom`), the way the lower
		 * border of a printed invitation usually is. Whatever is passed here, the framed
		 * element has to reserve matching padding — nothing about the frame is in flow.
		 */
		depth = 2
	}: { depth?: number } = $props();

	/**
	 * The rails' tile. Its aspect ratio comes from the manifest rather than a magic
	 * number, so re-cropping the asset cannot silently break the tiling.
	 *
	 * 200w, not 380w: the rail is about 30px wide and shows the outer 40% of an 80px-wide
	 * tile, so 200 source pixels is already above 2x on a phone, and it costs 28KB
	 * instead of 63KB. A plain `url()` on purpose — `image-set()` with `type()` needs
	 * Safari 17, and a custom property holding an unsupported `image-set()` is invalid at
	 * computed-value time, so it resolves to `unset` and takes the fallback declaration
	 * with it rather than falling back to it.
	 */
	const rail = image('floral-rail');
	const railSrc = `url(${assetSrc('floral-rail', 'webp', 200)})`;
	const railRatio = rail.height / rail.width;

	/**
	 * Where the moving pieces sit, in fixed tables — never `Math.random()`. The site is
	 * prerendered, so a random position would differ between the server's HTML and the
	 * client's first render.
	 *
	 * The rail ornaments are grouped into perches spaced down the frame, and each perch
	 * carries its own `use:reveal`. That gating is the point of the grouping: without it
	 * a dozen `flutter` loops would run the whole length of a page four thousand pixels
	 * tall, most of them nowhere near the screen.
	 */
	const PERCHES = [
		{
			top: '13%',
			side: 'start',
			size: 21,
			delay: -1.1,
			duration: 9.5,
			stars: [
				{ shift: -38, size: 9, delay: -0.6, duration: 3.4 },
				{ shift: 44, size: 7, delay: -2.4, duration: 4.1 }
			]
		},
		{
			top: '37%',
			side: 'end',
			size: 18,
			delay: -5.3,
			duration: 11,
			stars: [
				{ shift: -52, size: 8, delay: -1.9, duration: 3.7 },
				{ shift: 30, size: 10, delay: -3.1, duration: 4.4 }
			]
		},
		{
			top: '61%',
			side: 'start',
			size: 19,
			delay: -2.6,
			duration: 10.2,
			stars: [
				{ shift: -30, size: 7, delay: -2.7, duration: 3.9 },
				{ shift: 49, size: 9, delay: -0.9, duration: 3.2 }
			]
		},
		{
			top: '85%',
			side: 'end',
			size: 22,
			delay: -7.4,
			duration: 9.8,
			stars: [
				{ shift: -45, size: 10, delay: -3.4, duration: 4.6 },
				{ shift: 36, size: 8, delay: -1.3, duration: 3.1 }
			]
		}
	] as const;

	/** Sparkles scattered across the top and bottom garlands, where there is width to use. */
	const EDGE_STARS = [
		{ left: '22%', top: '44%', size: 10, delay: -0.7, duration: 3.5 },
		{ left: '58%', top: '28%', size: 8, delay: -2.1, duration: 4.2 },
		{ left: '81%', top: '56%', size: 11, delay: -1.4, duration: 3.1 }
	] as const;
</script>

<!--
	One butterfly, at about twenty pixels across.

	Drawn as a silhouette rather than as a stack of rounded boxes: at this size the outline
	is the only thing the eye has to read, and overlapping ovals came out as a pink lozenge
	with a dark bar down it. Each side is one path holding a broad forewing reaching up and
	out plus a smaller hindwing tucked below, mirrored about the body, with a thin deeper
	stroke to hold the shape against the watercolour behind it.

	Flat fills, no gradient: a <linearGradient> would need an id, and this snippet renders
	five times on the page, which would mean five elements sharing one id.
-->
{#snippet butterfly(size: number, delay: number, duration: number, wide: boolean)}
	<svg
		class="butterfly"
		class:wide
		viewBox="0 0 24 20"
		width={size}
		height={(size * 20) / 24}
		style:animation-delay="{delay}s"
		style:animation-duration="{duration}s"
		aria-hidden="true"
		focusable="false"
	>
		<!-- Both wings fold together, about the body's own axis, so the beat reads as the
		     pair tilting towards the viewer rather than the insect being squashed. -->
		<g class="wings" style:animation-delay="{delay}s">
			<path
				class="wing"
				d="M12 5.6C9.8 2.2 5.2 0.6 3 2.4 1 4.1 2 8.1 5.4 9.9c2 1.1 4.4 1.5 6.3 1.4Z
				   M11.7 11.6c-2.3-0.2-5.3 0.5-6.6 2.1-1.4 1.8-0.3 4.7 2.1 4.6 2.1-0.1 3.8-2.4 4.6-4.9Z"
			/>
			<path
				class="wing"
				transform="translate(24 0) scale(-1 1)"
				d="M12 5.6C9.8 2.2 5.2 0.6 3 2.4 1 4.1 2 8.1 5.4 9.9c2 1.1 4.4 1.5 6.3 1.4Z
				   M11.7 11.6c-2.3-0.2-5.3 0.5-6.6 2.1-1.4 1.8-0.3 4.7 2.1 4.6 2.1-0.1 3.8-2.4 4.6-4.9Z"
			/>
		</g>
		<path class="feeler" d="M12 5C11 3 9.5 1.8 7.7 1.2" />
		<path class="feeler" d="M12 5c1-2 2.5-3.2 4.3-3.8" />
		<ellipse class="thorax" cx="12" cy="10.4" rx="1.05" ry="5.3" />
		<circle class="head" cx="12" cy="5" r="1.25" />
	</svg>
{/snippet}

<div
	class="floral-frame"
	style:--depth="calc(var(--frame-depth) * {depth})"
	style:--rail-src={railSrc}
	style:--rail-h="calc(var(--rail-w) * {railRatio.toFixed(4)})"
	aria-hidden="true"
	role="presentation"
>
	<!-- The two rails first, so the garlands close over their tapered ends. -->
	{#each ['start', 'end'] as const as side (side)}
		<div class="rail {side}">
			<!-- Two tapes, half a tile out of phase. See the note on .tape below. -->
			<div class="tape"></div>
			<div class="tape alt"></div>
		</div>
	{/each}

	{#each ['top', 'bottom'] as const as which (which)}
		<div class="edge {which}" use:reveal use:parallax={{ strength: 8 }}>
			<div class="art">
				<Picture name="floral-crown" alt="" decorative sizes="100vw" class="crown" />
			</div>

			{#each EDGE_STARS as star, i (i)}
				<span class="pin" style:left={star.left} style:top={star.top}>
					<span
						class="sparkle"
						style:width="{star.size}px"
						style:height="{star.size}px"
						style:animation-delay="{star.delay}s"
						style:animation-duration="{star.duration}s"
					></span>
				</span>
			{/each}

			{#if which === 'top'}
				<!-- One butterfly on the crown, with room to drift sideways. -->
				<span class="pin" style:left="36%" style:top="62%">
					{@render butterfly(22, -1.1, 9.5, true)}
				</span>
			{/if}
		</div>
	{/each}

	{#each PERCHES as perch, i (i)}
		<div class="perch {perch.side}" style:top={perch.top} use:reveal>
			{@render butterfly(perch.size, perch.delay, perch.duration, false)}

			{#each perch.stars as star, j (j)}
				<span
					class="sparkle star"
					style:--shift="{star.shift}px"
					style:width="{star.size}px"
					style:height="{star.size}px"
					style:animation-delay="{star.delay}s"
					style:animation-duration="{star.duration}s"
				></span>
			{/each}
		</div>
	{/each}
</div>

<style>
	/**
	 * The frame spans its parent's padding box exactly, and its parent is the whole
	 * invitation, so this one element is the whole border.
	 *
	 * `z-index: 0` is stated rather than left to chance, and it has to be the *last*
	 * child of the element it frames. Positioned elements with `z-index: 0` paint in tree
	 * order alongside the `z-index: auto` ones around them, so being last is what puts
	 * the flowers above the invitation's background wash; `z-index: 1` would put them
	 * above the words instead, and being the first child would bury them.
	 */
	.floral-frame {
		position: absolute;
		inset: 0;
		z-index: 0;
		/* The garlands overhang both sides so no cut edge can drift into view; this is
		   what keeps that overhang from reaching the horizontal scrollbar. */
		overflow: hidden;
		/* Decorative: every tap must reach the invitation underneath. */
		pointer-events: none;

		/* The rail shows the outer 40% of a tile this wide, which renders the flowers at
		   a natural size instead of squeezing a whole garland into thirty pixels. */
		--rail-w: calc(var(--frame-rail) * 2.6);
	}

	/* ── The two side rails ──────────────────────────────────────────────────── */

	.rail {
		position: absolute;
		inset-block: 0;
		width: var(--frame-rail);
		overflow: hidden;
		/* The artwork already tapers inward; this finishes the job, so the flowers have
		   dissolved before they reach the reading column. */
		mask-image: linear-gradient(to right, #000 0, #000 54%, transparent 100%);
	}

	.rail.start {
		inset-inline-start: 0;
	}

	/* Mirrored in place: the tile's paint sits against its own left edge, so the only way
	   to put it against the right edge of the page is to flip the whole rail. */
	.rail.end {
		inset-inline-end: 0;
		scale: -1 1;
	}

	/**
	 * A ribbon of the garland, stood on end and tiled down the page.
	 *
	 * The strip is dense paint at both of its cut ends (mean alpha 253 and 167 across the
	 * width the rail actually shows), so butting one copy head to tail against the next
	 * draws a hard line every tile. Fading each tile out at both ends would instead leave
	 * a gap there. So there are two tapes, half a tile out of phase: each one's fade
	 * lands squarely inside the other's opaque plateau, and the join disappears with no
	 * gap and no seam. They also show different flowers at the same height, which breaks
	 * up the repeat.
	 */
	.tape {
		position: absolute;
		inset: 0;
		background-image: var(--rail-src);
		background-repeat: repeat-y;
		background-position: left top;
		background-size: var(--rail-w) var(--rail-h);
		/* One tile of fade, repeated by `mask-repeat`. The 18% ramps are what the other
		   tape's plateau covers; widening them past 25% would start to show through. */
		mask-image: linear-gradient(to bottom, transparent 0, #000 18%, #000 82%, transparent 100%);
		mask-size: 100% var(--rail-h);
	}

	.tape.alt {
		background-position: left calc(var(--rail-h) * 0.5);
		mask-position: 0 calc(var(--rail-h) * 0.5);
	}

	/* ── The top and bottom garlands ─────────────────────────────────────────── */

	.edge {
		position: absolute;
		inset-inline: 0;
		/* Over the rails, so the garland closes across their tapered ends. */
		z-index: 1;
		height: var(--edge-h);
	}

	.edge.top {
		--edge-h: var(--depth);
		inset-block-start: 0;
	}

	/* Lighter than the crown, the way the lower border of a printed invitation is. */
	.edge.bottom {
		--edge-h: calc(var(--depth) * 0.72);
		inset-block-end: 0;
	}

	.art {
		position: absolute;
		inset-block-start: 0;
		/* Negative, so the garland runs off both edges of the page and the parallax drift
		   can never bring a cut edge into view. */
		inset-inline: -7%;
		/* Follows the device tilt, the same signal the portrait and the bunny use. */
		translate: var(--parallax-x, 0) var(--parallax-y, 0);
	}

	/* Anchored to the page's bottom edge before it is flipped, so the dense end of the
	   painting lands on that edge rather than 700px below it. */
	.edge.bottom .art {
		inset-block-start: auto;
		inset-block-end: 0;
		scale: 1 -1;
	}

	.edge :global(.crown img) {
		width: 100%;
		height: auto;
		/**
		 * Dense at the page's edge, fading inward. That direction is the whole idea: the
		 * painting is already at full opacity on its very first row (mean alpha 202/255),
		 * and on a frame that is exactly right — the page's boundary is what cuts the
		 * border, the way a printed edge does. It was only wrong when the same garland
		 * floated in the middle of the page, where the uncut top read as a razor-straight
		 * line of watercolour across nothing.
		 *
		 * The stops are `--edge-h` lengths rather than percentages because the image is
		 * far taller than the edge it decorates; percentages would resolve against the
		 * image and fade over seven hundred pixels.
		 */
		mask-image: linear-gradient(
			to bottom,
			#000 0,
			#000 calc(var(--edge-h) * 0.42),
			transparent var(--edge-h)
		);
		/* A slow breath, and the bottom garland is deliberately out of step with the top. */
		animation: bob 9s ease-in-out infinite;
	}

	.edge.bottom :global(.crown img) {
		animation-delay: -4.2s;
	}

	/* ── The moving pieces ───────────────────────────────────────────────────── */

	/**
	 * Nothing moves until its own part of the frame is on screen — the same gate
	 * FloralDivider uses. On a page this tall that is the difference between four
	 * butterflies animating and all of them.
	 */
	.edge:not(:global(.is-visible)) :global(.crown img),
	.edge:not(:global(.is-visible)) .butterfly,
	.edge:not(:global(.is-visible)) .wings,
	.edge:not(:global(.is-visible)) .sparkle,
	.perch:not(:global(.is-visible)) .butterfly,
	.perch:not(:global(.is-visible)) .wings,
	.perch:not(:global(.is-visible)) .sparkle {
		animation-play-state: paused;
	}

	/* A zero-sized grid centres each ornament on its point, which leaves `translate`
	   free for the animation rather than spending it on centring. */
	.pin {
		position: absolute;
		display: grid;
		place-items: center;
		width: 0;
		height: 0;
	}

	/* A real box, as wide as the rail it sits on and tall enough to hold its sparkles.
	   Deliberately not zero-sized like .pin: this is what the IntersectionObserver
	   measures, and a zero-area target leans on a corner of that spec. */
	.perch {
		position: absolute;
		display: grid;
		place-items: center;
		width: var(--frame-rail);
		height: 9rem;
	}

	.perch.start {
		inset-inline-start: 0;
	}

	.perch.end {
		inset-inline-end: 0;
	}

	.butterfly {
		display: block;
		overflow: visible;
		/* Lifts it off the painting, so a code-drawn insect on a watercolour flower reads
		   as sitting above the petals rather than printed onto them. */
		filter: drop-shadow(0 1px 1.5px rgb(168 56 90 / 22%));
		/* Along the rail, because there is no sideways room there: a wider drift would
		   carry it out over the first letter of a line. */
		animation-name: flutter-rail;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	/* On the garlands there is a whole page of width, so it can wander. */
	.butterfly.wide {
		animation-name: flutter;
	}

	/* Only the wings fold; the body and feelers stay put, which is what makes it read as
	   a beat rather than the whole insect being squashed.

	   `transform-box: view-box` is what lets the 50% origin mean "the middle of the
	   viewBox" -- which is where the body is -- rather than the middle of the wings' own
	   bounding box, which would fold them into each other. */
	.wings {
		transform-box: view-box;
		transform-origin: 50% 52%;
		animation-name: flap;
		animation-duration: 420ms;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	/* Translucent, so the watercolour shows through the way it would through a real
	   wing, but outlined: without the stroke a pale wing over pale blossoms disappears. */
	.wing {
		fill: rgb(244 166 184 / 72%);
		stroke: rgb(214 92 127 / 58%);
		stroke-width: 0.5;
	}

	.thorax,
	.head {
		fill: rgb(168 56 90 / 62%);
	}

	.feeler {
		fill: none;
		stroke: rgb(168 56 90 / 52%);
		stroke-width: 0.55;
		stroke-linecap: round;
	}

	/* A four-point star, twinkling with the shared `twinkle` keyframe. */
	.sparkle {
		background: var(--gold-light);
		clip-path: polygon(
			50% 0%,
			58% 42%,
			100% 50%,
			58% 58%,
			50% 100%,
			42% 58%,
			0% 50%,
			42% 42%
		);
		animation-name: twinkle;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	/* Offset up or down the rail from its perch. `twinkle` only scales and fades, so
	   `translate` is free to do the centring here. */
	.perch .star {
		position: absolute;
		inset-inline-start: 50%;
		inset-block-start: calc(50% + var(--shift));
		translate: -50% -50%;
	}

	@keyframes flutter {
		0%,
		100% {
			translate: calc(-13px * var(--motion)) 0;
		}
		50% {
			translate: calc(13px * var(--motion)) calc(-5px * var(--motion));
		}
	}

	@keyframes flutter-rail {
		0%,
		100% {
			translate: calc(-3px * var(--motion)) calc(-10px * var(--motion));
		}
		50% {
			translate: calc(4px * var(--motion)) calc(10px * var(--motion));
		}
	}

	@keyframes flap {
		0%,
		100% {
			scale: 1 1;
		}
		50% {
			scale: 0.42 1;
		}
	}
</style>
