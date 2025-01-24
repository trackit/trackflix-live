export class CronConversion {
  public static toCronExpression(date: Date): string {
    if (isNaN(date.getTime()))
      throw new Error('Invalid date');

    const minutes = date.getUTCMinutes();
    const hours = date.getUTCHours();
    const days = date.getUTCDate();
    const months = date.getUTCMonth() + 1;
    const dayOfWeek = date.getUTCDay();

    return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static fromCronExpression(cronExpression: string): Date {
    throw new Error('Not implemented');
  }
}
