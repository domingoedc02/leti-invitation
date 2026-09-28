/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT.
 *
 *  Every party detail AND every word the invitation says is in here. Nothing
 *  else on the site contains a sentence of English, so if you want to reword
 *  something, it is on this page somewhere.
 *
 *  Every line marked PLACEHOLDER below is made up and must be replaced with the
 *  real party details before you send the link to anyone.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** One line of the afternoon's programme. */
export type ProgramSlot = { from: string; to: string; title: string; note?: string };

/**
 * e.g. 3 -> "3rd". Declared up here because the wording below calls it: a function
 * declaration is hoisted, but reading it before it appears would be confusing.
 */
const ordinals = ['th', 'st', 'nd', 'rd'] as const;
export function ordinal(n: number): string {
	const rem100 = n % 100;
	if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
	return `${n}${ordinals[n % 10] ?? 'th'}`;
}

/**
 * Held apart from the object below so the sentences in `text` can use them. An object
 * literal cannot refer to itself while it is still being built.
 */
/** Her full name: the hero, the signature, the browser tab, the calendar file and the
 * link preview. */
const childName = 'Leticia Khloe';
/** What the family calls her. Used only on the "You're Invited" screen, in
 * "to Leti's 3rd Birthday". */
const nickname = 'Leticia';
const age = 3;

