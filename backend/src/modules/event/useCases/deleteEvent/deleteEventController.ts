import { BaseController } from "@shared/BaseController";
import { DeleteEventUseCaseRequestDto } from "./deleteEventDTO";
import { DeleteEventUseCase } from "./deleteEventUseCase";

export class DeleteEventController extends BaseController {
  private useCase: DeleteEventUseCase;

  constructor (useCase: DeleteEventUseCase) {
    super();
    this.useCase = useCase;
  }

  async executeImpl (): Promise<any> {
    const dto: DeleteEventUseCaseRequestDto = this.req.body as DeleteEventUseCaseRequestDto;

    try {
      const result = await this.useCase.execute(dto);

      // TODO: Implement the response logic

    } catch (err) {
      return this.fail(err)
    }
  }
}
