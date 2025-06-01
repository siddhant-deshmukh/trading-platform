import { Project, Bid } from '@prisma/client'; // Import Prisma types for input
import { ProjectWithRelations, BidWithRelations } from '@src/types' 

declare module 'express-serve-static-core' {
  interface Request {
    user_id?: number; // This will be set by an authentication middleware
    project?: ProjectWithRelations; // This will be set by the getProductByIdAndCheckOwnership middleware
    bid?: BidWithRelations;
  }
}