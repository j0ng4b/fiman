import {
    today,
    firstOfMonth,
    tomorrow,
    yesterday,
    addMonths,
    addDays,
    subDays,
    subMonths,
} from '../../src/common/dates.ts';

describe('dates', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    describe('today', () => {
        it('returns the current civil date in the application time zone', () => {
            vi.setSystemTime(new Date('2026-11-10T15:00:00Z'));
            expect(today()).toBe('2026-11-10');
        });

        it('returns the previous UTC date when the application time zone is still on the previous day', () => {
            vi.setSystemTime(new Date('2026-11-11T01:00:00Z'));
            expect(today()).toBe('2026-11-10');
        });

        it('changes the current date at midnight in the application time zone', () => {
            vi.setSystemTime(new Date('2026-11-11T02:59:59Z'));
            expect(today()).toBe('2026-11-10');

            vi.setSystemTime(new Date('2026-11-11T03:00:00Z'));
            expect(today()).toBe('2026-11-11');
        });
    });

    describe('tomorrow', () => {
        it('returns the next civil date in the application time zone', () => {
            vi.setSystemTime(new Date('2026-11-10T15:00:00Z'));
            expect(tomorrow()).toBe('2026-11-11');
        });

        it('calculates the next day based on the application time zone rather than UTC', () => {
            vi.setSystemTime(new Date('2026-11-11T01:00:00Z'));
            expect(tomorrow()).toBe('2026-11-11');
        });

        it('handles month and year transitions', () => {
            vi.setSystemTime(new Date('2026-12-31T15:00:00Z'));
            expect(tomorrow()).toBe('2027-01-01');
        });
    });

    describe('yesterday', () => {
        it('returns the previous civil date in the application time zone', () => {
            vi.setSystemTime(new Date('2024-11-26T15:00:00Z'));
            expect(yesterday()).toBe('2024-11-25');
        });

        it('calculates the previous day based on the application time zone rather than UTC', () => {
            vi.setSystemTime(new Date('2026-05-05T00:00:00Z'));
            expect(yesterday()).toBe('2026-05-03');
        });

        it('handles month and year transitions', () => {
            vi.setSystemTime(new Date('2025-01-01T15:00:00Z'));
            expect(yesterday()).toBe('2024-12-31');
        });
    });

    describe('addDays', () => {
        it('adds the specified number of days', () => {
            expect(addDays('2026-01-05', 5)).toBe('2026-01-10');
        });

        it('subtracts days when given a negative amount', () => {
            expect(addDays('2026-01-06', -5)).toBe('2026-01-01');
        });

        it('handles month and year transitions', () => {
            expect(addDays('2026-12-26', 10)).toBe('2027-01-05');
        });

        it('handles leap years', () => {
            expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
        });
    });

    describe('subDays', () => {
        it('subtracts the specified number of days', () => {
            expect(subDays('2026-01-10', 5)).toBe('2026-01-05');
        });

        it('handles month and year transitions', () => {
            expect(subDays('2028-01-01', 20)).toBe('2027-12-12');
        });
    });

    describe('addMonths', () => {
        it('adjusts the day when the target month has fewer days', () => {
            expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
        });

        it('handles leap years when adding months', () => {
            expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
        });

        it('handles month and year transitions', () => {
            expect(addMonths('2022-01-01', 14)).toBe('2023-03-01');
        });

        it('uses the adjusted date when adding months successively', () => {
            expect(addMonths(addMonths('2026-01-31', 1), 1)).toBe('2026-03-28');
        });
    });

    describe('subMonths', () => {
        it('adjusts the day when the target month has fewer days', () => {
            expect(subMonths('2029-05-31', 1)).toBe('2029-04-30');
        });

        it('handles month and year transitions', () => {
            expect(subMonths('2030-01-01', 1)).toBe('2029-12-01');
        });
    });

    describe('firstOfMonth', () => {
        it('returns the first day of the given month', () => {
            expect(firstOfMonth('2026-11-17')).toBe('2026-11-01');
        });

        it('preserves the year when crossing a year boundary', () => {
            expect(firstOfMonth('2027-01-31')).toBe('2027-01-01');
        });
    });
});
