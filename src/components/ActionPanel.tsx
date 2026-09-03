import { STAT_MAX, STAT_MIN } from "../domain/constants";

interface ActionPanelProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  isResting: boolean;
  restRemainingMs: number;
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
}

function secondsCeil(ms: number): number {
  return Math.ceil(ms / 1000);
}

export function ActionPanel({
  onFeed,
  onPlay,
  onRest,
  isResting,
  restRemainingMs,
  hunger,
  happiness,
  energy,
  health,
}: ActionPanelProps) {
  const feedDisabled = isResting || hunger <= STAT_MIN;
  const playDisabled =
    isResting || happiness >= STAT_MAX || energy <= STAT_MIN || health <= STAT_MIN;
  const restDisabled = isResting;

  return (
    <div className="action-panel">
      <button
        type="button"
        data-testid="action-panel-feed-button"
        disabled={feedDisabled}
        onClick={onFeed}
      >
        Feed
      </button>
      <button
        type="button"
        data-testid="action-panel-play-button"
        disabled={playDisabled}
        onClick={onPlay}
      >
        Play
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
