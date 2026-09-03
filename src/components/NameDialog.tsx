import { useState } from "react";
import { MAX_PET_NAME_LENGTH } from "../domain/constants";
import { validateName } from "../domain/rules";

interface NameDialogProps {
  mode: "initial" | "rename";
  currentName?: string;
  onSave: (name: string) => void;
  onDismiss: () => void;
}

export function NameDialog({ mode, currentName, onSave, onDismiss }: NameDialogProps) {
  const [value, setValue] = useState(currentName ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const validated = validateName(value);
    if (validated === null) {
      setError(`Please enter a name (1-${MAX_PET_NAME_LENGTH} characters).`);
      return;
    }
    onSave(validated);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") onDismiss();
  };

  const heading = mode === "initial" ? "🐾 Name Your Pet!" : `✏️ Rename ${currentName ?? "Your Pet"}`;
  const dismissLabel = mode === "initial" ? "Skip naming" : "Cancel rename";
  const saveLabel = mode === "initial" ? "Start!" : "Save";

  return (
    <div className="name-dialog-backdrop">
      <div
        className="name-dialog"
        data-testid="name-dialog"
        role="dialog"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="name-dialog-close"
          data-testid="name-dialog-close-button"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          &times;
        </button>
        <h2 className="name-dialog-heading">{heading}</h2>
        <input
          type="text"
          className="name-dialog-input"
          data-testid="name-dialog-input"
          value={value}
          maxLength={MAX_PET_NAME_LENGTH}
          placeholder="Enter a name..."
          autoFocus
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
        />
        {error && (
          <p className="name-dialog-error" data-testid="name-dialog-error">
            {error}
          </p>
        )}
        <button
          type="button"
          className="name-dialog-save"
          data-testid="name-dialog-save-button"
          onClick={handleSave}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
