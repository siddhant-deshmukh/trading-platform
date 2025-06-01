import { Project, Bid, User, BidTrackingType } from '@prisma/client'; // Import Prisma types for input

export type ProjectWithRelations = Project & {
  selectedBid: (Bid & {
    bidder: Omit<User, 'password' | 'email' | 'contactNo'>;
  }) | null;
  owner: Omit<User, 'password' | 'email' | 'contactNo'>;
  _count: {
    bids: number;
  };
  bids?: Bid[],
  bidMsgs?: ({
    user: {
      name: string;
      id: number;
      username: string;
    };
  } & {
    id: number;
    createdAt: Date;
    message: string | null;
    bidId: number;
    userId: number;
    type: BidTrackingType;
  })[]
};

export type BidWithRelations = Bid & {
  project: (
    Project & { owner: Omit<User, 'password' | 'email' | 'contactNo'> }
  ) | null;
  bidder: Omit<User, 'password' | 'email' | 'contactNo'>;
}
