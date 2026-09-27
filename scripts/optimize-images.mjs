/**
 * Build-time image pipeline.
 *
 * The originals in assets/source/ total ~2.1MB (leti.png alone is 913KB). Shipping
 * them as-is would make the invitation slow on mobile data, so this script emits
 * AVIF + WebP derivatives into static/img/ and never ships the sources.
 *
 * Run automatically by `npm run build`, or on its own with `npm run images`.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';
// Plain TS with only erasable syntax, which Node (>=22.18) loads by stripping the types.
import { party } from '../src/lib/party.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'assets', 'source');
const out = join(root, 'static', 'img');

/** Where the bunny sits inside the 675x1200 cutout (4.png), found by inspection. */
const BUNNY_CROP = { left: 0, top: 915, width: 235, height: 275 };

/**
 * The flowered band of the garland (3.png), measured rather than guessed: its alpha runs
 * from 202/255 on row 0 down to 0 by row ~390 and is empty for the remaining 810 rows.
 * Everything worth keeping is in the top 380.
 */
const RAIL_CROP = { left: 0, top: 0, width: 675, height: 380 };

/**
 * A cropped source, pre-extracted to a buffer and then treated like any other source.
 *
 * `rail` also stands the band on end, so that its natural tiling direction is down the
 * page. rotate(-90) sends the original's top row -- the dense, cut edge of the
 * arrangement -- to the left column, which is the rail's outer edge, and leaves the
 * blossoms reaching inward towards the words.
 */
async function cropped(path, kind) {
	if (kind === 'bunny') return sharp(path).extract(BUNNY_CROP).toBuffer();
	if (kind === 'rail') return sharp(path).extract(RAIL_CROP).rotate(-90).toBuffer();
	throw new Error(`Unknown crop "${kind}"`);
}

/** Each entry becomes AVIF + WebP at every listed width (never upscaled). */
const derivatives = [
	{ file: 'wallpaper-invitation.jpg', name: 'gate-bg', widths: [480, 736], alpha: false },
	{ file: 'main/1.png', name: 'hero-bg', widths: [480, 675], alpha: false },
	{ file: 'main/2.png', name: 'wash-bg', widths: [480, 675], alpha: false },
	{ file: 'main/3.png', name: 'floral-crown', widths: [480, 675], alpha: true },
	// The same garland stood on end, for the two rails that run down the frame's sides.
	// Tiling floral-crown itself would leave a gap every tile: it is 69% empty canvas.
	{ file: 'main/3.png', name: 'floral-rail', widths: [200, 380], alpha: true, crop: 'rail' },
	{ file: 'main/4.png', name: 'bunny', widths: [480, 675], alpha: true },
	// Just the bunny, cropped out of its mostly-empty canvas.
	{ file: 'main/4.png', name: 'bunny-sit', widths: [235, 470], alpha: true, crop: 'bunny' },
	{ file: 'leti.png', name: 'leti', widths: [640, 1080], alpha: true }
];

const written = [];

/**
 * Exact output dimensions and available widths for every image, written to
 * src/lib/images.generated.json so Picture.svelte can emit correct width/height
 * attributes. Hardcoding these in the markup is how layout shift creeps back in.
 */
const manifest = {};

async function emit(buffer, name) {
	const path = join(out, name);
	await writeFile(path, buffer);
	written.push([name, buffer.length]);
}

async function buildDerivatives(list, prefix = '') {
	for (const { file, name, widths, alpha, crop } of list) {
		const path = file.startsWith('/') ? file : join(src, file);
		const input = crop ? await cropped(path, crop) : path;
		const meta = await sharp(input).metadata();
		const available = [];

		for (const width of widths) {
			// withoutEnlargement: the sources are only 675-1161px wide, and upscaling
			// would add bytes without adding a single pixel of real detail.
			const resized = () =>
				sharp(input).resize({ width, withoutEnlargement: true, fit: 'inside' });

			const avif = await resized().avif({ quality: alpha ? 58 : 52, effort: 6 }).toBuffer();
			await emit(avif, `${prefix}${name}-${width}.avif`);

			const webp = await resized().webp({ quality: alpha ? 80 : 74, effort: 6 }).toBuffer();
			await emit(webp, `${prefix}${name}-${width}.webp`);

			available.push(Math.min(width, meta.width ?? width));
		}

		// One same-format fallback for browsers with neither AVIF nor WebP.
		const widest = Math.min(Math.max(...widths), meta.width ?? Math.max(...widths));
		const fallback = sharp(input).resize({ width: widest, withoutEnlargement: true });
		const ext = alpha ? 'png' : 'jpg';
		const buffer = alpha
			? await fallback.png({ compressionLevel: 9, palette: true }).toBuffer()
			: await fallback.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
		await emit(buffer, `${prefix}${name}.${ext}`);

		// Record the real dimensions of the fallback, which is the one the <img>
		// element points at and therefore the one that sets the aspect ratio.
		const out = await sharp(buffer).metadata();
		manifest[`${prefix}${name}`] = {
			width: out.width,
			height: out.height,
			widths: [...new Set(available)].sort((a, b) => a - b),
			ext,
			alpha
		};
	}
}

