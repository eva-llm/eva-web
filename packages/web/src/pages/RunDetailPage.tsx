import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.ts';
import type { AssertResult } from '../api/types.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import PassRate from '../components/PassRate.tsx';

function AssertsPanel({ runId, testId }: { runId: string; testId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['asserts', testId],
    queryFn: () => api.getAsserts(runId, testId),
  });

  if (isLoading) return <p className="muted">Loading asserts…</p>;

  const asserts: AssertResult[] = data?.asserts ?? [];

  return (
    <table className="table table-sm">
      <thead>
        <tr>
          <th>Type</th>
          <th>Criteria</th>
          <th>Status</th>
          <th>Score</th>
          <th>Threshold</th>
          <th>Reason</th>
          <th>ms</th>
        </tr>
      </thead>
      <tbody>
        {asserts.map((a) => (
          <tr key={a.id}>
            <td className="monospace">{a.name}</td>
            <td className="criteria-cell">{a.criteria}</td>
            <td>
              <StatusBadge passed={a.passed} />
            </td>
            <td>{a.score.toFixed(2)}</td>
            <td>{a.threshold}</td>
            <td className="reason-cell">{a.reason}</td>
            <td>{a.diff_ms}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function RunDetailPage() {
  const { run_id } = useParams<{ run_id: string }>();
  const navigate = useNavigate();
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['run', run_id],
    queryFn: () => api.getRun(run_id!),
    enabled: !!run_id,
    refetchInterval: 10_000,
  });

  if (isLoading) return <p className="muted">Loading run…</p>;
  if (isError) return <p className="error">{(error as Error).message}</p>;
  if (!data) return null;

  const toggleTest = (testId: string) => {
    setExpandedTestId((prev) => (prev === testId ? null : testId));
  };

  return (
    <div>
      <div className="page-header">
        <button className="btn-ghost" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="monospace run-id-title">{data.run_id}</h1>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Total</span>
          <span className="stat-value">{data.total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Passed</span>
          <span className="stat-value pass">{data.passed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Failed</span>
          <span className="stat-value fail">{data.failed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pass Rate</span>
          <span className="stat-value">
            <PassRate value={data.pass_rate} />
          </span>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Prompt</th>
            <th>Output</th>
            <th>Provider / Model</th>
            <th>Total ms</th>
            <th>Assert ms</th>
          </tr>
        </thead>
        <tbody>
          {data.tests.map((test) => (
            <>
              <tr
                key={test.id}
                className={`clickable-row ${expandedTestId === test.id ? 'row-expanded' : ''}`}
                onClick={() => toggleTest(test.id)}
              >
                <td>
                  <StatusBadge passed={test.passed} />
                </td>
                <td className="truncate-cell">{test.prompt}</td>
                <td className="truncate-cell">{test.output}</td>
                <td className="monospace muted">
                  {test.provider && test.model
                    ? `${test.provider} / ${test.model}`
                    : '(audit)'}
                </td>
                <td>{test.diff_ms}</td>
                <td>{test.assert_diff_ms}</td>
              </tr>
              {expandedTestId === test.id && (
                <tr key={`${test.id}-asserts`} className="asserts-row">
                  <td colSpan={6}>
                    <AssertsPanel runId={data.run_id} testId={test.id} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
