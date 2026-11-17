import { todayISO, firstOfMonth } from '../../src/common/dates.ts';

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

    it('uses the São Paulo date when UTC is already the next day', () => {
        // 22:00 on November 10 in São Paulo is 01:00 on November 11 in UTC.
        vi.setSystemTime(new Date('2026-11-11T01:00:00Z'));

        expect(todayISO()).toBe('2026-11-10');
    });

    it('uses the next day when the date changes in São Paulo', () => {
        // 21:00 on November 10 in São Paulo is 00:00 on November 11 in UTC.
        vi.setSystemTime(new Date('2026-11-11T00:00:00Z'));

        expect(todayISO()).toBe('2026-11-10');
    });
});

describe('firstOfMonth', () => {
    it('returns the first day of the given month', () => {
        expect(firstOfMonth('2026-11-17')).toBe('2026-11-01');
    });

    it('preserves the year and month', () => {
        expect(firstOfMonth('2027-01-31')).toBe('2027-01-01');
    });
});
