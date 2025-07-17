import { Administrador } from './administrador-entity.js'

const administradores = [
  new Administrador('admin', 'admin123'),
  new Administrador('adminAlt', 'admin456')
]

export class AdministradorRepository {
  findOne({ nombre }: { nombre: string }): Administrador | undefined {
    const admin = administradores.find(a => a.nombre === nombre)
    
    return admin
  }
}