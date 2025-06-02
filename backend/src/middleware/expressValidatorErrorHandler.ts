import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/util/route-errors';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().map(error => ( typeof error.msg == 'string' ) ? error.msg : '' ).join(', ');
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, errorMessage);
  }
  next();
};

export default handleValidationErrors;