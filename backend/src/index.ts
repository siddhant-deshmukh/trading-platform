import logger from 'jet-logger';

import ENV from '@src/common/constants/ENV';
import server from './server';
import prisma from '@src/db/prisma';


/******************************************************************************
                                  Run
******************************************************************************/

const SERVER_START_MSG = ('Express server started on port: ' + 
  ENV.Port.toString());


prisma.$connect();
  
server.listen(ENV.Port, () => logger.info(SERVER_START_MSG));
