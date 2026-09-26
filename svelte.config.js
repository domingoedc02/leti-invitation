import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),

		/**
		 * The site's CSS is ~24KB raw across two files, and fetching them as separate
		 * stylesheets blocked first paint by a few hundred milliseconds on mobile data
		 * (Lighthouse put it at 710ms). Above this threshold Kit inlines both into the
		 * prerendered HTML instead, so the gate paints from the single HTML response
		 * with no round-trip. There is only one page, so nothing pays for it twice.
		 */
		inlineStyleThreshold: 20480,

		/**
		 * SvelteKit emits one small inline bootstrap script, so a blanket
		 * `script-src 'self'` sent as an HTTP header would block hydration outright — the
		 * page would render and then do nothing at all.
		 *
		 * Letting Kit own the policy fixes that by construction: in hash mode it
		 * computes the hash of its own inline script and writes the whole policy into
		 * a <meta http-equiv> tag in the prerendered HTML. The header in vercel.json
		 * keeps only `frame-ancestors`, which a meta tag is not allowed to set.
		 */
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				/**
				 * Svelte's `style:` directives set inline style *attributes*, which are
				 * governed by style-src-attr. It has to be spelled out: inlining the
				 * stylesheet makes Kit add a hash to style-src, and a style-src that
				 * carries a hash makes browsers ignore its 'unsafe-inline' — which would
				 * silently kill every parallax and reveal on the page.
				 */
				'style-src-attr': ['unsafe-inline'],
				'img-src': ['self', 'data:'],
				'font-src': ['self'],
				// Nothing is fetched off-origin: no analytics, no CDN, no remote fonts.
				'connect-src': ['self'],
				'base-uri': ['self'],
				'form-action': ['none'],
				'object-src': ['none']
			}
		}
	}
};

export default config;
