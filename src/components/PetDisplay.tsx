import { MOOD_ART } from "../assets/moods";
import type { MoodState } from "../domain/types";

interface PetDisplayProps {
  mood: MoodState;
}

export function PetDisplay({ mood }: PetDisplayProps) {
  const art = MOOD_ART[mood];
  return (
    <div className="pet-display" data-testid="pet-display">
      <div className="pet-display-emoji" aria-hidden="true">
        {art.emoji}
      </div>
      <div className="pet-display-label">{art.label}</div>
    </div>
  );
}
