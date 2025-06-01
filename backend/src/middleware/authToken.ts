import ENV from '@src/common/constants/ENV';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import jwt from 'jsonwebtoken';
import prisma from '@src/db/prisma';

interface JwtPayload {
  userId: string;
}

export type person_type = 'all' | 'user' | 'owner' | 'bidder'

export function authTokenFunction(allow: person_type[]) {

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the Authorization header from the request.
      req.user_id = extractToken(req);

      if(!req.user_id && !allow.includes('all')) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Login / Register' });
        return
      }
      if(req.params.project_id) {
        const { project, status, msg } = await getProject(req, allow);
        if(!project) {
          res.status(status).json({msg});
          return;
        }
        req.project = project;
      }

      if(req.params.bid_id) {
        const { bid, status, msg } = await getBid(req, allow);
        if(!bid) {
          res.status(status).json({msg});
          return;
        }
        req.bid = bid;
      }

      next();
    } catch (error) {
      logger.err(error, true);
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Internal server error during token verification' });
      return;
    }
  }
}

export const authToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the Authorization header from the request.
    const authHeader = req.cookies.auth_token ?? req.headers['authorization'];
  
    // Check if the header exists and starts with 'Bearer '.
    // If not, no token is provided, so return HttpStatusCodes.UNAUTHORIZED Unauthorized.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Authorization token required' });
      return;
    }
  
    // Extract the token part (remove 'Bearer ').
    const token = authHeader.split(' ')[1];
  
    // Check if the token is actually present after splitting.
    if (!token) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Authorization token required' });
      return;
    }
    const decoded = jwt.verify(token, ENV.JwtSecret) as JwtPayload;
    req.user_id = parseInt(decoded.userId);
    next();
  } catch (error) {
    logger.err(error, true);
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Internal server error during token verification' });
    return;
  }
};

function extractToken(req: Request) {
  try {
    const authHeader = req.cookies.auth_token ?? req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Authorization token required' });
      return;
    }

    // Extract the token part (remove 'Bearer ').
    const token = authHeader.split(' ')[1];

    // Check if the token is actually present after splitting.
    if (!token) {
      // res.status(HttpStatusCodes.UNAUTHORIZED).json({ msg: 'Authorization token required' });
      return;
    }
    const decoded = jwt.verify(token, ENV.JwtSecret) as JwtPayload;
    const user_id = parseInt(decoded.userId);
    return user_id;
  } catch {
    return;
  }
}

async function getProject(req: Request, allow: person_type[]) {
  try {
    const { project_id } =req.params;
    const project = await prisma.project.findFirst({
      where: { id: parseInt(project_id) }, // Example: order by creation date
      include: {
        selectedBid: {
          include: {
            bidder: {
              omit: { 'password': true, 'email': true, 'contactNo': true }
            }
          }
        },
        owner: {
          omit: { 'password': true, 'email': true, 'contactNo': true }
        },
        _count: {
          select: {
            bids: true, // This will give you the count of bids for each project
          },
        },
      },
    });
    if(!project) return { status: HttpStatusCodes.NOT_FOUND, msg: 'Not Found' };
    
    if(allow.includes('owner') && project.owner.id === req.user_id) return { project };
    if(allow.includes('bidder') && project.selectedBid?.bidder.id == req.user_id ) return { project };
    if(allow.includes('all') || allow.includes('user')) return { project };
    
    return { status: HttpStatusCodes.UNAUTHORIZED, msg: 'Access denied' };
  } catch(err) {
    return { status: HttpStatusCodes.INTERNAL_SERVER_ERROR, msg: 'Something went wrong' };
  }
}

async function getBid(req: Request, allow: person_type[]) {
  try {
    const { bid_id } =req.params;
    const bid = await prisma.bid.findUnique({
      where: { id: parseInt(bid_id) },
      include: {
        project: {
          include: {
            owner: {
              omit: { 'password': true, 'email': true, 'contactNo': true }
            }
          }
        },
        bidder: {
          omit: { 'password': true, 'email': true, 'contactNo': true }
        }
      },
    });
  
    if(!bid) return { status: HttpStatusCodes.NOT_FOUND, msg: 'Not Found' };
    
    if(allow.includes('owner') && bid.project.owner.id === req.user_id) return { bid };
    if(allow.includes('bidder') && bid.bidderId == req.user_id ) return { bid };
    if(allow.includes('all') || allow.includes('user')) return { bid };
    
    return { status: HttpStatusCodes.UNAUTHORIZED, msg: 'Access denied' };
  } catch {
    return { status: HttpStatusCodes.INTERNAL_SERVER_ERROR, msg: 'Something went wrong' };
  }
}