export function ProgressBar({ value, label, className = '' }: { value: number; label: string; className?: string }) {
  const percent = Math.max(0, Math.min(value, 100));
  return <div role="progressbar" aria-label={label} aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100} className={`pixel-progress ${className}`}><div className="pixel-progress-fill" style={{ width: `${percent}%` }}/></div>;
}
