import { SaveResultsAdapter } from './saveResults.adapter';

describe('Save results adapter', () => {
  it('should call use case', async () => {
    const { useCase, adapter } = setup();

    const eventId = '9ce722b8-121f-4f9a-b2ee-3f94760abfd2';

    useCase.saveResults.mockImplementation(() => ({}));

    await adapter.handle({
      eventId,
    });

    expect(useCase.saveResults).toHaveBeenCalledWith(eventId);
  });
});

const setup = () => {
  const useCase = {
    saveResults: jest.fn(),
  };
  const adapter = new SaveResultsAdapter({
    useCase,
  });

  return {
    useCase,
    adapter,
  };
};
