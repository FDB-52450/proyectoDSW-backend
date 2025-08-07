import { Request, Response, NextFunction} from 'express'

interface User {
    id: number,
    username: string,
    role: string
}

export function superAuthLogin(req: Request, res: Response, next: NextFunction) {
  const user = req.session?.user as User
    
  if (user && user.role === 'superadmin') {
    next()
  } else {
    if (process.env.NODE_MODE && process.env.NODE_MODE === 'dev') {
      req.session.user = {'id': 0, 'username': 'dev', 'role': 'superadmin'}
      next()
    } else {
      res.status(401).json({message: 'Access forbidden.'})
    }
  }
}
