import { Request, Response, NextFunction} from 'express'
import { RequestContext } from '@mikro-orm/core';
import { orm } from '../shared/database.js';

// NOTE: This middleware is only used on endpoints where multer is used since createContext() must be executed after multer to prevent errors

export function createContext(req: Request, res: Response, next: NextFunction) {
  if (!RequestContext.getEntityManager()) {
    RequestContext.create(orm.em, next);
  } else {
    next();
  }
}