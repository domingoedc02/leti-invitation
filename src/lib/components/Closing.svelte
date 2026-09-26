<script lang="ts">
	import { onMount } from 'svelte';
	import { party } from '$lib/party';
	import Picture from './Picture.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { pokeBunny, setBunnyAnchor } from '$lib/three';
	import { motion } from '$lib/motion.svelte';

	/**
	 * The sign-off, and the 3D bunny's home.
	 *
	 * The bunny itself is drawn on the fixed WebGL canvas behind the page, so this
	 * section just provides an element for the scene to aim at. Interaction is a
	 * real <button> laid over that spot: the canvas is inert and hidden from
	 * assistive technology, so a tappable canvas would be unreachable by keyboard.
	 */
	let stage: HTMLElement | undefined = $state();
	let petted = $state(false);

	onMount(() => {
		if (stage) setBunnyAnchor(stage);
		return () => setBunnyAnchor(null);
	});

	function pet() {
		pokeBunny();
		petted = true;
		setTimeout(() => (petted = false), 2400);
	}
</script>

<section class="closing" aria-labelledby="closing-heading">
	<h2 id="closing-heading" class="heading" use:reveal>
		<span class="script">{party.text.closingHeading}</span>
	</h2>

	<div class="bunny-area" use:reveal={{ delay: 100 }}>
		<!-- The 3D bunny's plot of land, with its tap target laid exactly over it. -->
		<div class="stage-wrap">
			<div class="stage" bind:this={stage} aria-hidden="true"></div>
			{#if !motion.reduced}
				<button type="button" class="pet" onclick={pet}>
					<span class="sr-only">{party.text.petBunnyLabel}</span>
				</button>
			{/if}
		</div>

		<!-- The watercolour bunny from the invitation set, sitting alongside. -->
		<Picture name="bunny-sit" alt="" decorative sizes="7.5rem" class="bunny-art" />
	</div>

	<p class="reaction" role="status">{petted ? party.text.petBunnyReaction : ''}</p>

	<p class="hosts" use:reveal={{ delay: 180 }}>{party.hosts}</p>

	<p class="signature" use:reveal={{ delay: 240 }} aria-hidden="true">
		&#10047; &nbsp;{party.childName}&nbsp; &#10047;
	</p>
</section>

<style>
	.closing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-s);
		text-align: center;
		/* Clears the frame's bottom garland. That edge is 1.44 * --frame-depth tall and
		   its mask has faded out well before the end of it, so roughly one --frame-depth
		   is the part that actually has paint in it. */
		padding-block-end: calc(var(--safe-bottom) + var(--frame-depth) + var(--space-m));
	}

	.heading {
		max-width: 20rem;
	}

	.script {
		font-family: var(--font-script);
		font-weight: 400;
		font-size: var(--step-3);
		line-height: 1.35;
		color: var(--rose-display);
	}

	.bunny-area {
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: var(--space-xs);
		width: 100%;
		max-width: 24rem;
	}

	.stage-wrap {
		position: relative;
		flex: 0 0 auto;
	}

	/**
	 * Reserves the space the 3D bunny is drawn into. Its measured height is what the
	 * scene uses to scale the model, so it must be a real, non-empty box.
	 *
	 * The width is capped against the viewport as well as the font. Both this and the
	 * watercolour beside it are `flex: 0 0 auto`, so at the largest OS font setting the pair
	 * came to 512px on a 390px phone — which Chrome answers by widening the layout viewport
	 * and zooming the whole page out to 84%, i.e. quietly undoing part of the larger text
	 * the reader asked for. 44vw is above 8.5rem on every phone at the default font size, so
	 * nothing about the normal composition changes; it only bites once the text grows.
	 */
	.stage {
		width: min(8.5rem, 44vw);
		height: 11rem;
	}

	/* Laid exactly over the stage, so a tap on the bunny reaches a real control
	   rather than the inert canvas. Comfortably past the 44px minimum. */
	.pet {
		position: absolute;
		inset: 0;
		border-radius: var(--radius-m);
	}

	.pet:active {
		scale: 0.96;
	}

	/* Capped the same way, and for the same reason. */
	.bunny-area :global(.bunny-art) {
		flex: 0 0 auto;
		width: min(7.5rem, 39vw);
		animation: bob 6s ease-in-out infinite;
	}

	.reaction {
		min-height: 1.5em;
		font-size: var(--step--1);
		color: var(--rose-ink);
	}

	.hosts {
		max-width: 22rem;
		font-family: var(--font-display);
		font-style: italic;
		color: var(--ink);
	}

	.signature {
		font-family: var(--font-script);
		font-size: var(--step-2);
		color: var(--gold);
		letter-spacing: 0.05em;
	}
</style>
