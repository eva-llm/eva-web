interface Props {
  passed: boolean;
  label?: string;
}

export default function StatusBadge({ passed, label }: Props) {
  return (
    <span className={`badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
      {label ?? (passed ? 'PASS' : 'FAIL')}
    </span>
  );
}
