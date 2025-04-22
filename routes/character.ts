import type { IncomingMessage, ServerResponse } from "http";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authentication";
import { getAllCharacters, getCharacterById } from "../models";

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

  if (url === "/characters" && method === "GET") {
    const characters = getAllCharacters();
    res.statusCode = 200;
    res.end(JSON.stringify(characters));
    return;
  }

  if (url === "/characters/" && method === "GET") {
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
};
