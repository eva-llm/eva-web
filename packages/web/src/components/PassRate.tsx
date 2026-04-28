interface Props {
  value: number; // 0–1
}

export default function PassRate({ value }: Props) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 90 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';

  return (
    <span style={{ color, fontWeight: 600 }}>
      {pct}%
    </span>
  );
}
