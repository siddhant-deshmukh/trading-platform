import { Router, Request, Response } from 'express';
import { ProjectStatus, BidStatus, BidTrackingType } from '@prisma/client';
import { body, param } from 'express-validator';
import prisma from '@src/db/prisma';
import handleValidationErrors from '@src/middleware/expressValidatorErrorHandler';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { authTokenFunction } from '@src/middleware/authToken';

const router = Router();


router.get('/', authTokenFunction(['bidder', 'owner']), async (req: Request, res: Response) => {
  const userId = req.user_id;

  if (!userId) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Unauthorized: User ID not found.' });
    return;
  }

  const bids = await prisma.bid.findMany({
    where: {
      OR: [
        { bidderId: userId },
        {
          project: {
            ownerId: userId,
          },
        },
      ],
    },
    include: {
      project: {
        select: {
          title: true,
          owner: true,
        },
      },
      bidder: {
        select: {
          username: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.status(HttpStatusCodes.OK).json(bids);
});


router.post(
  '/',
  [
    // Validation for projectId
    body('projectId')
      .notEmpty()
      .withMessage('Project ID is required.'),
    // Validation for estimatedTime
    body('estimatedTime')
      .isInt({ min: 1 })
      .withMessage('Estimated time must be a positive integer.'),
    // Validation for quote
    body('quote')
      .isDecimal({ decimal_digits: '0,2' })
      .withMessage('Quote must be a decimal number with up to 2 decimal places.')
      .toFloat(), // Convert to float for Prisma Decimal type
    // Validation for msg: optional
    body('message')
      .optional()
      .isString()
      .withMessage('Message must be a string.'),
  ],
  handleValidationErrors,
  authTokenFunction(['user']),
  async (req: Request, res: Response) => {
    const { projectId, estimatedTime, quote, message } = req.body;
    const bidderId = req.user_id; // Assumed to be set by an authentication middleware

    if (!bidderId) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Unauthorized: User ID not found.' });
      return;
    }

    // Check if the project exists and is not completed/cancelled
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, status: true },
    });

    if (!project) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ msg: 'Project not found.' });
      return;
    }

    if (project.ownerId === bidderId) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ msg: 'Forbidden: Project owner cannot bid on their own project.' });
      return;
    }

    if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.CANCELLED) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: `Cannot bid on a project with status: ${project.status}.` });
      return;
    }

    // Check if bidder has already placed a bid on this project
    const existingBid = await prisma.bid.findUnique({
      where: {
        bidderId_projectId: {
          bidderId: bidderId,
          projectId: projectId,
        },
      },
    });

    if (existingBid) {
      res.status(HttpStatusCodes.CONFLICT).json({ msg: 'You have already placed a bid on this project.' });
      return;
    }

    const newBid = await prisma.bid.create({
      data: {
        bidderId,
        projectId,
        estimatedTime,
        quote: parseFloat(quote), // Ensure it's a float for Decimal type
        message,
        bidderStatus: BidStatus.IN_PROGRESS,
        customerStatus: BidStatus.PENDING,
      },
    });
    res.status(HttpStatusCodes.CREATED).json({ msg: 'Bid created successfully!', bid: newBid });
  }
);


router.get(
  '/:bid_id',
  [
    param('bid_id')
      .notEmpty()
      .withMessage('Bid ID is required and must be a string.'),
  ],
  handleValidationErrors,
  authTokenFunction(['owner', 'bidder']), // Use middleware to fetch and check access
  (req: Request, res: Response) => {
    res.status(HttpStatusCodes.OK).json(req.bid);
  }
);


