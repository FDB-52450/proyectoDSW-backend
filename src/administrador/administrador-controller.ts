import { Request, Response } from 'express'
import { AdministradorRepository } from './administrador-repository.js'
import { Administrador } from './administrador-entity.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

function getRepo() {
  const em = RequestContext.getEntityManager()
  return new AdministradorRepository(em as SqlEntityManager)
}

async function login(req: Request, res: Response) {
  const { nombre, password } = req.body
  const repository = getRepo()
  const admin = await repository.findOne({ nombre })

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

function logout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.status(200).json({message: 'Logout exitoso.'})
  })
}

export {login, logout}