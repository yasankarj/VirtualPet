import { beforeEach, describe, expect, it } from "vitest";
import { hasSavedPet, loadState, saveState } from "../../src/domain/persistence";
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

  it("returns a fresh default pet when saved data is missing the name field", () => {
    const pet = createNewPet();
    const { name: _name, ...withoutName } = pet;
    localStorage.setItem(PET_STATE_STORAGE_KEY, JSON.stringify(withoutName));
    expect(loadState()).toEqual(createNewPet());
  });

  it("returns the saved state when it is valid", () => {
    const pet = createNewPet();
    pet.stats.hunger = 42;
    saveState(pet);
    expect(loadState()).toEqual(pet);
  });
});

describe("hasSavedPet", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns false when nothing is saved", () => {
    expect(hasSavedPet()).toBe(false);
  });

  it("returns false when saved data is unparseable or the wrong shape", () => {
    localStorage.setItem(PET_STATE_STORAGE_KEY, "{not valid json");
    expect(hasSavedPet()).toBe(false);
  });

  it("returns true once a valid pet has been saved, even one that was never explicitly named", () => {
    saveState(createNewPet());
    expect(hasSavedPet()).toBe(true);
  });
});
