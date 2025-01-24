import { CronConversion } from "./cron-conversion";

describe('CronConversion', () => {
  it('should convert a Date object to a valid cron expression', () => {
    const date = new Date("2025-01-24T16:55:58.618Z");
    const expected_cron = '55 16 24 1 5';

    const cronExpression = CronConversion.toCronExpression(date);

    expect(cronExpression).toBe(expected_cron);
  });

  it('should throw an error if date is invalid', () => {
    const date = new Date('invalid');

    expect(() => CronConversion.toCronExpression(date)).toThrow('Invalid date');
  });
});
