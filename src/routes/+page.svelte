<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import InviteGate from '$lib/components/InviteGate.svelte';
	import Invitation from '$lib/components/Invitation.svelte';
	import { requestOrientationPermission } from '$lib/pointer.svelte';

	/**
	 * The gate and the invitation are one route with two scenes rather than two
	 * pages, so the WebGL context is created once and survives the transition.
	 *
	 * "Opened" is held in shallow-routing state, which means the phone's back button
	 * and back-swipe close the invitation and return to the gate, with no reload.
	 */
	const opened = $derived(page.state.opened === true);

	/** Only true once JS is running; see the <noscript> note below. */
	let interactive = $state(false);
	let heading: HTMLElement | undefined = $state();
	let closing = $state(false);
	/** Held for the length of the opening flourish; see .celebrating in app.css. */
	let celebrating = $state(false);

	onMount(() => {
		interactive = true;
	});

	async function open() {
		// iOS only grants motion access from inside a real gesture, and this tap is
		// the one chance to ask. A refusal is fine: pointer input takes over.
		void requestOrientationPermission();

		// Every garland on the page swells once, as if the whole card had taken a
		// breath. This used to be a ripple through the WebGL particle frame; as plain
		// CSS it also runs on the phones that never get a WebGL context at all.
		celebrating = true;
		setTimeout(() => (celebrating = false), 1200);

		closing = true;
		pushState('#invitation', { opened: true });

		// Send screen-reader and keyboard focus into the invitation, so it does not
		// get left behind on a button that no longer exists.
		await tick();
		heading?.focus();
		setTimeout(() => (closing = false), 900);
	}

	// While the gate covers the screen, the invitation behind it must not be
	// scrollable or reachable by tab. Only applied once JS is running, so the
	// prerendered HTML stays usable without it.
	$effect(() => {
		if (!interactive) return;
		document.body.style.overflow = opened ? '' : 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<!-- With JavaScript off there is nothing to open the gate with, so the gate is
     hidden and the full invitation is simply readable underneath. -->
<noscript>
	<style>
		.gate-overlay {
			display: none !important;
		}
	</style>
</noscript>

{#if !opened}
	<div class="gate-overlay" class:closing>
		<InviteGate onopen={open} />
	</div>
{/if}

<!-- inert is applied only after hydration: in the prerendered HTML it must be
     absent, or a no-JS guest would get content they cannot reach. -->
<div
	class="invitation-wrap"
	class:gated={interactive && !opened}
	class:celebrating
	inert={interactive && !opened ? true : undefined}
>
	<Invitation bind:headingRef={heading} />
</div>

<style>
	.gate-overlay {
		position: fixed;
		inset: 0;
		z-index: 20;
	}

	/* The gate lifts away and dissolves, revealing the invitation behind it. */
	.gate-overlay.closing {
		animation: gate-open 900ms var(--ease-soft) forwards;
	}

	@keyframes gate-open {
		from {
			opacity: 1;
			scale: 1;
		}
		to {
			opacity: 0;
			scale: 1.12;
		}
	}

	.invitation-wrap {
		/* Stated rather than inherited by accident: this is the content layer from the
		   layer-order note in app.css, under the gate and under the decorative frame. */
		position: relative;
		z-index: 2;
		/* Fades in as the gate lifts, rather than being revealed abruptly. */
		animation: invitation-in 1.1s var(--ease-soft) both;
	}

	/**
	 * Behind the gate the invitation is inert, but it was still being painted, and
	 * the hero's decorative floral backdrop is larger than the screen — so the
	 * browser picked an invisible, lazily-loaded image as the Largest Contentful
	 * Paint and reported it at 4.9s. Skipping rendering while the gate is up makes
	 * the gate's own artwork the largest paint, which is what the guest actually
	 * looks at, and stops the invitation’s own background art competing for bandwidth.
	 *
	 * The class is applied only once hydrated, so with no JavaScript at all the
	 * invitation is simply visible; `contain-intrinsic-size` keeps the page from
	 * collapsing to nothing while it is skipped.
	 */
	.invitation-wrap.gated {
		content-visibility: hidden;
		contain-intrinsic-size: auto 100dvh;
	}

	/**
	 * Note the `translate: none` end state, which is not the same as `translate: 0 0`.
	 *
	 * The two interpolate identically, but a non-`none` translate creates a stacking
	 * context — and with `animation-fill-mode: both` this element holds its end state
	 * forever, so `0 0` made .invitation-wrap a permanent stacking context. That
	 * trapped the invitation's own `z-index: 2` inside it, leaving the whole thing
	 * painted at `z-index: auto` in the root context, underneath the decorative canvas.
	 * The visible symptom was the invitation vanishing behind the decoration.
	 */
	@keyframes invitation-in {
		from {
			opacity: 0;
			translate: 0 calc(18px * var(--motion));
		}
		to {
			opacity: 1;
			translate: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gate-overlay.closing {
			animation: none;
			opacity: 0;
		}

		.invitation-wrap {
			animation: none;
		}
	}
</style>