router.put(
  '/:bid_id',
  [
    param('bid_id')
      .notEmpty()
      .withMessage('Bid ID is required and must be a string.'),
    body('estimatedTime')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Estimated time must be a positive integer.'),
    body('quote')
      .optional()
      .isDecimal({ decimal_digits: '0,2' })
      .withMessage('Quote must be a decimal number with up to 2 decimal places.')
      .toFloat(),
    body('message')
      .optional()
      .isString()
      .withMessage('Message must be a string.'),
  ],
  handleValidationErrors,
  authTokenFunction(['bidder']), // Use middleware to fetch and check access
  async (req: Request, res: Response) => {
    const { estimatedTime, quote, message } = req.body;
    const bid = req.bid!;
    const userId = req.user_id;

    // Only the original bidder can update their bid
    if (bid.bidderId !== userId) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ msg: 'Forbidden: You can only update your own bids.' });
      return;
    }

    // Prevent updates if the bid has been accepted or rejected by the customer
    if (bid.customerStatus !== BidStatus.PENDING) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: `Cannot update bid, customer status is ${bid.customerStatus}.` });
      return;
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bid.id },
      data: {
        estimatedTime,
        quote: quote ? parseFloat(quote) : undefined,
        message,
        updatedAt: new Date(),
      },
    });
    res.status(HttpStatusCodes.OK).json({ msg: 'Bid updated successfully!', bid: updatedBid });
  }
);


router.delete(
  '/:bid_id',
  [
    param('bid_id')
      .notEmpty()
      .withMessage('Bid ID is required and must be a string.'),
  ],
  handleValidationErrors,
  authTokenFunction(['bidder']),
  async (req: Request, res: Response) => {
    const bid = req.bid!;
    const userId = req.user_id;

    // Only the original bidder can delete their bid
    if (bid.bidderId !== userId) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ msg: 'Forbidden: You can only delete your own bids.' });
      return;
    }

    // Prevent deletion if the bid has been accepted or rejected by the customer
    if (bid.customerStatus !== BidStatus.PENDING) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: `Cannot delete bid, customer status is ${bid.customerStatus}.` });
      return;
    }

    await prisma.bid.delete({
      where: { id: bid.id },
    });
    res.status(HttpStatusCodes.OK).json({ msg: 'Bid deleted successfully!' });
  }
);


