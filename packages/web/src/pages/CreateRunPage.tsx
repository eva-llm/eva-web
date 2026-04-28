import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client.ts';
import type { EvalAssert, EvalTest } from '../api/types.ts';

function generateUUIDv4(): string {
  return crypto.randomUUID();
}

const ASSERT_NAMES: EvalAssert['name'][] = [
  'b-eval',
  'g-eval',
  'llm-rubric',
  'equals',
  'not-equals',
  'contains',
  'not-contains',
  'regex',
];

const LLM_ASSERT_NAMES = new Set(['b-eval', 'g-eval', 'llm-rubric']);

interface AssertField {
  key: string;
  name: EvalAssert['name'];
  criteria: string;
  provider: string;
  model: string;
  threshold: string;
  must_fail: boolean;
}

function defaultAssert(): AssertField {
  return {
    key: crypto.randomUUID(),
    name: 'b-eval',
    criteria: '',
    provider: 'openai',
    model: 'gpt-4.1-mini',
    threshold: '0.5',
    must_fail: false,
  };
}

export default function CreateRunPage() {
  const navigate = useNavigate();

  const [evaRunUrl, setEvaRunUrl] = useState('http://localhost:3000');
  const [runId, setRunId] = useState(generateUUIDv4);
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4.1-mini');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'live' | 'audit'>('live');
  const [auditOutput, setAuditOutput] = useState('');
  const [asserts, setAsserts] = useState<AssertField[]>([defaultAssert()]);

  const mutation = useMutation({
    mutationFn: api.createRun,
    onSuccess: (data) => {
      navigate(`/runs/${data.run_id}`);
    },
  });

  const addAssert = () => setAsserts((prev) => [...prev, defaultAssert()]);

  const removeAssert = (key: string) =>
    setAsserts((prev) => prev.filter((a) => a.key !== key));

  const updateAssert = (key: string, patch: Partial<AssertField>) =>
    setAsserts((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const builtAsserts: EvalAssert[] = asserts.map((a) => {
      const base: EvalAssert = {
        name: a.name,
        criteria: a.criteria,
        must_fail: a.must_fail || undefined,
      };
      if (LLM_ASSERT_NAMES.has(a.name)) {
        base.provider = a.provider || undefined;
        base.model = a.model || undefined;
        base.threshold = a.threshold ? Number(a.threshold) : undefined;
      }
      return base;
    });

    const test: EvalTest =
      mode === 'live'
        ? { run_id: runId, provider, model, prompt, asserts: builtAsserts }
        : { run_id: runId, prompt, output: auditOutput, asserts: builtAsserts };

    mutation.mutate({ evaRunUrl, tests: [test] });
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>New Test Run</h1>
      </div>

      {mutation.isError && (
        <p className="error">{(mutation.error as Error).message}</p>
      )}

      <form onSubmit={handleSubmit} className="form">
        {/* eva-run URL */}
        <section className="form-section">
          <h2>eva-run connection</h2>
          <label className="field">
            <span>eva-run URL</span>
            <input
              type="url"
              value={evaRunUrl}
              onChange={(e) => setEvaRunUrl(e.target.value)}
              placeholder="http://localhost:3000"
              required
            />
          </label>
        </section>

        {/* Run config */}
        <section className="form-section">
          <h2>Run configuration</h2>
          <label className="field">
            <span>Run ID</span>
            <div className="input-group">
              <input
                type="text"
                value={runId}
                onChange={(e) => setRunId(e.target.value)}
                required
                className="monospace"
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setRunId(generateUUIDv4())}
              >
                ↻
              </button>
            </div>
          </label>

          <fieldset className="radio-group">
            <legend>Mode</legend>
            <label>
              <input
                type="radio"
                name="mode"
                value="live"
                checked={mode === 'live'}
                onChange={() => setMode('live')}
              />
              Live Evaluation
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="audit"
                checked={mode === 'audit'}
                onChange={() => setMode('audit')}
              />
              Audit / JQA
            </label>
          </fieldset>

          {mode === 'live' && (
            <div className="field-row">
              <label className="field">
                <span>Provider</span>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="openai"
                  required
                />
              </label>
              <label className="field">
                <span>Model</span>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-4.1-mini"
                  required
                />
              </label>
            </div>
          )}

          <label className="field">
            <span>Prompt</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              required
              placeholder="What is the capital of France?"
            />
          </label>

          {mode === 'audit' && (
            <label className="field">
              <span>Static Output (injected instead of model response)</span>
              <textarea
                value={auditOutput}
                onChange={(e) => setAuditOutput(e.target.value)}
                rows={3}
                required
                placeholder="Paris."
              />
            </label>
          )}
        </section>

        {/* Assertions */}
        <section className="form-section">
          <div className="section-header">
            <h2>Assertions</h2>
            <button type="button" className="btn-ghost" onClick={addAssert}>
              + Add Assert
            </button>
          </div>

          {asserts.map((a, idx) => (
            <div key={a.key} className="assert-card">
              <div className="assert-card-header">
                <span className="muted">Assert #{idx + 1}</span>
                {asserts.length > 1 && (
                  <button
                    type="button"
                    className="btn-danger-ghost"
                    onClick={() => removeAssert(a.key)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="field-row">
                <label className="field">
                  <span>Type</span>
                  <select
                    value={a.name}
                    onChange={(e) =>
                      updateAssert(a.key, { name: e.target.value as EvalAssert['name'] })
                    }
                  >
                    {ASSERT_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field-grow">
                  <span>Criteria / Expected value</span>
                  <input
                    type="text"
                    value={a.criteria}
                    onChange={(e) => updateAssert(a.key, { criteria: e.target.value })}
                    required
                    placeholder={
                      LLM_ASSERT_NAMES.has(a.name)
                        ? 'The answer should be factually correct'
                        : 'Paris'
                    }
                  />
                </label>
              </div>

              {LLM_ASSERT_NAMES.has(a.name) && (
                <div className="field-row">
                  <label className="field">
                    <span>Judge Provider</span>
                    <input
                      type="text"
                      value={a.provider}
                      onChange={(e) => updateAssert(a.key, { provider: e.target.value })}
                      placeholder="openai"
                    />
                  </label>
                  <label className="field">
                    <span>Judge Model</span>
                    <input
                      type="text"
                      value={a.model}
                      onChange={(e) => updateAssert(a.key, { model: e.target.value })}
                      placeholder="gpt-4.1-mini"
                    />
                  </label>
                  <label className="field">
                    <span>Threshold</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={a.threshold}
                      onChange={(e) => updateAssert(a.key, { threshold: e.target.value })}
                    />
                  </label>
                </div>
              )}

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={a.must_fail}
                  onChange={(e) => updateAssert(a.key, { must_fail: e.target.checked })}
                />
                <span>
                  must_fail{' '}
                  <span className="muted">(dark teaming / JQA)</span>
                </span>
              </label>
            </div>
          ))}
        </section>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Submitting…' : 'Submit Run →'}
          </button>
        </div>
      </form>
    </div>
  );
}
