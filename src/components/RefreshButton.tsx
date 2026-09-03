interface RefreshButtonProps {
  onRefresh: () => void;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  return (
    <div className="refresh-row">
      <button type="button" className="refresh-button" data-testid="refresh-button" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}
