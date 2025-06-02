import { ProjectWithRelations, BidWithRelations } from '@src/types'; 

declare module 'express-serve-static-core' {
  interface Request {
    user_id?: number; // This will be set by an authentication middleware
    project?: ProjectWithRelations; 
    bid?: BidWithRelations;
  }
}