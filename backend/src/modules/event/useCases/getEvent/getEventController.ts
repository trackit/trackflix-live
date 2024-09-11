import { BaseController } from "@shared/BaseController";
import { GetEventUseCase } from "./getEventUseCase";
import { GetEventUseCaseRequestDto } from "./getEventDTO";

export class GetEventController extends BaseController {
  private useCase: GetEventUseCase;

  constructor (useCase: GetEventUseCase) {
    super();
    this.useCase = useCase;
  }

  async executeImpl (): Promise<any> {
    const dto: GetEventUseCaseRequestDto = this.req.body as GetEventUseCaseRequestDto;

    try {
      const result = await this.useCase.execute(dto);

      // TODO: Implement the response logic

    } catch (err) {
      return this.fail(err)
    }
  }
}
