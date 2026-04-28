import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.ts';
import PassRate from '../components/PassRate.tsx';

export default function RunListPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['runs'],
    queryFn: () => api.listRuns(),
    refetchInterval: 15_000,
  });

  if (isLoading) {
    return <p className="muted">Loading runs…</p>;
  }

  if (isError) {
    return <p className="error">Failed to load runs: {(error as Error).message}</p>;
  }

  const runs = data?.runs ?? [];

  return (
    <div>
      <div className="page-header">
        <h1>Test Runs</h1>
        <button className="btn-primary" onClick={() => navigate('/runs/new')}>
          + New Run
        </button>
      </div>

      {runs.length === 0 ? (
        <div className="empty-state">
          <p>No runs yet.</p>
          <button className="btn-primary" onClick={() => navigate('/runs/new')}>
            Create your first run
          </button>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Total</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Pass Rate</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.run_id}
                className="clickable-row"
                onClick={() => navigate(`/runs/${run.run_id}`)}
              >
                <td className="monospace">{run.run_id}</td>
                <td>{run.total}</td>
                <td className="pass">{run.passed}</td>
                <td className="fail">{run.failed}</td>
                <td>
                  <PassRate value={run.pass_rate} />
                </td>
                <td className="muted">
                  {run.started_at
                    ? new Date(run.started_at).toLocaleString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