export const party = {
	childName,
	nickname,
	age,

	/**
	 * PLACEHOLDER - the real start and end of the party.
	 *
	 * Keep the `+09:00` on the end (that is Japan time, where the venue is). It tells
	 * every guest's phone which timezone the party is in, so the countdown and the
	 * calendar file stay correct even for a guest whose phone is set to another country.
	 * If the party is somewhere else, change the offset (e.g. `-07:00`).
	 */
	startsAt: '2026-10-11T13:00:00+09:00',
	endsAt: '2026-10-11T17:00:00+09:00',

	/** PLACEHOLDER - how the date and time are written out on the invitation. */
	dateLabel: 'Sunday, October 11',
	yearLabel: '2026',
	timeLabel: '1:00 PM',

	/** PLACEHOLDER - the venue. `mapsQuery` is what gets searched on Google Maps. */
	venue: {
		name: 'Panalosa Japan, Inc.',
		addressLines: ['Hanaguruma Bldg', 'South 3A 5-16-17 Meieki, Nakamura-Ku, Nagoya Shi, Aichi Ken 450-0002'],
		mapsQuery: 'Panalosa Japan, Inc., Hanaguruma Bldg, South 3A 5-16-17 Meieki, Nakamura-Ku, Nagoya Shi, Aichi Ken 450-0002',
		/** Getting there, shown under the address. Add or remove rows freely. */
		notes: [
			{ label: 'Parking', text: 'Coin parking' },
			{ label: 'Train', text: '10 minutes’ walk from Nagoya Station' }
		]
	},

	/** PLACEHOLDER - who is inviting. Shown at the end of the invitation. */
	hosts: 'Together with her loving Mama & Papa',

	/**
	 * PLACEHOLDER - one small line under the programme heading.
	 *
	 * The slots below are written as bare clock times, so this is what tells a guest
	 * they are afternoon times rather than making every row repeat "PM".
	 */
	programNote: 'All times are in the afternoon.',

	/**
	 * PLACEHOLDER - the running order of the afternoon. Every one of these is made up.
	 *
	 * Keep the first slot's `from` the same as `startsAt` and the last slot's `to` the
	 * same as `endsAt`: the countdown and the calendar file read the ISO stamps above,
	 * these strings are what the guest reads, and nothing cross-checks the two for you.
	 *
	 * `from` and `to` are separate on purpose. The page prints them as "1:00 – 1:30" but
	 * reads them aloud as "1:00 to 1:30", and keeping them apart means you only type each
	 * time once.
	 *
	 * Add or remove rows freely - the timeline draws however many there are.
	 */
	program: [
		{ from: '1:00', to: '1:30', title: 'Arrival of guest', note: 'Find your seats and say hello' },
		{ from: '1:30', to: '2:00', title: 'Grand entrance & Opening ceremony', note: 'Welcome remarks and a prayer' },
		{ from: '2:00', to: '2:30', title: 'Cake ceremony & Picture Taking' },
		{ from: '2:30', to: '3:30', title: 'Eat time'},
		{ from: '3:30', to: '4:30', title: 'Fun activities & games'},
		{ from: '4:30', to: '5:30', title: 'Magic' },
		{ from: '5:30', to: '6:00', title: 'Giving of Souvenirs' }
	] satisfies ProgramSlot[],

	/** A short line under the big "3". PLACEHOLDER. */
	tagline: 'is turning three!',

	/** Used for the share-card link preview. Must be the real, live domain. */
	siteUrl: 'https://invite.enlinka.co',

	/**
	 * ─── EVERY WORD THE INVITATION SAYS ──────────────────────────────────────────
	 *
	 * Reword any of these freely. None of it is structural: the page does not care
	 * what these say, only that they say something. They are grouped in the order a
	 * guest meets them, from the tap-to-open screen down to the signature.
	 *
	 * Four small bits of wording are NOT here, because they are grammar rather than
	 * copy: the word "to" in the gate's "to Leti's 3rd Birthday" (it carries the
	 * emphasis and no-wrap markup around her name), the "to" a screen reader reads
	 * between two programme times, the "3 days and 4 hours until the party" sentence
	 * the countdown speaks (it has to do its own plurals), and the ❖ flourishes
	 * around her name at the very end.
	 */
	text: {
		/* The tap-to-open gate — the first screen a guest sees. */
		gateEyebrow: 'Please join us to celebrate',
		gateHeadline: 'You’re Invited',
		gatePrompt: 'Tap to open',
		/** Not shown. This is what a screen reader reads out for the whole-screen tap. */
		gateOpenLabel: `Open ${nickname}’s ${ordinal(age)} Birthday invitation`,

		/** Not shown either, until a keyboard user presses Tab. Jumps past the hero. */
		skipLink: 'Skip to the party details',

		/* The hero, with her photo. */
		heroEyebrow: 'Our little one is growing up',
		heroTurningWord: 'turning',
		/** Read aloud in place of the photo, so describe what is in it. */
		heroPhotoAlt: `${childName}, smiling and waving, wearing a pink top and a pink hair scrunchie`,

		/* The countdown. The second heading replaces the first on the day itself. */
		countdownHeading: 'Counting down',
		countdownArrivedHeading: 'The day is here!',
		countdownToday: `Today we celebrate ${childName}! 🎂`,
		countdownUnits: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },

		/* The details card. */
		detailsHeading: 'The Details',
		whenLabel: 'When',
		whereLabel: 'Where',
		directionsLabel: 'Get directions',
		/** Only read aloud, warning that the button leaves the page. */
		directionsHint: '(opens Google Maps in a new tab)',
		calendarLabel: 'Add to calendar',
		/** Announced after the .ics file is saved. */
		calendarDoneMessage: 'Calendar file downloaded.',

		/* The programme. The times themselves are in `program` above. */
		programHeading: 'The Programme',

		/* The closing, with the bunny. */
		closingHeading: 'Hope to see you there!',
		/** The bunny's tap target has no visible label, so this is its whole name. */
		petBunnyLabel: 'Pet the bunny',
		petBunnyReaction: 'The bunny does a happy hop!',

		/* The link preview in Messenger, Instagram and the like. */
		/** The bold title under the preview. */
		shareTitle: `You’re invited to ${nickname}’s ${ordinal(age)} Birthday`,
		/** The three lines drawn onto the preview image itself, by scripts/optimize-images.mjs.
		 * Run `npm run images` after changing them. */
		shareCardHeadline: 'You’re Invited',
		shareCardLine: `to ${nickname}’s ${ordinal(age)} Birthday`,
		shareCardDate: 'Sunday, October 11',

		/** Describes the picture on the card that appears when the link is shared. */
		shareImageAlt: `${childName} with flowers and a little bunny`
	}
} as const;

/** The party start as a real Date, used by the countdown and the calendar file. */
export const startsAtDate = new Date(party.startsAt);
export const endsAtDate = new Date(party.endsAt);

/** e.g. "Leti's 3rd Birthday" - built once so the wording never drifts apart. */
export const partyTitle = `${party.childName}'s ${ordinal(party.age)} Birthday`;

/**
 * The sentence under the link preview in a messenger. It stitches four details
 * together, which is why it lives out here rather than in `text` above - an object
 * cannot quote its own fields while it is being built.
 */
// The venue name may already end in a full stop ("Inc."), so don't add a second one.
export const shareDescription = `${party.childName} ${party.tagline} Join us on ${party.dateLabel} at ${party.venue.name.replace(/\.?$/, '.')}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
	party.venue.mapsQuery
)}`;
