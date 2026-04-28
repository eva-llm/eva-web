import type {
  AssertListResponse,
  CreateRunPayload,
  CreateRunResponse,
  RunDetailResponse,
  RunListResponse,
} from './types.ts';

const BASE = '/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  /** Create a new run — calls eva-run via the BE */
  createRun(payload: CreateRunPayload): Promise<CreateRunResponse> {
    return apiFetch<CreateRunResponse>('/runs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** List all runs with aggregate stats */
  listRuns(): Promise<RunListResponse> {
    return apiFetch<RunListResponse>('/runs');
  },

  /** Get run detail: stats + all test rows */
  getRun(runId: string): Promise<RunDetailResponse> {
    return apiFetch<RunDetailResponse>(`/runs/${encodeURIComponent(runId)}`);
  },

  /** Get assert results for a specific test */
  getAsserts(runId: string, testId: string): Promise<AssertListResponse> {
    return apiFetch<AssertListResponse>(
      `/runs/${encodeURIComponent(runId)}/tests/${encodeURIComponent(testId)}/asserts`,
    );
  },
};
