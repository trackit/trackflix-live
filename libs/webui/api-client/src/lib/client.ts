import { fetchAuthSession } from 'aws-amplify/auth';
import axios, { AxiosInstance, CreateAxiosDefaults, AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(config: CreateAxiosDefaults) {
    this.axiosInstance = axios.create(config);

    // Add auth token interceptor
    this.axiosInstance.interceptors.request.use(async (config) => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken;

      if (!token || !config.headers)
        throw new ApiError('Authentication failed');
      config.headers.Authorization = `Bearer ${token.toString()}`;
      return config;
    });

    // Simplified error interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        throw new ApiError(
          error.message,
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  // Generic request method to reduce code duplication
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: unknown
  ) {
    try {
      const response = await this.axiosInstance({
        method,
        url,
        data,
      });
      return response.data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }

  async get<T>(url: string) {
    return this.request<T>('get', url);
  }

  async post<T>(url: string, data: unknown) {
    return this.request<T>('post', url, data);
  }

  async put<T>(url: string, data: unknown) {
    return this.request<T>('put', url, data);
  }

  async delete<T>(url: string) {
    return this.request<T>('delete', url);
  }
}

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});
