import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// three.js is the only heavy dependency; keep it in its own chunk so the
		// gate screen's HTML/CSS paints before the 3D layer has finished loading.
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules/three')) return 'three';
				}
			}
		}
	}
});
