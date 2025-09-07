import { Request, Response } from 'express'
import { AdministradorRepository } from './administrador-repository.js'
import { Administrador } from './administrador-entity.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import { auditLogger, securityLogger } from '../shared/loggers.js'

function getRepo() {
  const em = RequestContext.getEntityManager()
  return new AdministradorRepository(em as SqlEntityManager)
}

async function findAll(req: Request, res: Response) {
  const repository = getRepo()
  const admins = await repository.findAll()

  if (admins.length == 0) {
    res.status(404).send({ message: 'No hay admins disponibles.'})
  } else {
    res.json({data: admins})
  }
}

async function findOne(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  const admin = await repository.findOne({ id })

  if (!admin) {
    res.status(404).send({ message: 'Admin no encontrado.' })
  } else {
    res.json({ data: admin })
  }
}

async function add(req: Request, res: Response) {
  const repository = getRepo()
  const input = req.body
  const adminInput = new Administrador(input.nombre, input.password)

  const check = await repository.checkConstraint(input)

  if (!check) {
    const admin = await repository.add(adminInput)

    if (!admin) {
      res.status(409).send({ message: 'Admin ya existente.'})
    } else {
      auditLogger.info({entity: 'admin', action: 'create', user: req.session.user, data: admin})

      res.status(201).send({ message: 'Admin creado con exito.', data: admin})
    }
  } else {
    res.status(409).send({ message: 'Admin ya existente.' })
  }
}

async function update(req: Request, res: Response) {
  req.body.id = Number(req.params.id)

  if (req.body.password) {
    req.body.passwordHash = Administrador.hashPassword(req.body.password)
    delete req.body.password
  }
  
  const repository = getRepo()
  const input = req.body
  const check = await repository.checkConstraint(input)

  if (!check) {
    const admin = await repository.update(input)
    delete input.passwordHash

    if (!admin) {
      res.status(404).send({ message: 'Admin no encontrado.' })
    } else {
      auditLogger.info({entity: 'admin', action: 'update', user: req.session.user, data: input})

      res.status(200).send({ message: 'Admin actualizado con exito.', data: admin })
    }
  } else {
    res.status(409).send({ message: 'Nombre de admin ya en uso.' })
  }
}

async function remove(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  let admin: Administrador | null

  try {
    admin = await repository.delete({ id })
  } catch (err) {
    res.status(500).send({ message: err})
    return
  }

  if (!admin) {
    res.status(404).send({ message: 'Admin no encontrado.' })
  } else {
    auditLogger.info({entity: 'admin', action: 'delete', user: req.session.user, data: admin})

    res.status(200).send({ message: 'Admin borrado con exito.' })
  }
}

async function login(req: Request, res: Response) {
  const { nombre, password } = req.body
  const repository = getRepo()
  const admin = await repository.findByName({ nombre })

  if (!admin) {
    securityLogger.info({ action: 'Failed login attempt', data: {ip: req.ip?.replace('::ffff:', ''), username: nombre, reason: 'invalid username'}})

    res.status(401).json({ message: 'Usuario y/o contraseña incorrectas.' })
  } else {  
    const passwordHash = Administrador.hashPassword(password)

    if (admin.passwordHash == passwordHash) {
      req.session.user = {'id': admin.id, 'username': admin.nombre, 'role': admin.role};
      securityLogger.info({ action: 'Successful login attempt', data: {ip: req.ip?.replace('::ffff:', ''), credentials: req.session.user }})

      res.status(200).json({ message: 'Login exitoso.' })
    } else {
      securityLogger.info({ action: 'Failed login attempt', data: {ip: req.ip?.replace('::ffff:', ''), username: nombre, reason: 'invalid password'}})

      res.status(401).json({ message: 'Usuario y/o contraseña incorrectas.' })
    }
  }
}

function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    securityLogger.info({ action: 'Succesful logout attempt', data: {ip: req.ip?.replace('::ffff:', ''), credentials: req.session.user }})
    res.clearCookie('connect.sid')
    res.status(200).json({message: 'Logout exitoso.'})
  })
}

function me(req: Request, res: Response) {
    const user = req.session.user

    res.json({user})
}

export { findAll, findOne, add, update, remove, login, logout, me }