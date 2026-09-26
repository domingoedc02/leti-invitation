import { party, partyTitle, startsAtDate, endsAtDate } from './party';

/** iCalendar wants UTC stamps as YYYYMMDDTHHMMSSZ. */
function stamp(date: Date): string {
	return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Commas, semicolons and backslashes are structural in iCalendar and must escape. */
function escapeText(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\;')
		.replace(/,/g, '\\,')
		.replace(/\r?\n/g, '\\n');
}

/**
 * Lines longer than 75 octets must be folded, or strict parsers (including some
 * versions of Apple Calendar) reject the whole file.
 */
function fold(line: string): string {
	if (line.length <= 73) return line;
	const parts: string[] = [];
	let rest = line;
	parts.push(rest.slice(0, 73));
	rest = rest.slice(73);
	while (rest.length > 72) {
		parts.push(` ${rest.slice(0, 72)}`);
		rest = rest.slice(72);
	}
	if (rest) parts.push(` ${rest}`);
	return parts.join('\r\n');
}

export function buildIcs(): string {
	const location = [party.venue.name, ...party.venue.addressLines].join(', ');
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Leti Birthday Invitation//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:leti-birthday-${stamp(startsAtDate)}@invitation`,
		`DTSTAMP:${stamp(new Date())}`,
		`DTSTART:${stamp(startsAtDate)}`,
		`DTEND:${stamp(endsAtDate)}`,
		`SUMMARY:${escapeText(partyTitle)}`,
		// The programme lives on the invitation rather than in here: a calendar entry that
		// repeated all eight slots would be unreadable in a month view, and the times would
		// go stale the moment the running order changed.
		`DESCRIPTION:${escapeText(`${party.childName} ${party.tagline} See the invitation for the full programme.`)}`,
		`LOCATION:${escapeText(location)}`,
		'BEGIN:VALARM',
		'TRIGGER:-P1D',
		'ACTION:DISPLAY',
		`DESCRIPTION:${escapeText(`${partyTitle} is tomorrow!`)}`,
		'END:VALARM',
		'END:VEVENT',
		'END:VCALENDAR'
	];
	// iCalendar requires CRLF line endings, not plain newlines.
	return lines.map(fold).join('\r\n');
}

/** Hands the guest a .ics file. Works on iOS and Android with no third party. */
export function downloadIcs(): void {
	const blob = new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${party.childName.toLowerCase().replace(/\s+/g, '-')}-birthday.ics`;
	document.body.append(link);
	link.click();
	link.remove();
	// Give the browser a moment to start the download before revoking.
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
