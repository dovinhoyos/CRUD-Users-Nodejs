import type { IncomingMessage, ServerResponse } from "http";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authentication";
import {
  addCharacter,
  CharacterSchema,
  deleteCharacter,
  getAllCharacters,
  getCharacterById,
  HttpMethod,
  Role,
  updateCharacter,
  type Character,
} from "../models";
import { authorizeRoles } from "../middleware/authorization";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";

export const characterRouter = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const { method, url } = req;

  if (!(await authenticateToken(req as AuthenticatedRequest, res))) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return;
  }

  /**
   * Retrieves all characters.
   *
   * @param {IncomingMessage} req - The HTTP request object.
   * @param {ServerResponse} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the request is processed.
   */
  if (url === "/characters" && method === "GET") {
    const characters = getAllCharacters();
    res.statusCode = 200;
    res.end(JSON.stringify(characters));
    return;
  }

  /**
   * Retrieves a character by ID.
   *
   * @param {IncomingMessage} req - The HTTP request object.
   * @param {ServerResponse} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the request is processed.
   */
  if (url?.startsWith("/characters/") && method === "GET") {
    const id = parseInt(url.split("/").pop() as string, 10);
    const character = getCharacterById(id);

    if (!character) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Character not found" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(character));
    return;
  }

  /**
   * Adds a new character.
   *
   * @param {IncomingMessage} req - The HTTP request object.
   * @param {ServerResponse} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the request is processed.
   */
  if (url === "/characters" && method === "POST") {
    if (
      !(await authorizeRoles(Role.ADMIN, Role.USER)(
        req as AuthenticatedRequest,
        res
      ))
    ) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "Forbidden" }));
      return;
    }

    const body = await parseBody(req);
    const result = safeParse(CharacterSchema, body);
    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: result.issues }));
      return;
    }

    const character: Character = body;
    addCharacter(character);

    res.statusCode = 201;
    res.end(JSON.stringify(character));
    return;
  }

  /**
   * Updates an existing character by ID.
   *
   * @param {IncomingMessage} req - The HTTP request object.
   * @param {ServerResponse} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the request is processed.
   */
  if (url?.startsWith("/characters/") && method === HttpMethod.PATCH) {
    if (
      !(await authorizeRoles(Role.ADMIN, Role.USER)(
        req as AuthenticatedRequest,
        res
      ))
    ) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "Forbidden" }));
      return;
    }

    const id = parseInt(url.split("/").pop() as string, 10);
    const body = await parseBody(req);
    const character: Character = body;
    const updatedCharacter = updateCharacter(id, character);

    if (!updatedCharacter) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Character Not Found!" }));
    } else {
      res.statusCode = 200;
      res.end(JSON.stringify(updatedCharacter));
    }
    return;
  }

  /**
   * Deletes a character by ID.
   *
   * @param {IncomingMessage} req - The HTTP request object.
   * @param {ServerResponse} res - The HTTP response object.
   * @returns {Promise<void>} Resolves when the request is processed.
   */
  if (url?.startsWith("/characters/") && method === HttpMethod.DELETE) {
    if (
      !(await authorizeRoles(Role.ADMIN, Role.USER)(
        req as AuthenticatedRequest,
        res
      ))
    ) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "Forbidden" }));
      return;
    }

    const id = parseInt(url.split("/").pop() as string, 10);
    const success = deleteCharacter(id);
    if (!success) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Character Not Found!" }));
    } else {
      res.statusCode = 204;
      res.end(JSON.stringify({ message: "Character Deleted!" }));
    }
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Endpoint Not Found" }));
};
