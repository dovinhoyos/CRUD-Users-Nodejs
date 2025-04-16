import { compare, hash } from "bcrypt";
import {
  email,
  minLength,
  object,
  pipe,
  string,
  type InferInput,
} from "valibot";

const emailSchema = pipe(string(), email());
const passwordSchema = pipe(string(), minLength(6));

export const authSchema = object({
  email: emailSchema,
  password: passwordSchema,
});

export enum Role {
  "ADMIN" = "admin",
  "USER" = "user",
}

export type User = InferInput<typeof authSchema> & {
  id: number;
  role: Role;
  refreshToken?: string;
};

const users: Map<string, User> = new Map();

/**
 * Create a new user with the given email and password.
 *
 * The password is hashed before storing.
 *
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<User>} - The created user
 */
export const createUser = async (
  email: string,
  password: string
): Promise<User> => {
  const hashedPassword = await hash(password, 10);

  const newUser: User = {
    id: Date.now(),
    email,
    password: hashedPassword,
    role: Role.USER,
  };

  users.set(email, newUser);
  return newUser;
};

/**
 * Finds their user by the given email
 *
 * @param {string} email - The email of the user
 * @returns {User | undefined} - The user if found, otherwise undefined
 */
export const findUserByEmail = (email: string): User | undefined => {
  return users.get(email);
};

/**
 * Validate a user´s password
 *
 * @param {User} user - The user whose password to validate
 * @param {string} password - The password to validate
 * @returns {Promise<boolean>} - True if the password is valid, otherwise false
 */
export const validatePassword = async (
  user: User,
  password: string
): Promise<boolean> => {
  return compare(password, user.password);
};

/**
 * Revoke token
 *
 * @param {string} email - The email of the user.
 * @returns {boolean} - True if the token was revoked, otherwise false.
 */
export const revokeUserToken = (email: string): boolean => {
  const foundUser = users.get(email);
  if (!foundUser) {
    return false;
  }

  users.set(email, { ...foundUser, refreshToken: undefined });
  return true;
};
