interface SourceRequestDto {
  name: string;
  protocol: string;
}

export interface UpdateEventUseCaseRequestDto {
  name: string;
  description: string;
  onAirStartTime: Date;
  onAirEndTime: Date;
  status: string;
  source: SourceRequestDto;
}
