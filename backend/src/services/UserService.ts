// src/services/userService.ts
// Service layer for User model operations.

import prisma from '../db/prisma'; // Import the Prisma client instance
import { User, Prisma } from '@prisma/client'; // Import generated Prisma types

/**
 * Creates a new user in the database.
 * @param userData The data for the new user, conforming to Prisma's UserCreateInput.
 * @returns The newly created user object.
 */
export async function createUser(userData: Prisma.UserCreateInput): Promise<User> {
  // Use Prisma's create method to insert a new user record.
  const user = await prisma.user.create({
    data: userData,
  });
  return user;
}

/**
 * Finds a user by their username.
 * @param username The username to search for.
 * @returns The user object if found, otherwise null.
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  // Use Prisma's findUnique method to find a user by their unique username.
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
}

/**
 * Finds a user by their email.
 * @param email The email to search for.
 * @returns The user object if found, otherwise null.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  // Use Prisma's findUnique method to find a user by their unique email.
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}

/**
 * Finds a user by their ID.
 * @param id The user ID to search for.
 * @returns The user object if found, otherwise null.
 */
export async function findUserById(id: number): Promise<User | null> {
  // Use Prisma's findUnique method to find a user by their unique ID.
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
}

// You can add more user-related service functions here as needed,
// e.g., updateUser, deleteUser, etc.