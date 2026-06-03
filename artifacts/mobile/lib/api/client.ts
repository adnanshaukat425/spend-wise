import type {
  AccountDto,
  AuthTokenResponse,
  BudgetSummaryDto,
  CategoryDto,
  CreateAccountRequest,
  CreateTransactionRequest,
  DashboardDto,
  InsightDto,
  NotificationDto,
  PagedResult,
  ParseVoiceRequest,
  ParseVoiceResponse,
  SubscriptionPlanDto,
  TransactionDto,
  UserPreferencesDto,
  UserProfileDto,
  UserSubscriptionDto,
  WeeklySpendDto,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let baseUrl = "";
let getAuthToken: (() => string | null) | null = null;

export function setApiBaseUrl(url: string): void {
  baseUrl = url.replace(/\/$/, "");
}

export function setAuthTokenGetter(getter: () => string | null): void {
  getAuthToken = getter;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}/api${normalized}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    auth?: boolean;
  },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options?.auth !== false) {
    const token = getAuthToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(buildUrl(path, options?.query), {
    method,
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "title" in data
        ? String((data as { title: string }).title)
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export const authApi = {
  google: (idToken: string) =>
    request<AuthTokenResponse>("POST", "/auth/google", {
      body: { idToken },
      auth: false,
    }),
  apple: (identityToken: string) =>
    request<AuthTokenResponse>("POST", "/auth/apple", {
      body: { identityToken },
      auth: false,
    }),
  refresh: (refreshToken: string) =>
    request<AuthTokenResponse>("POST", "/auth/refresh", {
      body: { refreshToken },
      auth: false,
    }),
  me: () => request<UserProfileDto>("GET", "/auth/me"),
  logout: (refreshToken: string) =>
    request<void>("POST", "/auth/logout", { body: { refreshToken } }),
};

export const usersApi = {
  me: () => request<UserProfileDto>("GET", "/users/me"),
  preferences: () => request<UserPreferencesDto>("GET", "/users/me/preferences"),
  updatePreferences: (patch: {
    notificationsEnabled?: boolean;
    currencyCode?: string;
  }) =>
    request<UserPreferencesDto>("PATCH", "/users/me/preferences", {
      body: patch,
    }),
};

export const accountsApi = {
  list: () => request<AccountDto[]>("GET", "/accounts"),
  create: (body: CreateAccountRequest) =>
    request<AccountDto>("POST", "/accounts", { body }),
  update: (id: string, body: Partial<CreateAccountRequest>) =>
    request<AccountDto>("PATCH", `/accounts/${id}`, { body }),
  remove: (id: string) => request<void>("DELETE", `/accounts/${id}`),
};

export const categoriesApi = {
  list: (type?: string) =>
    request<CategoryDto[]>("GET", "/categories", {
      query: type ? { type } : undefined,
    }),
};

export const transactionsApi = {
  list: (params?: {
    categorySlug?: string;
    from?: string;
    to?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) =>
    request<PagedResult<TransactionDto>>("GET", "/transactions", {
      query: params,
    }),
  get: (id: string) => request<TransactionDto>("GET", `/transactions/${id}`),
  create: (body: CreateTransactionRequest) =>
    request<TransactionDto>("POST", "/transactions", { body }),
};

export const budgetApi = {
  current: () => request<BudgetSummaryDto>("GET", "/budgets/current"),
  updateTotal: (totalLimit: number) =>
    request<BudgetSummaryDto>("PUT", "/budgets/current/total", {
      body: { totalLimit },
    }),
  updateLines: (lines: { categoryId: string; limitAmount: number }[]) =>
    request<BudgetSummaryDto>("PUT", "/budgets/current/lines", {
      body: { lines },
    }),
};

export const dashboardApi = {
  get: () => request<DashboardDto>("GET", "/dashboard"),
};

export const insightsApi = {
  list: () => request<InsightDto[]>("GET", "/insights"),
  weeklySpend: () => request<WeeklySpendDto>("GET", "/insights/weekly-spend"),
};

export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean; page?: number; pageSize?: number }) =>
    request<PagedResult<NotificationDto>>("GET", "/notifications", {
      query: params
        ? {
            unreadOnly: params.unreadOnly ? "true" : undefined,
            page: params.page,
            pageSize: params.pageSize,
          }
        : undefined,
    }),
  markRead: (id: string) =>
    request<NotificationDto>("PATCH", `/notifications/${id}/read`),
  markAllRead: () => request<void>("PATCH", "/notifications/read-all"),
};

export const subscriptionsApi = {
  plans: () =>
    request<SubscriptionPlanDto[]>("GET", "/subscriptions/plans", {
      auth: false,
    }),
  me: () => request<UserSubscriptionDto>("GET", "/subscriptions/me"),
  startTrial: () =>
    request<UserSubscriptionDto>("POST", "/subscriptions/start-trial"),
};

export const voiceApi = {
  parse: (body: ParseVoiceRequest) =>
    request<ParseVoiceResponse>("POST", "/voice/parse", { body }),
};
