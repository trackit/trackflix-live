interface EventDto {
  name: string;
  description: string;
  onAirStartTime: Date;
  onAirEndTime: Date;
  status: string;
  source: SourceDto;
}
