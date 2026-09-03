import { useEffect, useState } from "react";
import { PetDisplay } from "./components/PetDisplay";
import { StatBar } from "./components/StatBar";
import { ActionPanel } from "./components/ActionPanel";
import { RefreshButton } from "./components/RefreshButton";
import { NameDialog } from "./components/NameDialog";
import { TICK_INTERVAL_MS } from "./domain/constants";
import { hasSavedPet, loadState, saveState } from "./domain/persistence";
import { applyFeed, applyPlay, applyRest, computeMood, renamePet, resetPet, tick } from "./domain/rules";

function App() {
  const [petState, setPetState] = useState(() => loadState());
  // First-launch detection (Refresh/Naming FR-NR3): captured once at mount, before this session's
  // own persistence effect has a chance to write anything — see hasSavedPet() for why this can't be
  // derived from petState.name (a skipped prompt still saves a valid, default-named pet).
  const [showNamingPrompt, setShowNamingPrompt] = useState(() => !hasSavedPet());
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  // Bumped by every player action to restart the tick timer below (Decay Pacing FR-DP1):
  // guarantees the next tick always lands a full TICK_INTERVAL_MS after the most recent action.
  const [tickEpoch, setTickEpoch] = useState(0);
  const restartTickClock = () => setTickEpoch((epoch) => epoch + 1);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPetState((current) => tick(current));
    }, TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [tickEpoch]);

  useEffect(() => {
    saveState(petState);
  }, [petState]);

  const mood = computeMood(petState.stats);

  const handleRefresh = () => {
    setPetState((current) => resetPet(current));
    restartTickClock();
  };

  return (
    <div className="app">
      <h1>Virtual Pet</h1>
      <PetDisplay name={petState.name} mood={mood} onRenameClick={() => setShowRenameDialog(true)} />
      <div className="stat-bars">
        <StatBar label="Hunger" value={petState.stats.hunger} isDetrimental />
        <StatBar label="Happiness" value={petState.stats.happiness} isDetrimental={false} />
        <StatBar label="Energy" value={petState.stats.energy} isDetrimental={false} />
        <StatBar label="Health" value={petState.stats.health} isDetrimental={false} />
      </div>
      <ActionPanel
        onFeed={() => {
          setPetState((current) => applyFeed(current));
          restartTickClock();
        }}
        onPlay={() => {
          setPetState((current) => applyPlay(current));
          restartTickClock();
        }}
        onRest={() => {
          setPetState((current) => applyRest(current));
          restartTickClock();
        }}
        feedRemainingMs={petState.cooldowns.feedRemainingMs}
        playRemainingMs={petState.cooldowns.playRemainingMs}
        isResting={petState.isResting}
        restRemainingMs={petState.restRemainingMs}
      />
      <RefreshButton onRefresh={handleRefresh} />
      {showNamingPrompt && (
        <NameDialog
          mode="initial"
          onSave={(name) => {
            setPetState((current) => renamePet(current, name));
            setShowNamingPrompt(false);
          }}
          // The fresh pet created by loadState() when there's no saved pet already has
          // name = DEFAULT_PET_NAME (factory.ts), so skipping needs no extra state write.
          onDismiss={() => setShowNamingPrompt(false)}
        />
      )}
      {showRenameDialog && (
        <NameDialog
          mode="rename"
          currentName={petState.name}
          onSave={(name) => {
            setPetState((current) => renamePet(current, name));
            setShowRenameDialog(false);
          }}
          onDismiss={() => setShowRenameDialog(false)}
        />
      )}
    </div>
  );
}

export default App;
