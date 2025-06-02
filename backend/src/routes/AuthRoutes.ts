import handleValidationErrors from "@src/middleware/expressValidatorErrorHandler";
import { Router } from "express";
import { body } from "express-validator";
import { Request, Response } from "express";

import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import ENV from "@src/common/constants/ENV";
import prisma from '@src/db/prisma'; 
import { authToken } from "@src/middleware/authToken";

const router = Router();

router.post(
  '/register',
  [
    // Validation for name: must not be empty
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.'),
    // Validation for username: must be alphanumeric and at least 3 chars long
    body('username')
      .isAlphanumeric()
      .withMessage('Username must be alphanumeric.')
      .isLength({ min: 3 })
      .trim()
      .toLowerCase()
      .withMessage('Username must be at least 3 characters long.'),
    // Validation for email: must be a valid email format
    body('email')
      .isEmail()
      .trim()
      .toLowerCase()
      .withMessage('Please enter a valid email address.'),
    // Validation for password: must be at least 6 chars long
    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long.'),
    // Validation for contactNo: optional, but if present, must be a string
    body('contactNo')
      .trim()
      .optional()
      .isString()
      .withMessage('Contact number must be a string.'),
    // Validation for bio: optional, but if present, must be a string
    body('bio')
      .trim()
      .optional()
      .isString()
      .withMessage('Bio must be a string.'),
  ],
  handleValidationErrors, // Apply the common error handling middleware
  async (req: Request, res: Response) => {
    const { name, username, email, password, contactNo, bio } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        res.status(HttpStatusCodes.CONFLICT).json({ msg: 'Username already exists.' });
        return;
      }
      if (existingUser.email === email) {
        res.status(HttpStatusCodes.CONFLICT).json({ msg: 'Email already exists.' });
        return;
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        contactNo,
        bio,
      },
    });

    // Generate JWT token (optional, but good for immediate login after registration)
    const token = jwt.sign({ userId: newUser.id }, ENV.JwtSecret, { expiresIn: ENV.TokenExpiryTime });


    res.cookie('auth_token', `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      // domain: ENV.ServerOrigin,
      path: '/',
      maxAge: ENV.TokenExpiryTime,
      partitioned: true,
    });


    
    res.cookie('auth_token_next', `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      // domain: ENV.ClientOriginDomain,
      path: '/',
      maxAge: ENV.TokenExpiryTime,
      partitioned: true,
    });

    res.status(HttpStatusCodes.CREATED).json({
      msg: 'User registered successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  }
);


router.post(
  '/login',
  [
    // Validation for username or email: must not be empty
    body('email')
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage('Username or Email is required.'),
    // Validation for password: must not be empty
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required.'),
  ],
  handleValidationErrors, // Apply the common error handling middleware
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials.' });
      return;
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials.' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, ENV.JwtSecret, { expiresIn: ENV.TokenExpiryTime });

    res.cookie('auth_token', `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      // domain: ENV.ServerOrigin,
      path: '/',
      maxAge: ENV.TokenExpiryTime,
      partitioned: true,
    });
    res.cookie('auth_token_next', `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      // domain: ENV.ClientOriginDomain,
      path: '/',
      maxAge: ENV.TokenExpiryTime,
      partitioned: true,
    });


    res.status(HttpStatusCodes.OK).json({
      msg: 'Logged in successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  }
);

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token', { path: '/' });
  res.clearCookie('auth_token_next', { path: '/' });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get(
  '/',
  authToken,
  async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({
      where: {
        id: req.user_id,
      },
    });
    if(!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ msg: 'User Not Found' });
      return;
    }
    res.status(HttpStatusCodes.OK).json({
      msg: 'Logged in successfully!',
      user: {
        ...user,
        password: null
      },
    });
  }
);

export default router;