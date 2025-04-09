import { minLength, object, pipe, string, type InferInput } from "valibot";

export const CharacterSchema = object({
  name: pipe(string(), minLength(6)),
  lastname: pipe(string(), minLength(6)),
});

export type Character = InferInput<typeof CharacterSchema> & { id: number };

const characters: Map<number, Character> = new Map();

export const getAllCharacters = (): Character[] => {
  return Array.from(characters.values());
};

export const getCharacterById = (id: number): Character | undefined => {
  return characters.get(id);
};

export const addCharacter = (character: Character): Character => {
  const newCharacter = {
    ...character,
    id: new Date().getTime(),
  };

  characters.set(newCharacter.id, newCharacter);
  return newCharacter;
};

export const updateCharacter = (
  id: number,
  updatedCharacter: Character
): Character | null => {
  if (!characters.has(id)) {
    console.error(`Character with id ${id} not found`);
    return null;
  }

  characters.set(id, updatedCharacter);
  return updatedCharacter;
};

export const deleteCharacter = (id: number): boolean => {
  if (!characters.has(id)) {
    console.error(`Character with id ${id} not found`);
    return false;
  }

  characters.delete(id);
  return true;
};
