import { PrismaClient } from '@prisma/client';
import { NodeEnvs } from '@src/common/constants';
import ENV from '@src/common/constants/ENV';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Check if a PrismaClient instance already exists globally.
// If not, create a new one.
if (ENV.NodeEnv === NodeEnvs.Production) {
  prisma = new PrismaClient();
} else {
  prisma = global.prisma ??= new PrismaClient();
}

export default prisma;