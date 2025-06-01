// Enums for various statuses
export enum ProjectStatus {
  PENDING,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED,
}

export enum BidStatus {
  COMPLETED,
  REJECTED,
  IN_PROGRESS,
  PENDING,
}

export enum BidTrackingType {
  SELECTION,
  MESSAGE,
  REJECTION,
  COMPLETION,
}


export interface ILoginUser {
  email: string;
  password: string
}

export interface IUser extends ILoginUser {
  id: number;
  name: string;
  username: string;
}

export interface IProject {
  id: 1;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: number;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  ownerId: number;
  selectedBidId: number | null;
  selectedBid?: Bid;
  owner: IUser;
  _count: {
    bids: number
  };
}

export interface Bid {
  id: number;
  bidderId: number;
  projectId: number;
  estimatedTime: number;
  quote: number;
  bidderStatus: BidStatus;
  customerStatus: BidStatus;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NextServerComponentProps {
  searchParams: Promise<{
    [key: string]: string | string[] | null
  }>,
  params: Promise<{
    [key: string]: string
  }>;
}

export type ProjectWithRelations = IProject & {
  selectedBid: (Bid & {
    bidder: Omit<IUser, 'password' | 'email' | 'contactNo'>;
  }) | null;
  owner: Omit<IUser, 'password' | 'email' | 'contactNo'>;
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
    IProject & { owner: Omit<IUser, 'password' | 'email' | 'contactNo'> }
  ) | null;
  bidder: Omit<IUser, 'password' | 'email' | 'contactNo'>;
}