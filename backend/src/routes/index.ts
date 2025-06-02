import { Router } from 'express';

import BidRouter from './BidRoutes';
import AuthRouter from './AuthRoutes';
import ProjectRouter from './ProjectRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

apiRouter.use('/', AuthRouter);
apiRouter.use('/project', ProjectRouter);
apiRouter.use('/bid', BidRouter);



/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
