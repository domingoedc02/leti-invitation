<script lang="ts">
	import { fallbackSrc, image, srcset } from '$lib/images';

	/**
	 * AVIF first, then WebP, then the original format, with the real intrinsic
	 * dimensions baked in so the browser reserves the right space before the bytes
	 * arrive. Decorative images pass alt="" and are hidden from screen readers.
	 */
	let {
		name,
		alt,
		sizes = '100vw',
		loading = 'lazy',
		priority = false,
		class: className = '',
		decorative = false
	}: {
		name: string;
		alt: string;
		sizes?: string;
		loading?: 'lazy' | 'eager';
		priority?: boolean;
		class?: string;
		decorative?: boolean;
	} = $props();

	const meta = $derived(image(name));
</script>

<picture class={className}>
	<source type="image/avif" srcset={srcset(name, 'avif')} {sizes} />
	<source type="image/webp" srcset={srcset(name, 'webp')} {sizes} />
	<img
		src={fallbackSrc(name)}
		alt={decorative ? '' : alt}
		width={meta.width}
		height={meta.height}
		loading={priority ? 'eager' : loading}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding={priority ? 'sync' : 'async'}
		aria-hidden={decorative ? 'true' : undefined}
	/>
</picture>

<style>
	picture {
		display: block;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}
</style>
