import { Request, Response, NextFunction } from 'express'
import { securityLogger } from '../shared/loggers.js'

export function authLogin(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    next()
  } else {
    securityLogger.info({ action: 'Failed access attempt', 
      data: {ip: req.ip?.replace('::ffff:', ''), endpoint: req.method + ' ' +  req.originalUrl, credentials: req.session.user || null }})

    if (process.env.NODE_MODE && process.env.NODE_MODE === 'dev') {
      req.session.user = {'id': 0, 'username': 'dev', 'role': 'superadmin'}
      next()
    } else {
      res.status(401).json({message: 'Access forbidden.'})
    }
  }
}
