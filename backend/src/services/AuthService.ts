import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // For hashing and comparing passwords
import jwt from 'jsonwebtoken'; // For generating JWT tokens
import { Prisma, User } from '@prisma/client'; // Import Prisma types for input
import * as userService from '../services/UserService'; // Import user service for DB operations
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import ENV from '@src/common/constants/ENV';


export async function registerUser(req: Request, res: Response) {
 // Destructure required fields from the request body.
    const { name, username, email, password, contactNo, bio } = req.body as Partial<User>;

    if (!name || !username || !email || !password) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: 'Name, username, email, and password are required.' });
      return;
    }

    // Check if username or email already exists to prevent duplicates.
    const existingUserByUsername = await userService.findUserByUsername(username);
    if (existingUserByUsername) {
      res.status(HttpStatusCodes.CONFLICT).json({ msg: 'Username already taken.' });
      return;
    }

    const existingUserByEmail = await userService.findUserByEmail(email);
    if (existingUserByEmail) {
      res.status(HttpStatusCodes.CONFLICT).json({ msg: 'Email already registered.' });
      return;
    }

    // Hash the password before storing it in the database for security.
    // bcrypt.hash(password, saltRounds) - 10 is a good default for salt rounds.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data for creation, conforming to Prisma's UserCreateInput.
    const userData: Prisma.UserCreateInput = {
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      contactNo, // Optional field
      bio,       // Optional field
    };

    // Create the new user record in the database via the user service.
    const newUser = await userService.createUser(userData);

    // Generate a JWT token for the newly registered user.
    // The token payload typically includes user ID and any other necessary info.
    // The token expires in 1 hour (3600 seconds).
    const token = jwt.sign({ userId: newUser.id }, ENV.JwtSecret, { expiresIn: '1h' });

    // Omit the hashed password from the response for security reasons.
    const { password: _, ...userWithoutPassword } = newUser;

    // Send a success response with the new user details and the JWT token.
    res.status(HttpStatusCodes.CREATED).json({
      msg: 'User registered successfully!',
      user: userWithoutPassword,
      token,
    });
}


export async function loginUser(req: Request, res: Response, next: NextFunction) {
  // Destructure email and password from the request body.
  const { email, password } = req.body as Partial<User>;

  // Basic input validation.
  if (!email || !password) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: 'Email and password are required.' });
    return;
  }

  // Find the user by email.
  const user = await userService.findUserByEmail(email.toLowerCase());
  // If no user is found, return HttpStatusCodes.UNAUTHORIZED Unauthorized.
  if (!user) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials.' });
    return;
  }

  // Compare the provided password with the hashed password stored in the database.
  const isPasswordValid = await bcrypt.compare(password, user.password);
  // If passwords do not match, return HttpStatusCodes.UNAUTHORIZED Unauthorized.
  if (!isPasswordValid) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials.' });
    return;
  }

  // If credentials are valid, generate a JWT token for the authenticated user.
  const token = jwt.sign({ userId: user.id }, ENV.JwtSecret, { expiresIn: '1h' });

  // Omit the hashed password from the response.
  const { password: _, ...userWithoutPassword } = user;

  // Send a success response with the user details and the JWT token.
  res.status(HttpStatusCodes.OK).json({
    msg: 'Logged in successfully!',
    user: userWithoutPassword,
    token,
  });
}

export async function getProtectedUserData(req: Request, res: Response) {
  const userId = req.user_id;

  if (!userId) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'User ID not found in request (authentication failed).' });
    return;
  }

  // Fetch full user data from the database using the userId.
  const user = await userService.findUserById(userId);

  if (!user) {
    res.status(404).json({ msg: 'Authenticated user not found.' });
    return;
  }

  // Omit sensitive data before sending the response.
  const { password: _, ...userWithoutPassword } = user;

  res.status(HttpStatusCodes.OK).json({
    msg: 'Access granted to protected route!',
    userData: userWithoutPassword,
  });
}