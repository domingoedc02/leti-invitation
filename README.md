# Leti's 3rd Birthday Invitation

A mobile-first digital invitation: a "You're Invited" gate that opens on tap, then a
scrolling invitation with Leti's photo, a live countdown, the party details, an
add-to-calendar button, the programme for the afternoon, and a hopping 3D bunny.

Built with SvelteKit + Svelte 5, three.js for the bunny, and
`adapter-static` so the whole thing prerenders to plain files — deployed to Vercel here,
but it would serve from any static host. No server, no database, no RSVP endpoint.

---

## 1. Fill in the real party details (do this first)

**Everything the family needs to edit lives in one file: [`src/lib/party.ts`](src/lib/party.ts).**
Nothing else needs touching. Every made-up value is marked `PLACEHOLDER`:

| Line | Field | What to put there |
| --- | --- | --- |
| 34 | `childName` | Her full name, shown on the invitation itself |
| 37 | `nickname` | Her short name, shown only on the “You’re Invited” screen |
| 53–54 | `startsAt`, `endsAt` | The real start and end, in ISO form |
| 57–59 | `dateLabel`, `yearLabel`, `timeLabel` | How the date and time are *written out* on the card |
| 62–66 | `venue` | Name, address lines, and the Google Maps search text |
| 69 | `hosts` | Who is inviting, shown at the end |
| 77 | `programNote` | The one line under the programme heading |
| 92–101 | `program` | The running order of the afternoon — see below |
| 104 | `tagline` | The short line under the big “3” |
| 107 | `siteUrl` | Your real domain — the link-preview image is built from it |

Below those, from line 123, is a `text` block holding **every word the invitation says** —
see [section 3](#3-reword-anything-on-the-page).

Find them all at any time with:

```sh
grep -n PLACEHOLDER src/lib/party.ts
```

### ⚠️ About the timezone

`startsAt` and `endsAt` end in **`+09:00`** (Japan time — the venue is in Nagoya):

```ts
startsAt: '2026-10-11T13:00:00+09:00',
```

Keep that offset. It is what makes the countdown correct on a guest's phone no matter
which timezone the phone is set to. If you drop it, a guest abroad sees the wrong number
of days. If the party moves to a different timezone, change `+09:00` to that one — do not
delete it.

`dateLabel`, `yearLabel`, and `timeLabel` are written out separately on purpose, so the
card can read "Saturday, the fifteenth of November" rather than a machine date. Update
them alongside `startsAt` — nothing cross-checks them for you.

## 2. Write the programme

The running order of the afternoon is the `program` array in the same file. Each row is
one slot on the timeline:

```ts
{ from: '1:30', to: '2:00', title: 'Opening Ceremony', note: 'Welcome remarks and a prayer' },
```

`note` is optional — leave it off and the row is just a time and an activity. Add or
remove rows freely; the timeline draws however many there are, with a dot per slot.

Two things nothing checks for you:

- **The first slot’s `from` and the last slot’s `to` should match `startsAt` and
  `endsAt`.** The countdown and the calendar file read the ISO stamps; the timeline reads
  these strings. Change one and change the other.
- **The times are written as the guest reads them**, bare and without “PM”. `programNote`
  is what says which half of the day they are in, so eight rows never have to repeat it.

## 3. Reword anything on the page

Every sentence the invitation says is in the `text` block at the bottom of
`src/lib/party.ts` — the gate's "You’re Invited" and "Tap to open", each section heading,
the "When"/"Where" labels, the button labels, the sign-off, and the words read aloud in
place of Leti's photo. No component file contains a sentence of English, so if you want to
change wording, it is in that one block.

```ts
gateHeadline: 'You’re Invited',
detailsHeading: 'The Details',
closingHeading: 'Hope to see you there!',
```

Nothing there is structural — the page only cares that each one says *something*. Names
ending in `Alt`, `Label`, `Hint` or `Message` are never drawn on screen; they are what a
screen reader announces, so keep them descriptive rather than decorative.

Four small bits of wording are deliberately left in their components, because they are
grammar rather than copy: the word "to" in the gate's "to **Leti’s** 3rd Birthday" (it
carries the emphasis and no-wrap markup), the "to" a screen reader reads between two
programme times, the countdown's spoken "3 days and 4 hours until the party" (it has to
work out its own plurals), and the ❖ flourishes around her name at the end. A comment in
`party.ts` says so too.

