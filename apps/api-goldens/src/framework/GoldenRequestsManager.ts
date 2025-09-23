import { ScenarioStepBase, ScenarioStepRequest } from './Scenario';

export class GoldenRequestsManager {
  private readonly cache: Record<string, string> = {};

  private readonly apiUrl: string;

  public constructor({ apiUrl }: { apiUrl: string }) {
    this.apiUrl = apiUrl;
  }

  public async request(
    request: Pick<ScenarioStepRequest, 'route' | 'method' | 'body' | 'user'> &
      Pick<ScenarioStepBase, 'name'> & { token: string }
  ) {
    const route =
      typeof request.route === 'string'
        ? request.route
        : this.processCacheQuery(request.route);

    const response = await fetch(`${this.apiUrl}${route}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${request.token}`,
      },
      body:
        request.body !== undefined ? JSON.stringify(request.body) : undefined,
    });

    const body = await response.text();

    this.cache[request.name] = body;

    return {
      status: response.status,
      body,
    };
  }

  public processCacheQuery(
    query: (cache: Record<string, string>) => string
  ): string {
    return query(this.cache);
  }
}
