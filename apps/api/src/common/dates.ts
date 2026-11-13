const TIME_ZONE = 'America/Sao_Paulo';

const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

/**
 * Returns the current civil date in the application time zone
 * (America/Sao_Paulo), formatted as `YYYY-MM-DD`.
 *
 * @param now Instant to convert. Defaults to the current time.
 *
 * @returns The date as `YYYY-MM-DD`.
 */
export function todayISO(now: Date = new Date()): string {
    const parts = Object.fromEntries(
        formatter.formatToParts(now).map((part) => [part.type, part.value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
}