router.post(
  '/change-status/:bid_id/',
  [
    param('bid_id')
      .notEmpty()
      .withMessage('Bid ID is required and must be a string.'),
    body('status')
      .notEmpty()
      .isIn([BidStatus.IN_PROGRESS, BidStatus.COMPLETED, BidStatus.REJECTED])
      .withMessage('Status type must be either "bidderStatus" or "customerStatus".'),
    // body('newStatus')
    //   .notEmpty()
    //   .isIn(Object.values(BidStatus))
    //   .withMessage(`New status must be one of: ${Object.values(BidStatus).join(', ')}.`),
  ],
  handleValidationErrors,
  authTokenFunction(['bidder', 'owner']),
  async (req: Request, res: Response) => {
    if (!req.bid || !req.user_id) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ msg: 'Not Found' });
      return;
    }

    const { bidderStatus: current_bidder_status, customerStatus: current_owner_status } = req.bid
    const { status } = req.body;

    let new_bid_customer_status: BidStatus | undefined;
    let new_bid_bidder_status: BidStatus | undefined;
    let new_selected_bid_id: number | undefined | null;
    let new_project_status: ProjectStatus | undefined;

    let user_name = '';

    if (req.bid.project?.ownerId === req.user_id) { //* Owner is making changes
      user_name = req.bid.project.owner.username;

      if (status == BidStatus.IN_PROGRESS && current_owner_status == BidStatus.PENDING) {
        new_bid_customer_status = BidStatus.IN_PROGRESS;
        new_selected_bid_id = req.bid.id;
        new_project_status = ProjectStatus.IN_PROGRESS;
      } else if (status == BidStatus.COMPLETED && current_owner_status == BidStatus.IN_PROGRESS) {
        new_bid_customer_status = BidStatus.COMPLETED;
        new_project_status = ProjectStatus.COMPLETED;
      } else if (status == BidStatus.REJECTED && current_owner_status == BidStatus.IN_PROGRESS) {
        new_bid_customer_status = BidStatus.REJECTED;
        new_project_status = ProjectStatus.CANCELLED;
        new_selected_bid_id = null;
      } else {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: `Status can not be changed from ${current_owner_status} to ${status}` });
        return;
      }
    } else if (req.bid.bidderId === req.user_id) { //* Bidder is making changes
      user_name = req.bid.bidder.username;

      if (status == BidStatus.IN_PROGRESS && current_bidder_status == BidStatus.PENDING) {
        new_bid_bidder_status = BidStatus.IN_PROGRESS;
      } else if (status == BidStatus.COMPLETED && current_bidder_status == BidStatus.IN_PROGRESS) {
        new_bid_bidder_status = BidStatus.COMPLETED;
      } else if (status == BidStatus.REJECTED && current_bidder_status == BidStatus.IN_PROGRESS) {
        new_bid_bidder_status = BidStatus.REJECTED;
        new_project_status = ProjectStatus.PENDING;
      } else {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ msg: `Status can not be changed from ${current_bidder_status} to ${status}` });
        return;
      }
    }
    await prisma.$transaction([
      ...(
        (new_bid_customer_status === undefined && new_bid_bidder_status === undefined) ? [] : [
          prisma.bid.update({
            where: {
              id: req.bid.id
            },
            data: {
              ...( new_bid_bidder_status !== undefined ? { bidderStatus: new_bid_bidder_status } : {}),
              ...( new_bid_customer_status !== undefined ? { customerStatus: new_bid_customer_status } : {}),
            }
          })
        ]
      ),
      ...(
        (new_selected_bid_id === undefined && new_project_status === undefined) ? [] : [
          prisma.project.update({
            where: {
              id: req.bid.projectId
            },
            data: {
              ...( new_selected_bid_id !== undefined ? { selectedBidId: new_selected_bid_id } : {}),
              ...( new_project_status !== undefined ? { status: new_project_status } : {}),
            }
          })
        ]
      ),
      prisma.bidTracking.create({
        data: {
          bidId: req.bid.id,
          message: `@${user_name} chage the staus to ${status}`,
          userId: req.user_id,
          type: BidTrackingType.SELECTION,
        }
      })
    ])
    res.status(HttpStatusCodes.OK).json({ msg: 'changed status', success: true });
  }
);

router.post(
  '/msg/:bid_id/',
  [
    param('bid_id')
      .notEmpty()
      .withMessage('Bid ID is required and must be a string.'),
    body('msg')
      .notEmpty()
      .isLength({ min: 3, max: 100 })
      .withMessage('Msg  must between  length 3-100.'),
    // body('newStatus')
    //   .notEmpty()
    //   .isIn(Object.values(BidStatus))
    //   .withMessage(`New status must be one of: ${Object.values(BidStatus).join(', ')}.`),
  ],
  handleValidationErrors,
  authTokenFunction(['bidder', 'owner']),
  async (req: Request, res: Response) => {
    if (!req.bid || !req.user_id) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ msg: 'Not Found' });
      return;
    }
    const data = await prisma.bidTracking.create({
      data: {
        bidId: req.bid.id,
        message: req.body.msg,
        userId: req.user_id,
        type: BidTrackingType.MESSAGE,
      },
      include: {
        user: {
          select: { name: true, username: true, id: true }
        }
      }
    });
    res.status(HttpStatusCodes.OK).json({ msg: 'changed status', data });
  }
);


async function addBidChangeTracking({ bidId, message, userId, typeMsg }: { bidId: number, message: string, userId: number, typeMsg: boolean }) {
  return prisma.bidTracking.create({
    data: {
      bidId,
      message,
      userId,
      type: typeMsg ? BidTrackingType.MESSAGE : BidTrackingType.SELECTION,
    }
  })
}

export default router;
