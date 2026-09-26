import { base } from '$app/paths';
import manifest from './images.generated.json';

export type ImageName = keyof typeof manifest.images;

export interface ImageMeta {
	width: number;
	height: number;
	widths: number[];
	ext: string;
	alpha: boolean;
}

const images = manifest.images as Record<string, ImageMeta>;

export function image(name: string): ImageMeta {
	const meta = images[name];
	if (!meta) throw new Error(`Unknown image "${name}" - run \`npm run images\` to rebuild.`);
	return meta;
}

export function srcset(name: string, format: 'avif' | 'webp'): string {
	return image(name)
		.widths.map((w) => `${base}/img/${name}-${w}.${format} ${w}w`)
		.join(', ');
}

export function fallbackSrc(name: string): string {
	return `${base}/img/${name}.${image(name).ext}`;
}

/**
 * One derivative's URL, for the rare decoration that needs a CSS `background-image`
 * rather than a <picture>. WebP is the only safe format here: `image-set()` with
 * `type()` needs Safari 17, and a custom property holding an unsupported `image-set()`
 * is invalid at computed-value time, so it resolves to `unset` and wipes the fallback
 * declaration instead of falling back to it. WebP-with-alpha has been fine since iOS 14.
 */
export function assetSrc(name: string, format: 'avif' | 'webp', width: number): string {
	const meta = image(name);
	if (!meta.widths.includes(width))
		throw new Error(`No ${width}w derivative of "${name}" - it has ${meta.widths.join(', ')}.`);
	return `${base}/img/${name}-${width}.${format}`;
}