## 4. Run it locally

```sh
npm install
npm run dev          # http://localhost:5173
npm run dev -- --host  # also reachable from your phone on the same wifi
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Optimises the images, then builds into `build/` |
| `npm run preview` | Serves the real production build |
| `npm run images` | Re-runs only the image pipeline |
| `npm run check` | Type-checks everything |

## 5. Deploy to Vercel

`vercel.json` at the repository root is the whole configuration: it pins the build command
(the default `vite build` would skip the image pipeline and every picture on the page would
404), points Vercel at `build/`, and carries the site's security and cache headers.

**This folder is not a git repository yet**, so there are two ways in.

### Straight from your machine

```sh
npx vercel          # first run: a preview deployment
npx vercel --prod   # the real thing
```

It uploads the working directory and reads `.gitignore`, which is already right —
`node_modules`, `build/` and the generated `static/img/` are skipped, while
`assets/source/` (the original artwork the build needs) is not.

### Or through GitHub, for a deploy on every push

```sh
git init && git add -A && git commit -m "Leti's invitation"
git remote add origin <your repo>
git push -u origin main
```

Then in Vercel: **Add New → Project → Import** that repository. Leave every build setting
alone — `vercel.json` already says all of it.

No environment variables are needed. There are no secrets and no API keys.

**After the first deploy,** set `siteUrl` in `src/lib/party.ts` to the live domain and
redeploy, so the link preview in messengers points at the right image.

### Checking the deployment

Every security and cache header comes from `vercel.json`, and nothing local exercises it,
so it is worth confirming once against the live site:

```sh
curl -sI https://<your-domain>/ | grep -i 'content-security-policy\|x-frame-options\|x-content-type\|referrer-policy\|permissions-policy\|cache-control'
curl -sI https://<your-domain>/img/leti-640.avif | grep -i cache-control   # max-age=604800
curl -sI https://<your-domain>/no-such-page       # should serve the 404 page
```

The `frame-ancestors` one matters most: SvelteKit writes the rest of the Content Security
Policy into the page itself, but `frame-ancestors` only works as a real HTTP header, which
is why `vercel.json` sends it.

### Checking the production build locally

```sh
npm run build
npm run preview   # → http://localhost:4173
```

That serves the exact files Vercel will serve. Only the headers differ.

## 6. How it is put together

```
src/lib/party.ts            ← the only file you edit
src/lib/images.generated.json  generated by the image pipeline; do not hand-edit
src/lib/three/              the bunny rig, quality tiers, the scene singleton
src/lib/components/FloralFrame.svelte  the one floral frame around the whole invitation
src/lib/components/         the gate and every invitation section
src/routes/+page.svelte     the gate ⇄ invitation state machine
scripts/optimize-images.mjs sharp: AVIF + WebP derivatives, the share card, the app icons
assets/source/              the original artwork — never shipped to the browser
```

**Images.** The originals total about 2.1MB. The build converts them to AVIF and WebP at
two widths each, so the page actually ships around 300KB of imagery — Leti's portrait
alone goes from 913KB to 29KB. `static/img/` and the generated icons are build output and
are gitignored; re-create them with `npm run images`.

**The 3D layer draws exactly one thing: the bunny.** One WebGL context is created for the
whole site and survives the gate → invitation transition, because creating a second context
on mobile Safari risks silently losing the first. Pixel-ratio cap and antialiasing are
chosen from the device's core count and memory. Nothing decorative depends on it, so a
phone with no usable GPU loses only the bunny.

**One floral frame runs around the whole invitation.** `FloralFrame.svelte` is a single
`position: absolute; inset: 0` child of `<main>`, and `<main>` already spans the entire
document — so the frame's garland closes across the very top of the page, a lighter one
closes across the very bottom, and flowers run down both edges for the whole scroll length
in between. There is no scroll listener, no measured height and no offset arithmetic: the
frame is *part of* the page, so it stays exactly where it is and the flowers can never
slide against the words they surround. (An earlier version painted the florals into the
fixed WebGL canvas, which could not work: scrolling is composited on its own thread and a
`requestAnimationFrame` repaint is not, so every blossom lagged the page it was meant to be
glued to. A second version gave each section its own garland, which left the sides bare.)

**The side rails need their own derivative.** `floral-crown` is 675×1200 with all of its
paint in the top 31% and pure alpha below, so tiling it down the page would leave a gap of
empty canvas every tile. `scripts/optimize-images.mjs` therefore crops that flower band out
and stands it on end (`RAIL_CROP` + `rotate(-90)`) as `floral-rail`, a 380×675 strip whose
dense, cut edge lands on the *outside* so the blossoms reach inward toward the words. Each
rail draws it with `background-repeat: repeat-y` — twice, half a tile out of phase, because
the strip is dense at *both* cut ends and butted tiles would otherwise draw a hard seam
every tile. Each tape's fade lands inside the other's opaque stretch, so the flowers are
continuous at any document height. It is loaded through `assetSrc()` as a plain
`url(…webp)`: `image-set()` with `type()` needs Safari 17, and a custom property holding
an unsupported `image-set()` is invalid at computed-value time and resolves to `unset`,
which would wipe the fallback rather than fall back to it.

Only the movement is drawn in code — butterflies flutter on four perches down the rails,
gold sparkles twinkle, and the top and bottom garlands sway on the shared `bob` keyframe,
out of phase with each other. The rails never sway: `bob` on a document-tall element would
slide the whole edge. Every ornament is placed from a fixed table rather than
`Math.random()`, because the page is prerendered and random positions would differ between
the server's HTML and the browser's first render. Each perch has its own `use:reveal`, so
only the ornaments near the viewport are animating instead of a dozen `flutter` loops
running the length of a 4500px page.

Two tokens in `src/app.css` set the frame: `--frame-depth` (80px on a small phone, 144px at
the cap) for how deep the top garland hangs, and `--frame-rail` for how wide the side rails
are — which is also the gutter the reading column reserves, and the only thing keeping a
petal off a line of text. Both `floral-crown` instances declare `sizes="100vw"`,
deliberately: it has two derivatives, and a tighter `sizes` on one of them would make the
browser fetch both files instead of sharing one cached AVIF.

Because the frame is plain prerendered DOM, it is in the HTML — it paints before hydration,
with no WebGL, and with JavaScript switched off entirely. There is no second implementation
to keep in step. The gate wears the same component, where the "document" happens to be a
single screen.

## 7. Accessibility notes

These are deliberate and worth preserving if you edit the components:

- **The countdown does not announce every second.** The digits are `aria-hidden`; a
  separate polite live region says "42 days and 5 hours until the party" about once a
  minute. A per-second live region makes a page genuinely unusable with a screen reader.
- **The canvas is inert.** It is `aria-hidden`, `pointer-events: none`, and never
  focusable. Petting the bunny is a real `<button>` laid over its stage, so it works with
  a keyboard and a screen reader.
- **`prefers-reduced-motion` is fully honoured.** One `--motion` token switches off every
  decorative transform, the garland sway, the hop, and the parallax — and every section stays
  completely readable.
- **Colour is never the only information.** The programme’s gold line and rose dots are
  decoration; every slot names its time and its activity in text.
- **Text scales.** The type scale is in `rem` only and containers size from their content,
  so the largest OS font setting does not clip anything.
- **It works without JavaScript.** The invitation is prerendered; with JS off the gate is
  hidden and the full invitation is simply readable.
- **Contrast is checked, not guessed.** The ratios are recorded in a comment block at the
  top of `src/app.css`. `--gold` is 2.4:1 and is for ornament only — never put text in it.
