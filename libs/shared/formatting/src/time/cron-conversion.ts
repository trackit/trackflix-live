export class CronConversion {
  public static toCronExpression(date: Date): string {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const minutes = date.getUTCMinutes();
    const hours = date.getUTCHours();
    const days = date.getUTCDate();
    const months = date.getUTCMonth() + 1;
    const dayOfWeek = '?';
    const year = date.getUTCFullYear();

    return `cron(${minutes} ${hours} ${days} ${months} ${dayOfWeek} ${year})`;
  }
}
