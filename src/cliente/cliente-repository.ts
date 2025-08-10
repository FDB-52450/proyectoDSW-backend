import { Repository } from '../shared/repository.js'
import { Cliente } from './cliente-entity.js'
import { EntityManager } from '@mikro-orm/mysql'

export class ClienteRepository implements Repository<Cliente> {
    constructor(
      private clienteEm: EntityManager
    ) {}

    public async findAll(): Promise<Cliente[]> {
        return await this.clienteEm.findAll(Cliente, {populate: ['pedidos']})
    }

    public async findOne(item: { id: number }): Promise<Cliente | null> {
        return await this.clienteEm.findOne(Cliente, {id: item.id}, {populate: ['pedidos', 'pedidos.detalle']})
    }

    public async findByDni(item: { dni: string }): Promise<Cliente | null> {
        return await this.clienteEm.findOne(Cliente, {dni: item.dni}, {populate: ['pedidos']})
    }
  
    public async checkConstraint(item: Cliente): Promise<boolean> {
        const clienteConflict = await this.clienteEm.findOne(Cliente, {$or: [{ email: item.email }, {dni: item.dni}]})

        if (clienteConflict) return true

        return false
    }

    public async add(item: Cliente): Promise<Cliente | null> {
        try {
            await this.clienteEm.persistAndFlush(item)
            return item
        } catch (err) {
            return null
        }
    }

    public async update(item: Cliente): Promise<Cliente | null> {
        const cliente = await this.findOne(item)

        if (cliente) {
            Object.assign(cliente, item)
            await this.clienteEm.flush()
        } else {
            throw new Error()
        }

        return cliente
    }

    public async delete(item: { id: number }): Promise<Cliente | null> {
        const cliente = await this.findOne(item)

        if (cliente) {
        await this.clienteEm.removeAndFlush(cliente)
        }

        return cliente
    }
}