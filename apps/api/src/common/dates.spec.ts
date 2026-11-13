import { todayISO } from './dates.ts';

describe('todayISO', () => {
    it('uses the São Paulo date when UTC is already the next day', () => {
        // 22:00 on 2026-11-10 in São Paulo is 01:00 on the 11th in UTC.
        expect(todayISO(new Date('2026-11-11T01:00:00Z'))).toBe('2026-11-10');
    });
});
