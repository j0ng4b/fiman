export type IsoDate = string;

const TIME_ZONE = 'America/Sao_Paulo';

const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

function splitDate(date: Date) {
    return Object.fromEntries(
        formatter
            .formatToParts(date)
            .filter((part) => ['year', 'month', 'day'].includes(part.type))
            .map(({ type, value }) => [type, value]),
    );
}

/**
 * Returns the current civil date in the application time zone.
 *
 * @returns The current civil date in `YYYY-MM-DD` format.
 */
export function today(): IsoDate {
    const date = splitDate(new Date());
    return [date.year, date.month, date.day].join('-');
}

/**
 * Returns the next civil date in the application time zone.
 *
 * @returns The next civil date in `YYYY-MM-DD` format.
 */
export function tomorrow(): IsoDate {
    return addDays(today(), 1);
}

/**
 * Returns the previous civil date in the application time zone.
 *
 * @returns The previous civil date in `YYYY-MM-DD` format.
 */
export function yesterday(): IsoDate {
    return subDays(today(), 1);
}

/**
 * Adds a number of calendar days to a civil date.
 *
 * @param date - Civil date in `YYYY-MM-DD` format.
 * @param days - Number of days to add. Negative values subtract days.
 *
 * @returns The resulting civil date in `YYYY-MM-DD` format.
 */
export function addDays(date: IsoDate, days: number): IsoDate {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(Date.UTC(year, month - 1, day + days))
        .toISOString()
        .slice(0, 10);
}

/**
 * Subtracts a number of calendar days from a civil date.
 *
 * @param date - Civil date in `YYYY-MM-DD` format.
 * @param days - Number of days to subtract.
 *
 * @returns The resulting civil date in `YYYY-MM-DD` format.
 */
export function subDays(date: IsoDate, days: number): IsoDate {
    return addDays(date, -days);
}

/**
 * Adds a number of calendar months to a civil date.
 *
 * If the resulting month does not contain the original day, the day is adjusted
 * to the last day of the resulting month.
 *
 * @param date - Civil date in `YYYY-MM-DD` format.
 * @param months - Number of months to add. Negative values subtract months.
 *
 * @returns The resulting civil date in `YYYY-MM-DD` format.
 */
export function addMonths(date: IsoDate, months: number): IsoDate {
    const [year, month, day] = date.split('-').map(Number);

    const target = new Date(Date.UTC(year, month - 1 + months, 1));

    const lastDay = new Date(
        Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
    ).getUTCDate();

    target.setUTCDate(Math.min(day, lastDay));

    return target.toISOString().slice(0, 10);
}

/**
 * Subtracts a number of calendar months from a civil date.
 *
 * If the resulting month does not contain the original day, the day is adjusted
 * to the last day of the resulting month.
 *
 * @param date - Civil date in `YYYY-MM-DD` format.
 * @param months - Number of months to subtract.
 *
 * @returns The resulting civil date in `YYYY-MM-DD` format.
 */
export function subMonths(date: IsoDate, months: number): IsoDate {
    return addMonths(date, -months);
}

/**
 * Returns the first day of the month for a given civil date.
 *
 * @param date - Civil date in `YYYY-MM-DD` format.
 *
 * @returns The first day of the month in `YYYY-MM-DD` format.
 */
export function firstOfMonth(date: IsoDate): IsoDate {
    return `${date.slice(0, 7)}-01`;
}
