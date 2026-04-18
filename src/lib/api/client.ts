import { getApiEnvironmentConfig } from "@/lib/config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestConfig = {
  method?: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
};

export type ApiResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export type ApiClientError = {
  message: string;
  status?: number;
  code: "NETWORK_ERROR" | "TIMEOUT" | "HTTP_ERROR" | "PARSE_ERROR";
  details?: unknown;
};

type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig;
type ResponseInterceptor<T> = (response: ApiResponse<T>) => ApiResponse<T>;
type ErrorInterceptor = (error: ApiClientError) => ApiClientError;

const DEFAULT_TIMEOUT_MS = 10_000;

function createApiClientError(
  code: ApiClientError["code"],
  message: string,
  status?: number,
  details?: unknown
): ApiClientError {
  return { code, message, status, details };
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(baseUrl: string, path: string, query?: ApiRequestConfig["query"]): string {
  const url = new URL(`${baseUrl}${normalizePath(path)}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function buildHeaders(headers?: Record<string, string>, hasBody?: boolean): HeadersInit {
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor<unknown>[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseUrl?: string, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
    this.baseUrl = baseUrl ?? getApiEnvironmentConfig().apiBaseUrl;
    this.defaultTimeoutMs = timeoutMs;
  }

  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor<unknown>);
  }

  public addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  public async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const finalConfig = this.applyRequestInterceptors(config);
    const timeoutMs = finalConfig.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(buildUrl(this.baseUrl, finalConfig.path, finalConfig.query), {
        method: finalConfig.method ?? "GET",
        headers: buildHeaders(finalConfig.headers, finalConfig.body !== undefined),
        body: finalConfig.body !== undefined ? JSON.stringify(finalConfig.body) : undefined,
        signal: controller.signal,
      });

      const parsedData = await this.parseResponseBody<T>(response);

      if (!response.ok) {
        throw createApiClientError(
          "HTTP_ERROR",
          `Request failed with status ${response.status}`,
          response.status,
          parsedData
        );
      }

      const apiResponse: ApiResponse<T> = {
        data: parsedData,
        status: response.status,
        headers: response.headers,
      };

      return this.applyResponseInterceptors(apiResponse);
    } catch (err) {
      throw this.applyErrorInterceptors(this.normalizeError(err));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<T>(path: string, query?: ApiRequestConfig["query"]): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "GET", path, query });
  }

  public post<T, TBody = unknown>(path: string, body?: TBody): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "POST", path, body });
  }

  public put<T, TBody = unknown>(path: string, body?: TBody): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "PUT", path, body });
  }

  public patch<T, TBody = unknown>(path: string, body?: TBody): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "PATCH", path, body });
  }

  public delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "DELETE", path });
  }

  private applyRequestInterceptors(config: ApiRequestConfig): ApiRequestConfig {
    return this.requestInterceptors.reduce((currentConfig, interceptor) => interceptor(currentConfig), config);
  }

  private applyResponseInterceptors<T>(response: ApiResponse<T>): ApiResponse<T> {
    return this.responseInterceptors.reduce(
      (currentResponse, interceptor) => interceptor(currentResponse),
      response as ApiResponse<unknown>
    ) as ApiResponse<T>;
  }

  private applyErrorInterceptors(error: ApiClientError): ApiClientError {
    return this.errorInterceptors.reduce((currentError, interceptor) => interceptor(currentError), error);
  }

  private async parseResponseBody<T>(response: Response): Promise<T> {
    try {
      const responseText = await response.text();
      if (!responseText) {
        return null as T;
      }
      return JSON.parse(responseText) as T;
    } catch (err) {
      throw createApiClientError("PARSE_ERROR", "Failed to parse API response body", response.status, err);
    }
  }

  private normalizeError(err: unknown): ApiClientError {
    if (this.isApiClientError(err)) {
      return err;
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      return createApiClientError("TIMEOUT", "Request timed out");
    }

    if (err instanceof Error) {
      return createApiClientError("NETWORK_ERROR", err.message, undefined, err);
    }

    return createApiClientError("NETWORK_ERROR", "Unknown network error", undefined, err);
  }

  private isApiClientError(err: unknown): err is ApiClientError {
    if (typeof err !== "object" || err === null) {
      return false;
    }

    const candidate = err as Partial<ApiClientError>;
    return typeof candidate.code === "string" && typeof candidate.message === "string";
  }
}

export const apiClient = new ApiClient();

