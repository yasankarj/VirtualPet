interface ActionPanelProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  feedRemainingMs: number;
  playRemainingMs: number;
  isResting: boolean;
  restRemainingMs: number;
}

function secondsCeil(ms: number): number {
  return Math.ceil(ms / 1000);
}

export function ActionPanel({
  onFeed,
  onPlay,
  onRest,
  feedRemainingMs,
  playRemainingMs,
  isResting,
  restRemainingMs,
}: ActionPanelProps) {
  const feedDisabled = feedRemainingMs > 0 || isResting;
  const playDisabled = playRemainingMs > 0 || isResting;
  const restDisabled = isResting;

  return (
    <div className="action-panel">
      <button
        type="button"
        data-testid="action-panel-feed-button"
        disabled={feedDisabled}
        onClick={onFeed}
      >
        {feedRemainingMs > 0 ? `Feed (${secondsCeil(feedRemainingMs)}s)` : "Feed"}
      </button>
      <button
        type="button"
        data-testid="action-panel-play-button"
        disabled={playDisabled}
        onClick={onPlay}
      >
        {playRemainingMs > 0 ? `Play (${secondsCeil(playRemainingMs)}s)` : "Play"}
      </button>
      <button
        type="button"
        data-testid="action-panel-rest-button"
        disabled={restDisabled}
        onClick={onRest}
      >
        {isResting ? `Sleeping... ${secondsCeil(restRemainingMs)}s` : "Rest"}
      </button>
    </div>
  );
}
