import { BaseController } from "@shared/BaseController";
import { UpdateEventUseCase } from "./updateEventUseCase";
import { UpdateEventUseCaseRequestDto } from "./updateEventDTO";

export class UpdateEventController extends BaseController {
  private useCase: UpdateEventUseCase;

  constructor (useCase: UpdateEventUseCase) {
    super();
    this.useCase = useCase;
  }

  async executeImpl (): Promise<any> {
    const dto: UpdateEventUseCaseRequestDto = this.req.body as UpdateEventUseCaseRequestDto;

    try {
      const result = await this.useCase.execute(dto);

      // TODO: Implement the response logic

    } catch (err) {
      return this.fail(err)
    }
  }
}
