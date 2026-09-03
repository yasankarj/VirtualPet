interface StatBarProps {
  label: string;
  value: number;
  isDetrimental: boolean;
}

// isDetrimental flips the color scale: for Hunger, high = bad (red); for the others, high = good (green).
function colorFor(value: number, isDetrimental: boolean): string {
  const goodness = isDetrimental ? 100 - value : value;
  if (goodness >= 60) return "#4caf50";
  if (goodness >= 30) return "#ffc107";
  return "#f44336";
}

export function StatBar({ label, value, isDetrimental }: StatBarProps) {
  return (
    <div className="stat-bar" data-testid={`stat-bar-${label}`}>
      <div className="stat-bar-label">
        {label}: {value}
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${value}%`, backgroundColor: colorFor(value, isDetrimental) }}
        />
      </div>
    </div>
  );
}
