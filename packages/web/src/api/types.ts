// ---------------------------------------------------------------------------
// Shared types mirroring the eva-web API + eva-run schemas
// ---------------------------------------------------------------------------

export interface EvalAssert {
  name:
    | 'b-eval'
    | 'g-eval'
    | 'llm-rubric'
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'not-contains'
    | 'regex';
  criteria: string;
  threshold?: number;
  provider?: string;
  model?: string;
  options?: Record<string, unknown>;
  must_fail?: boolean;
  answer_only?: boolean;
  case_sensitive?: boolean;
}

export interface EvalTest {
  run_id: string;
  test_id?: string;
  prompt: string;
  asserts: EvalAssert[];
  // Live evaluation
  provider?: string;
  model?: string;
  options?: Record<string, unknown>;
  // JQA / Audit mode
  output?: string;
}

export interface CreateRunPayload {
  evaRunUrl?: string;
  tests: EvalTest[];
}

export interface CreateRunResponse {
  run_id: string;
  test_ids: string[];
}

export interface RunSummary {
  run_id: string;
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
  started_at: string | null;
}

export interface RunListResponse {
  runs: RunSummary[];
}

export interface TestResult {
  id: string;
  run_id: string;
  provider: string | null;
  model: string | null;
  prompt: string;
  output: string;
  passed: boolean;
  metadata: Record<string, unknown> | null;
  started_at: string;
  assert_started_at: string;
  finished_at: string;
  diff_ms: number;
  assert_diff_ms: number;
  output_diff_ms: number;
}

export interface RunDetailResponse {
  run_id: string;
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
  tests: TestResult[];
}

export interface AssertResult {
  id: string;
  test_id: string;
  run_id: string;
  name: string;
  criteria: string;
  passed: boolean;
  score: number;
  reason: string;
  threshold: number;
  metadata: Record<string, unknown> | null;
  started_at: string;
  finished_at: string;
  diff_ms: number;
}

export interface AssertListResponse {
  asserts: AssertResult[];
}
