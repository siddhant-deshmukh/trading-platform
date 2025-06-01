import { body, param } from 'express-validator';
import { Router, Request, Response } from 'express';

import prisma from '@src/db/prisma';
import { ProjectStatus } from '@prisma/client';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import handleValidationErrors from '@src/middleware/expressValidatorErrorHandler';
import { authTokenFunction } from '@src/middleware/authToken';

const router = Router();

router.get('/',
  authTokenFunction(['all']),
  async (req: Request, res: Response) => {
    const { tab } = req.query;
    const userId = req.user_id;
    // Build the where clause conditionally
    const whereClause: any = {};

    if (tab === 'my_projects' && userId) {
      whereClause.ownerId = userId;
      whereClause.AND = [
        { ownerId: userId },
        // { ownerId: }
      ];
    } else if (tab === 'active_bids' && userId) {
      whereClause.AND = [
        { selectedBid: { bidderId: userId } },
        { status: { not: ProjectStatus.PENDING } }
      ];
    } else if (tab === 'bids' && userId) {
      whereClause.bids = {
        some: {
          bidderId: userId, // Filter projects that have AT LEAST ONE bid with this ownerId
        }
      }
    } else if (tab === 'open_projects' && userId) {
      whereClause.AND = [
        { ownerId: { not: userId } },
        {
          OR: [
            { selectedBid: null },
            { selectedBid: { bidderId: { not: userId } } }
          ]
        },
        { status: ProjectStatus.PENDING }
      ];
    } else {
      whereClause.status = ProjectStatus.PENDING
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // Example: order by creation date
      include: {
        selectedBid: {
          include: {
            bidder: {
            },
          }
        },
        owner: {
          omit: { password: true }
        },
        _count: {
          select: {
            bids: true, // This will give you the count of bids for each project
          },
        },
      },
    });
    res.status(HttpStatusCodes.OK).json(projects);
  });

router.post(
  '/',
  [
    // Validation for title: must not be empty
    body('title')
      .notEmpty()
      .withMessage('Title is required.'),
    // Validation for description: must not be empty
    body('description')
      .notEmpty()
      .withMessage('Description is required.'),
    // Validation for budgetMin: optional, if present must be a number
    body('budgetMin')
      .optional()
      .isDecimal()
      .withMessage('Budget Min must be a decimal number.'),
    // Validation for budgetMax: optional, if present must be a number
    body('budgetMax')
      .optional()
      .isDecimal()
      .withMessage('Budget Max must be a decimal number.'),
    // Validation for deadline: optional, if present must be a valid date
    body('deadline')
      .optional()
      .isISO8601()
      .toDate() // Convert to Date object
      .withMessage('Deadline must be a valid date (ISO8601 format).'),
    // Validation for status: optional, if present must be a valid ProjectStatus enum value
    // body('status')
    //   .optional()
    //   .isIn(Object.values(ProjectStatus))
    //   .withMessage(`Status must be one of: ${Object.values(ProjectStatus).join(', ')}.`),
  ],
  handleValidationErrors, // Apply the common error handling middleware
  authTokenFunction(['user']),
  async (req: Request, res: Response) => {
    const { title, description, budgetMin, budgetMax, deadline } = req.body;
    const ownerId = req.user_id; // Assumed to be set by an authentication middleware

    if (!ownerId) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Unauthorized: User ID not found.' });
      return;
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        deadline,
        status: ProjectStatus.PENDING, // Default to PENDING if not provided
        ownerId,
      },
    });
    res.status(HttpStatusCodes.CREATED).json({ msg: 'Project created successfully!', project: newProject });
  }
);

router.get(
  '/:project_id',
  [
    // Validation for project_id: must be a string and not empty
    param('project_id')
      .notEmpty()
      .withMessage('Product ID is required and must be a string.'),
  ],
  handleValidationErrors,
  authTokenFunction(['all', 'bidder', 'owner']),
  async (req: Request, res: Response) => {
    const project = req.project;
    if (project && project.ownerId != req.user_id && project.selectedBid?.bidderId != req.user_id) {
      project.selectedBid = null;
    }
    if (project && project.ownerId == req.user_id && !project.selectedBid) {
      project.bids = await prisma.bid.findMany({
        where: { projectId: project.id },
        include: {
          bidder: { omit: { 'password': true, 'email': true, contactNo: true } }
        },
        orderBy: { createdAt: 'desc' },
      })
    }
    if (project && req.user_id && project.selectedBid && ( project.ownerId == req.user_id || project.selectedBid?.bidderId == req.user_id)) {
      project.bidMsgs = await prisma.bidTracking.findMany({
        where: { bidId: project.selectedBid?.id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, name: true }
          }
        }
      });
    }

    if (project && req.user_id && project.ownerId != req.user_id && !project.selectedBid) {
      project.bids = await prisma.bid.findMany({
        where: { AND: { projectId: project.id, bidderId: req.user_id } },
        include: {
          bidder: { omit: { 'password': true, 'email': true, contactNo: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(HttpStatusCodes.OK).json(project);
  }
);

router.put(
  '/:project_id',
  [
    // Validation for project_id
    param('project_id')
      .notEmpty()
      .withMessage('Product ID is required and must be a string.'),
    body('title')
      .optional()
      .notEmpty()
      .withMessage('Title cannot be empty.'),
    body('description')
      .optional()
      .notEmpty()
      .withMessage('Description cannot be empty.'),
    body('budgetMin')
      .optional()
      .isDecimal()
      .withMessage('Budget Min must be a decimal number.'),
    body('budgetMax')
      .optional()
      .isDecimal()
      .withMessage('Budget Max must be a decimal number.'),
    body('deadline')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Deadline must be a valid date (ISO8601 format).'),
    // body('status')
    //   .optional()
    //   .isIn(Object.values(ProjectStatus))
    //   .withMessage(`Status must be one of: ${Object.values(ProjectStatus).join(', ')}.`),
  ],
  handleValidationErrors,
  authTokenFunction(['owner']),
  async (req: Request, res: Response) => {
    const { title, description, budgetMin, budgetMax, deadline } = req.body;
    const projectId = req.project!.id; // Get the project ID from the attached project

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        deadline,
        updatedAt: new Date(), // Manually update updatedAt if not handled by Prisma's @updatedAt
      },
    });
    res.status(HttpStatusCodes.OK).json({ msg: 'Project updated successfully!', project: updatedProject });
  }
);


router.delete(
  '/:project_id',
  [
    // Validation for project_id
    param('project_id')
      .notEmpty()
      .withMessage('Product ID is required and must be a string.'),
  ],
  handleValidationErrors,
  authTokenFunction(['owner']),
  async (req: Request, res: Response) => {
    const projectId = req.project!.id; // Get the project ID from the attached project

    await prisma.project.delete({
      where: { id: projectId },
    });
    res.status(HttpStatusCodes.OK).json({ msg: 'Project deleted successfully!' });
  }
);

export default router;