/** A font from node_modules, loaded with opentype.js (which reads WOFF directly). */
async function loadFont(pkg, file) {
	const buf = await readFile(join(root, 'node_modules', '@fontsource', pkg, 'files', file));
	return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/**
 * SVG path data from opentype.js path commands. Written out by hand because
 * opentype.js 2.0's own toPathData() emits NaN for some curves (it broke "Leticia"
 * off after the "L"), and librsvg stops drawing a path at the first bad number.
 */
function pathData(commands) {
	const n = (v) => v.toFixed(2);
	return commands
		.map((c) => {
			if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
			if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
			if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
			return 'Z';
		})
		.join('');
}

/**
 * The card's wording as an SVG overlay. Each line is converted to outline paths rather
 * than set as <text>: librsvg (what sharp renders SVG with) only sees system fonts, so
 * <text> would come out in whatever serif the build machine has. Paths look the same
 * everywhere, in the same faces the site uses.
 */
async function ogText(W, H) {
	const script = await loadFont('parisienne', 'parisienne-latin-400-normal.woff');
	const display = await loadFont('playfair-display', 'playfair-display-latin-600-normal.woff');

	// The clear middle of the card, between the bunny and Leti.
	const cx = 430;
	const lines = [
		{ font: script, text: party.text.shareCardHeadline, size: 96, y: 285, fill: '#d65c7f' },
		{ font: display, text: party.text.shareCardLine, size: 42, y: 355, fill: '#5a2a3c' },
		{ font: display, text: party.text.shareCardDate, size: 26, y: 408, fill: '#7d5062' }
	];
	const paths = lines.map(({ font, text, size, y, fill }) => {
		const x = cx - font.getAdvanceWidth(text, size) / 2;
		const d = pathData(font.getPath(text, x, y, size).commands);
		return `<path d="${d}" fill="${fill}"/>`;
	});

	// A soft white glow under the words so they stay legible over the florals.
	return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
	<defs><radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity=".92"/><stop offset=".6" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
	<ellipse cx="${cx}" cy="330" rx="320" ry="160" fill="url(#g)"/>
	${paths.join('\n\t')}
</svg>`);
}

/**
 * 1200x630 social share card: watercolour wash, florals across the top, Leti on the
 * right, the bunny bottom-left, and "You're Invited to Leticia's 3rd Birthday" in the
 * middle. The words are on the image as well as in og:title because some apps
 * (Instagram DMs especially) show only the picture.
 */
async function buildOgCard() {
	const W = 1200;
	const H = 630;

	const base = await sharp(join(src, 'main', '2.png'))
		.resize({ width: W, height: H, fit: 'cover', position: 'centre' })
		.toBuffer();

	// 3.png is portrait with its florals in the top third; scaling to 1200 wide puts
	// them in the top ~640px, so the first 630 rows are almost entirely flowers.
	const florals = await sharp(join(src, 'main', '3.png'))
		.resize({ width: W })
		.extract({ left: 0, top: 0, width: W, height: H })
		.toBuffer();

	const letiH = 570;
	const leti = await sharp(join(src, 'leti.png')).resize({ height: letiH }).toBuffer();
	const letiW = (await sharp(leti).metadata()).width ?? 480;

	const bunnyH = 250;
	const bunny = await sharp(join(src, 'main', '4.png'))
		.extract(BUNNY_CROP)
		.resize({ height: bunnyH })
		.toBuffer();

	const card = await sharp(base)
		.composite([
			{ input: florals, blend: 'over' },
			{ input: leti, left: W - letiW - 70, top: H - letiH },
			{ input: bunny, left: 60, top: H - bunnyH - 10 },
			{ input: await ogText(W, H) }
		])
		.jpeg({ quality: 84, mozjpeg: true })
		.toBuffer();

	await writeFile(join(root, 'static', 'og-image.jpg'), card);
	written.push(['../og-image.jpg', card.length]);
}

/** App icons: the bunny centred on a blush square. */
async function buildIcons() {
	const bunny = await sharp(join(src, 'main', '4.png')).extract(BUNNY_CROP).toBuffer();

	for (const size of [180, 192, 512]) {
		const inner = Math.round(size * 0.74);
		const icon = await sharp({
			create: {
				width: size,
				height: size,
				channels: 4,
				background: { r: 250, g: 220, b: 224, alpha: 1 }
			}
		})
			.composite([{ input: await sharp(bunny).resize({ height: inner }).toBuffer(), gravity: 'centre' }])
			.png({ compressionLevel: 9 })
			.toBuffer();

		const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
		await writeFile(join(root, 'static', name), icon);
		written.push([`../${name}`, icon.length]);
	}
}

await mkdir(out, { recursive: true });
await buildDerivatives(derivatives);
await buildOgCard();
await buildIcons();

const manifestJson = JSON.stringify({ images: manifest }, null, '\t');
await writeFile(join(root, 'src', 'lib', 'images.generated.json'), `${manifestJson}\n`);

const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
const total = written.reduce((sum, [, n]) => sum + n, 0);
for (const [name, size] of written) console.log(`  ${name.padEnd(28)} ${kb(size)}`);
console.log(`\n${written.length} files, ${kb(total)} total`);
