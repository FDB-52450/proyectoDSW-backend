import { Request, Response, NextFunction} from 'express'

export function authLogin(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    next()
  } else {
    if (process.env.NODE_MODE && process.env.NODE_MODE === 'dev') {
      req.session.user = {'id': 0, 'username': 'dev'}
      next()
    } else {
      res.status(401).json({message: 'Access forbidden.'})
    }
  }
}
