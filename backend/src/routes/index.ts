import { Router } from 'express';

import BidRouter from './BidRoutes';
import AuthRouter from './AuthRoutes';
import ProductRouter from './ProductRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

apiRouter.use('/', AuthRouter);
apiRouter.use('/product', ProductRouter);
apiRouter.use('/bid', BidRouter);



/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
