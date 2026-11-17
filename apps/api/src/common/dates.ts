const TIME_ZONE = 'America/Sao_Paulo';

const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

/**
 * Returns the current civil date in the application time zone.
 *
 * @returns The civil date in `YYYY-MM-DD` format.
 */
export function todayISO(): string {
    const parts = Object.fromEntries(
        formatter
            .formatToParts(new Date())
            .map((part) => [part.type, part.value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Returns the first day of the month for a given civil date.
 *
 * @param date - Civil date in `YYYY-MM-DD` format.
 *
 * @returns The first day of the month as `YYYY-MM-01` format.
 */
export function firstOfMonth(date: string): string {
    return `${date.slice(0, 7)}-01`;
}
