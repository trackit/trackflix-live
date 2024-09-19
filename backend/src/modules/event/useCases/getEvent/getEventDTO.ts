interface SourceRequestDto {
  name: string;
  protocol: string;
}

export interface GetEventUseCaseRequestDto {
  name: string;
  description: string;
  onAirStartTime: Date;
  onAirEndTime: Date;
  status: string;
  source: SourceRequestDto;
}
