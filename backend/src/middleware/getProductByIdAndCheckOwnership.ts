import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '@src/db/prisma';

const getProductByIdAndCheckOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const { product_id } = req.params;
  const userId = req.user_id; // Assumed to be set by a previous authentication middleware

  if (!userId) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: User ID not found in request.' });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id: parseInt(product_id) },
  });

  if (!project) {
    res.status(HttpStatusCodes.NOT_FOUND).json({ message: 'Project not found.' });
    return;
  }

  // Check if the project owner matches the authenticated user
  if (project.ownerId !== userId) {
    res.status(HttpStatusCodes.FORBIDDEN).json({ message: 'Forbidden: You do not own this project.' });
    return;
  }

  // req.project = project; // Attach the project to the request object
  next(); // Proceed to the next middleware/route handler
};

export default getProductByIdAndCheckOwnership;