/** Payload accepted by POST /api/runs */
export interface CreateRunBody {
  /** eva-run server URL (overrides EVA_RUN_URL env var) */
  evaRunUrl?: string;
  /** Array of test configs forwarded verbatim to eva-run POST /eval */
  tests: EvalTest[];
}

/** Minimal test config — mirrors eva-run's TestSchema */
export interface EvalTest {
  run_id: string;
  test_id?: string;
  prompt: string;
  asserts: EvalAssert[];
  // Live evaluation fields
  provider?: string;
  model?: string;
  options?: Record<string, unknown>;
  // Audit / JQA mode
  output?: string;
}

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

/** Response from eva-run POST /eval */
export interface EvalResponse {
  test_ids: string[];
}
