import { useEffect, useState } from "react";
import { PetDisplay } from "./components/PetDisplay";
import { StatBar } from "./components/StatBar";
import { ActionPanel } from "./components/ActionPanel";
import { TICK_INTERVAL_MS } from "./domain/constants";
import { loadState, saveState } from "./domain/persistence";
import { applyFeed, applyPlay, applyRest, computeMood, tick } from "./domain/rules";

function App() {
  const [petState, setPetState] = useState(() => loadState());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPetState((current) => tick(current));
    }, TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    saveState(petState);
  }, [petState]);

  const mood = computeMood(petState.stats);

  return (
    <div className="app">
      <h1>Virtual Pet</h1>
      <PetDisplay mood={mood} />
      <div className="stat-bars">
        <StatBar label="Hunger" value={petState.stats.hunger} isDetrimental />
        <StatBar label="Happiness" value={petState.stats.happiness} isDetrimental={false} />
        <StatBar label="Energy" value={petState.stats.energy} isDetrimental={false} />
        <StatBar label="Health" value={petState.stats.health} isDetrimental={false} />
      </div>
      <ActionPanel
        onFeed={() => setPetState((current) => applyFeed(current))}
        onPlay={() => setPetState((current) => applyPlay(current))}
        onRest={() => setPetState((current) => applyRest(current))}
        feedRemainingMs={petState.cooldowns.feedRemainingMs}
        playRemainingMs={petState.cooldowns.playRemainingMs}
        isResting={petState.isResting}
        restRemainingMs={petState.restRemainingMs}
      />
    </div>
  );
}

export default App;
