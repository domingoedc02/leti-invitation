<script lang="ts">
	import '../app.css';
	import { party, partyTitle, shareDescription } from '$lib/party';
	import SceneCanvas from '$lib/components/SceneCanvas.svelte';
	/**
	 * The gate's "You're Invited" is set in Parisienne and is the largest thing on
	 * the first screen. With `font-display: swap` it paints in a fallback face and
	 * then re-paints when the real font lands, and that second paint is what gets
	 * measured as the Largest Contentful Paint — 3.3s on a throttled phone. Asking
	 * for the file up front collapses the two paints into one. Only the latin subset
	 * is preloaded: the others are behind a unicode-range and are never fetched here.
	 */
	import parisienne from '@fontsource/parisienne/files/parisienne-latin-400-normal.woff2?url';

	let { children } = $props();

	const ogImage = `${party.siteUrl.replace(/\/$/, '')}/og-image.jpg`;
</script>

<svelte:head>
	<!-- crossorigin is required even same-origin: font fetches are CORS-anonymous, and
	     a preload without it is simply downloaded a second time. -->
	<link rel="preload" href={parisienne} as="font" type="font/woff2" crossorigin="anonymous" />
	<title>{partyTitle}</title>
	<meta name="description" content={shareDescription} />

	<!-- Invitations get shared in messengers, so the link preview matters as much
	     as the page itself. -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={partyTitle} />
	<meta property="og:title" content={party.text.shareTitle} />
	<meta property="og:description" content={shareDescription} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={party.text.shareImageAlt} />
	<meta property="og:url" content={party.siteUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={party.text.shareTitle} />
	<meta name="twitter:description" content={shareDescription} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={party.text.shareImageAlt} />
</svelte:head>

<SceneCanvas />

{@render children()}
