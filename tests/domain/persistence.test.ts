import { beforeEach, describe, expect, it } from "vitest";
import { loadState, saveState } from "../../src/domain/persistence";
import { createNewPet } from "../../src/domain/factory";
import { PET_STATE_STORAGE_KEY } from "../../src/domain/constants";

describe("loadState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a fresh default pet when nothing is saved", () => {
    expect(loadState()).toEqual(createNewPet());
  });

  it("returns a fresh default pet when saved data is unparseable JSON", () => {
    localStorage.setItem(PET_STATE_STORAGE_KEY, "{not valid json");
    expect(loadState()).toEqual(createNewPet());
  });

  it("returns a fresh default pet when saved data has the wrong shape", () => {
    localStorage.setItem(PET_STATE_STORAGE_KEY, JSON.stringify({ foo: "bar" }));
    expect(loadState()).toEqual(createNewPet());
  });

  it("returns a fresh default pet when saved data is missing the graces field", () => {
    const pet = createNewPet();
    const { graces: _graces, ...withoutGraces } = pet;
    localStorage.setItem(PET_STATE_STORAGE_KEY, JSON.stringify(withoutGraces));
    expect(loadState()).toEqual(createNewPet());
  });

  it("returns the saved state when it is valid", () => {
    const pet = createNewPet();
    pet.stats.hunger = 42;
    saveState(pet);
    expect(loadState()).toEqual(pet);
  });
});
