import { Cliente } from './cliente-entity.js'
import { EntityManager } from '@mikro-orm/mysql'
import { ClienteFilters } from './clienteFilters-entity.js'

export class ClienteRepository {
    constructor(
      private clienteEm: EntityManager
    ) {}

    public async findAll(page: number, filters?: ClienteFilters): Promise<[Cliente[], number]> {
        const queryFilters: any = {} 
        const pageSize = 20
        const offset = (page - 1) * pageSize
        
        let typeSort = {}

        if (filters?.sort) {
            switch (filters.sort) {
                default: typeSort = { id: 'DESC'}; break;
            }
        } else {
            typeSort = {id: 'DESC'}
        }

        const [clientes, count] = await this.clienteEm.findAndCount(Cliente, queryFilters, {
            limit: pageSize,
            offset: offset,
            orderBy: typeSort,
        })

        return [clientes, count]
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

    public async suspend(item: { id: number, duracion: number | null, razon: string}): Promise<Cliente | null> {
        const cliente = await this.findOne(item)

        if (cliente) {
            cliente.banStart = new Date()

            if (item.duracion != null) {
                const banDate = new Date()
                banDate.setDate(banDate.getDate() + item.duracion)
                cliente.banEnd = banDate
            }

            cliente.banRazon = item.razon

            await this.clienteEm.flush()
        }

        return cliente
    }

    public async reactivate(item: { id: number }): Promise<Cliente | null> {
        const cliente = await this.findOne(item)

        if (cliente) {
            cliente.banStart = null
            cliente.banEnd = null
            cliente.banRazon = null

            await this.clienteEm.flush()
        }

        return cliente
    }
}