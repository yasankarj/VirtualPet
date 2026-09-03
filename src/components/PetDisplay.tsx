import { MOOD_ART } from "../assets/moods";
import type { MoodState } from "../domain/types";

interface PetDisplayProps {
  name: string;
  mood: MoodState;
  onRenameClick: () => void;
}

export function PetDisplay({ name, mood, onRenameClick }: PetDisplayProps) {
  const art = MOOD_ART[mood];
  return (
    <div className="pet-display" data-testid="pet-display">
      <div className="pet-name-row">
        <span className="pet-name" data-testid="pet-display-name">
          {name}
        </span>
        <button
          type="button"
          className="pet-name-rename-button"
          data-testid="pet-display-rename-button"
          aria-label="Rename pet"
          onClick={onRenameClick}
        >
          ✏️
        </button>
      </div>
      <div className="pet-display-emoji" aria-hidden="true">
        {art.emoji}
      </div>
      <div className="pet-display-label">{art.label}</div>
    </div>
  );
}
