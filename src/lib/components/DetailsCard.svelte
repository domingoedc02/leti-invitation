<script lang="ts">
	import { party, mapsUrl, startsAtDate } from '$lib/party';
	import { downloadIcs } from '$lib/ics';
	import { reveal } from '$lib/actions/reveal';

	let saved = $state(false);

	function save() {
		downloadIcs();
		saved = true;
		setTimeout(() => (saved = false), 3200);
	}

	// A machine-readable stamp for the <time> element, alongside the pretty wording.
	const machineDate = startsAtDate.toISOString();
</script>

<section class="details" aria-labelledby="details-heading">
	<!-- tabindex="-1" so the skip link actually moves focus here, not just the scroll
     position, which is all a fragment link guarantees on its own. -->
	<h2 id="details-heading" class="heading" tabindex="-1" use:reveal>{party.text.detailsHeading}</h2>

	<dl class="list">
		<div class="row" use:reveal={{ delay: 80 }}>
			<dt>
				<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
					<rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="var(--rose-ink)" stroke-width="1.8" />
					<path d="M3 10h18M8 3v4M16 3v4" stroke="var(--rose-ink)" stroke-width="1.8" stroke-linecap="round" />
				</svg>
				<span>{party.text.whenLabel}</span>
			</dt>
			<dd>
				<time datetime={machineDate}>
					<span class="strong">{party.dateLabel}</span>
					<span class="soft">{party.yearLabel}</span>
					<span class="soft">{party.timeLabel}</span>
				</time>
			</dd>
		</div>

		<div class="row" use:reveal={{ delay: 160 }}>
			<dt>
				<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
					<path
						d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
						fill="none"
						stroke="var(--rose-ink)"
						stroke-width="1.8"
					/>
					<circle cx="12" cy="10" r="2.6" fill="none" stroke="var(--rose-ink)" stroke-width="1.8" />
				</svg>
				<span>{party.text.whereLabel}</span>
			</dt>
			<dd>
				<span class="strong">{party.venue.name}</span>
				{#each party.venue.addressLines as line (line)}
					<span class="soft">{line}</span>
				{/each}
				<ul class="notes">
					{#each party.venue.notes as note (note.label)}
						<li><span class="note-label">{note.label}</span> {note.text}</li>
					{/each}
				</ul>
			</dd>
		</div>
	</dl>

	<div class="actions" use:reveal={{ delay: 240 }}>
		<a class="button primary tap-target" href={mapsUrl} target="_blank" rel="noopener noreferrer">
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
				<path d="M3 11 21 4l-7 17-2.5-7.5L3 11Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
			</svg>
			{party.text.directionsLabel}
			<span class="sr-only">{party.text.directionsHint}</span>
		</a>

		<button type="button" class="button tap-target" onclick={save}>
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
				<rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8" />
				<path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
			</svg>
			{party.text.calendarLabel}
		</button>
	</div>

	<!-- Confirmation for the calendar download, announced politely. -->
	<p class="status" role="status">{saved ? party.text.calendarDoneMessage : ''}</p>
</section>

<style>
	.details {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-m);
		text-align: center;
	}

	.heading {
		font-size: var(--step-2);
		color: var(--rose-ink);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-s);
		width: 100%;
		max-width: 26rem;
		margin: 0;
	}

	.row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-m) var(--space-s);
		background: rgb(255 255 255 / 78%);
		border: 1px solid var(--blush);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow-soft);
	}

	dt {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--step--1);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--rose-ink);
	}

	dd {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		margin: 0;
	}

	time {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
	}

	.strong {
		font-family: var(--font-display);
		font-size: var(--step-1);
		color: var(--ink);
	}

	.soft {
		color: var(--ink-soft);
		font-size: var(--step-0);
	}

	/* Getting-there notes, set off from the address by a hairline. */
	.notes {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		margin: var(--space-s) auto 0;
		padding: var(--space-s) 0 0;
		list-style: none;
		border-top: 1px solid var(--blush);
		color: var(--ink-soft);
		font-size: var(--step--1);
	}

	.note-label {
		font-weight: 600;
		color: var(--rose-ink);
	}

	.note-label::after {
		content: ' ·';
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-xs);
		width: 100%;
		max-width: 26rem;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		flex: 1 1 11rem;
		padding: var(--space-s) var(--space-m);
		font-family: var(--font-body);
		font-size: var(--step-0);
		font-weight: 600;
		color: var(--rose-ink);
		text-decoration: none;
		background: var(--white);
		border: 1.5px solid var(--rose);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-soft);
		transition:
			scale 180ms var(--ease-bounce),
			box-shadow 180ms var(--ease-soft),
			background-color 180ms var(--ease-soft);
	}

	.button.primary {
		color: var(--white);
		/* rose-ink behind white text clears 5.5:1. */
		background: var(--rose-ink);
		border-color: var(--rose-ink);
	}

	.button:hover {
		box-shadow: var(--shadow-lift);
	}

	/* A little squish on press: the only feedback a finger gets. */
	.button:active {
		scale: 0.96;
	}

	.status {
		min-height: 1.5em;
		font-size: var(--step--1);
		color: var(--rose-ink);
	}

	/* Inside the card (see --card-width in app.css) both measures widen. The actions row
	   is the reason for the number: `.button` is `flex: 1 1 11rem`, so two pills plus the
	   gap need just over 22rem of content box before "Add to calendar" stops wrapping onto
	   a second line inside its own pill. */
	@media (min-width: 48rem) {
		.list,
		.actions {
			max-width: 30rem;
		}
	}
</style>
