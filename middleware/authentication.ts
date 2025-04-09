import type { IncomingMessage, ServerResponse } from "http";
import { type JwtPayload, verify } from "jsonwebtoken";
import { isTokenRevoked } from "../models";
import config from "../config";

export interface AuthenticatedRequest extends IncomingMessage {
  user?: JwtPayload | string;
}

/**
 * Middleware to authenticate a JWT token from the request headers.
 * 
 * @param {AuthenticatedRequest} req - The incoming HTTP request with optional user information.
 * @param {ServerResponse} res - The HTTP response object to send status and messages.
 * @returns {Promise<boolean>} A promise that resolves to `true` if authentication is successful, otherwise `false`.
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: ServerResponse
): Promise<boolean> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return false;
  }

  if (isTokenRevoked(token)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: "Forbidden" }));
    return false;
  }

  try {
    const decoded = verify(token, config.jwtSecret);

    req.user = decoded;
    
    return true;
  } catch (_err) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: "Forbidden" }));
    return false;
  }
};
