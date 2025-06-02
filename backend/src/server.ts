import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import logger from 'jet-logger';
import express, { Request, Response, NextFunction } from 'express';

import BaseRouter from '@src/routes';
import ENV from '@src/common/constants/ENV';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/util/route-errors';
import { NodeEnvs } from '@src/common/constants';
import cookieParser from 'cookie-parser';

/******************************************************************************
                                Setup
******************************************************************************/



const app = express();


// **** Middleware **** //
app.use(cookieParser());
app.use(cors({
  origin: ENV.ClientOrigin, // Replace with your Next.js frontend URL in .env
  credentials: true, // Allow cookies to be sent
}));
// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (ENV.NodeEnv === NodeEnvs.Production) {
  // eslint-disable-next-line n/no-process-env
  if (!process.env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

// Add APIs, must be after middleware
app.use('/', BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, _next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ msg: err.message });
  }
});




/******************************************************************************
                                Export default
******************************************************************************/

export default app;
