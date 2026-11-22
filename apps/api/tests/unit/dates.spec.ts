import { todayISO, firstOfMonth, toISODate } from '../../src/common/dates.ts';

describe('todayISO', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it('returns the current date in the application time zone', () => {
        vi.setSystemTime(new Date('2026-11-10T15:00:00Z'));
        expect(todayISO()).toBe('2026-11-10');
    });

    it('returns the previous UTC date when São Paulo is still on the previous day', () => {
        vi.setSystemTime(new Date('2026-11-10T15:00:00Z'));
        expect(todayISO()).toBe('2026-11-10');
    });
});

describe('toISODate', () => {
    it('returns the date in the application time zone', () => {
        expect(toISODate(new Date('2026-11-11T01:00:00Z'))).toBe('2026-11-10');
    });

    it('preserves the date when UTC and São Paulo are on the same day', () => {
        expect(toISODate(new Date('2026-11-10T15:00:00Z'))).toBe('2026-11-10');
    });

    it('returns the previous day when São Paulo is behind UTC', () => {
        expect(toISODate(new Date('2026-11-10T02:00:00Z'))).toBe('2026-11-09');
    });
});

describe('firstOfMonth', () => {
    it('returns the first day of the given month', () => {
        expect(firstOfMonth('2026-11-17')).toBe('2026-11-01');
    });

    it('handles year transitions', () => {
        expect(firstOfMonth('2027-01-31')).toBe('2027-01-01');
    });
});
