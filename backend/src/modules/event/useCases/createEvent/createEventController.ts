import { BaseController } from "@shared/BaseController";
import { CreateEventUseCase } from "./createEventUseCase";
import { CreateEventUseCaseRequestDto } from "./createEventDTO";


export class CreateEventController extends BaseController {
  private useCase: CreateEventUseCase;

  constructor (useCase: CreateEventUseCase) {
    super();
    this.useCase = useCase;
  }

  async executeImpl (): Promise<any> {
    const dto: CreateEventUseCaseRequestDto = this.req.body as CreateEventUseCaseRequestDto;

    try {
      const result = await this.useCase.execute(dto);

      // TODO: Implement the response logic

    } catch (err) {
      return this.fail(err)
    }
  }
}
