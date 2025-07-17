import { NextFunction, Request, Response } from 'express'
import { AdministradorRepository } from './administrador-repository.js'
import { Administrador } from './administrador-entity.js'

import session from 'express-session'

const repository = new AdministradorRepository()

function sanitizeAdminInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    password: req.body.password
  }
  
  // more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}


function login(req: Request, res: Response) {
  const { nombre, password } = req.body

  // TODO: Add cooldown mechanism to prevent brute force attacks (express-rate-limit?)

  if (!nombre || !password) {
    res.status(400).json({ message: 'Faltan credenciales.' })
  } else {
    const admin = repository.findOne({ nombre })

    if (!admin) {
      res.status(401).json({ message: 'Usuario y/o contraseña incorrectas.' })
    } else {  
      const passwordHash = Administrador.hashPassword(password)

      if (admin.passwordHash == passwordHash) {
        req.session.user = {'id': admin.id, 'username': admin.nombre};
        res.status(200).json({ message: 'Login exitoso.' })
      } else {
        res.status(401).json({ message: 'Usuario y/o contraseña incorrectas.' })
      }
    }
  }
}

function logout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.status(200).json({message: 'LOGGED OUT'})
  })
}

export {sanitizeAdminInput, login, logout}